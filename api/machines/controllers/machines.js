const { parseMultipartData, sanitizeEntity } = require("strapi-utils");
const WebSocketAsPromised = require("websocket-as-promised"); // doc: https://github.com/vitalets/websocket-as-promised
const WebSocket = require("ws");

module.exports = {

    /**
   * POST
   * Request status of the machine as a user
   * allows using id path param either as strapi id or vendorId with ?isVendorId=true
   * Helps tracking potential errors
   */
  async getStatusAsUser(ctx) {
    const { id } = ctx.params;
    const {isVendorId } = ctx.query;
    let machine;
    if (isVendorId && isVendorId === 'true') {
      machine = await strapi.services.machines.findOne({ vendorId: id });
    } else {
      machine = await strapi.services.machines.findOne({ id });
    }
    machine = sanitizeEntity(machine, { model: strapi.models.machines });

    // TODO send error if !machine

    let data;
    /** handling multipart submission - not tested - file upload not supported */
    if (ctx.is('multipart')) {
      data = parseMultipartData(ctx).data;
    } else {
      data = ctx.request.body
    }

    /** find user if exists, or create */
    const user = await strapi.services.utils.userFindOrCreate(data.customer)

     /** handling communication with Vendron Smart fridge Websocket API */
    const wsp = new WebSocketAsPromised(process.env.VENDRON_WS_BASE_URL, {
      createWebSocket: (url) => new WebSocket(url),
      extractMessageData: (event) => event,
      packMessage: (data) => JSON.stringify(data),
      unpackMessage: (data) => JSON.parse(data),
      attachRequestId: (data, requestId) =>
        Object.assign({ ref: requestId }, data),
      extractRequestId: (data) => data && data.ref,
    });
    try {
      await wsp.open();
      wsp.onClose.addListener(() => strapi.log.info(`Connections closed`));
      wsp.onError.addListener((event) => strapi.log.error(event));

      /** sends event & wait for the technical acknowledgment response */
      const acknowledgment = await wsp.sendRequest({
        command: "check_machine_state",
        command_data: {
          public_api_token: process.env.VENDRON_API_KEY,
          machine_uid: machine.vendorId,
        },
      });

      /** sends event & wait for the business logic response */
      const vendronResponse = await wsp.waitUnpackedMessage(
        (data) => data && data.ref === acknowledgment.ref,
        { timeout: process.env.VENDRON_WS_TIMEOUT_MS }
      );

      /** handle checkstate event:
       * - create a new transaction
       * - create event in transaction history
       * - returns appropriate success status and transaction event
       */
      return await strapi.services.utils.handleCheckStateEvent(vendronResponse, machine, user);

    } catch (error) {
      strapi.log.error(error);
      strapi.services.utils.sendErrorToSlack(error, machine, user, transaction);
      ctx.send({
        ok: false,
        error
      })
    } finally {
      await wsp.close();
      wsp.removeAllListeners()
    }
  },



  /**
   * POST
   * Request opening the door for a user
   * allows using id path param either as strapi id or vendorId with ?isVendorId=true
   */
  async openDoor(ctx) {
    const { id } = ctx.params;
    const {isVendorId } = ctx.query;

    let machine;
    if (isVendorId && isVendorId === 'true') {
      machine = await strapi.services.machines.findOne({ vendorId: id });
    } else {
      machine = await strapi.services.machines.findOne({ id });
    }
    machine = sanitizeEntity(machine, { model: strapi.models.machines });

    // TODO send error if !machine

    /** handling multipart submission - not tested - file upload not supported */
    let data;
    if (ctx.is('multipart')) {
      data = parseMultipartData(ctx).data;
    } else {
      data = ctx.request.body
    }
    
    // TODO
    // TODO
    // TODO check required properties id && customer stuffs
    // req: customer.customerId
    // req: machineid or vendorId
    // req: transaction.id
    // opt: paymentName
    // opt: authorizedAmount

    /** find user and transaction */
    const userData = await strapi.query('user', 'users-permissions').findOne({ customerId: data.customer.customerId })
    const user = sanitizeEntity(userData, { model: strapi.plugins['users-permissions'].models.user });
    const transactionData = await strapi.services.transactions.findOne({id: data.transaction.id });
    const transaction = sanitizeEntity(transactionData, { model: strapi.models.transactions });
    // handle no transaction ?

     /** handling communication with Vendron Smart fridge Websocket API */
    const wsp = new WebSocketAsPromised(process.env.VENDRON_WS_BASE_URL, {
      createWebSocket: (url) => new WebSocket(url),
      extractMessageData: (event) => event,
      packMessage: (data) => JSON.stringify(data),
      unpackMessage: (data) => JSON.parse(data),
      attachRequestId: (data, requestId) =>
        Object.assign({ ref: requestId }, data),
      extractRequestId: (data) => data && data.ref,
    });
    try {
      await wsp.open();
      wsp.onClose.addListener(() => strapi.log.info(`Connections closed`));
      wsp.onError.addListener((event) => strapi.log.error(event));

      /** sends request event & wait for the technical acknowledgment response */
      await wsp.sendRequest({
        command: "smart_fridge_request",
        command_data: {
          public_api_token: process.env.VENDRON_API_KEY,
          machine_uid: machine.vendorId,
          payment_name: data.paymentName ? data.paymentName : process.env.DEFAULT_PAYMENT_NAME,
          currency: "EUR",
          total_amount: data.authorizedAmount ? String(data.authorizedAmount) : process.env.DEFAULT_AUTHORIZED_AMOUNT,
          payment_detail: `user:${user.id}_transaction:${transaction.id}`
        },
      });

      /** sends event & wait for the business logic response */
      const requestBegunResponse = await wsp.waitUnpackedMessage(
        // can't us the ref as filter as vendron API doesn't follow their own specs
        (data) => data && (data.command === 'smart_fridge_request_begun' | 'smart_fridge_request_error'),
        { timeout: process.env.VENDRON_WS_TIMEOUT_MS }
      );

      /** handle request_begun event:
       * - create event in transaction history
       * - returns appropriate success status and transaction event
       */
      const requestBegunEvent = await strapi.services.utils.handleRequestBegun(requestBegunResponse, machine, user, transaction);

      /** sends event & wait for the technical acknowledgment response */
      await wsp.sendRequest({
        command: "smart_fridge_door_open",
        command_data: {
          public_api_token: process.env.VENDRON_API_KEY,
          machine_uid: machine.vendorId,
          payment_name: data.paymentName ? data.paymentName : process.env.DEFAULT_PAYMENT_NAME,
          currency: "EUR",
          total_amount: data.authorizedAmount ? String(data.authorizedAmount) : process.env.DEFAULT_AUTHORIZED_AMOUNT,
          payment_detail: `user:${user.id}_transaction:${transaction.id}`,
          session: requestBegunResponse.command_data.json_data.data.session
        },
      });

      /** sends event & wait for the business logic response */
      const doorOpenResponse = await wsp.waitUnpackedMessage(
        (data) => data && data.command === 'smart_fridge_door_open_success',
        { timeout: process.env.VENDRON_WS_TIMEOUT_MS }
      );


      /** handle door_open_success event:
       * - create event in transaction history
       * - returns appropriate success status and transaction event
       */
      const doorOpenEvent = await strapi.services.utils.handleDoorOpenSuccess(doorOpenResponse, machine, user, transaction);

      /** register listeners to handle late events before returning the API reponse */
      wsp.onUnpackedMessage.addListener(async (message) => {

        try {

          strapi.log.debug('late message', message)

          /** handle product_taken event:
           * - create event in transaction history
           * - returns appropriate success status and transaction event
           */
          if (message.command === 'smart_fridge_product_taken') {
            const productTakenEvent = await strapi.services.utils.handleProductTaken(message, machine, user, transaction);
          }
          
          /** handle door_close_success event:
           * - create event in transaction history
           * - returns appropriate success status and transaction event
           */
          if (message.command === 'smart_fridge_door_close_success') {
          const doorCloseEvent = await strapi.services.utils.handleDoorCloseSuccess(message, machine, user, transaction);
          }


          /** handle request_completed event:
           * - create event in transaction history
           * - returns appropriate success status and transaction event
           */
           if (message.command === 'smart_fridge_request_completed') {
            const requestCompletedEvent = await strapi.services.utils.handleRequestCompleted(message, machine, user, transaction);

            // disconnect ws when final message
            await wsp.close();
            wsp.removeAllListeners()
          }
        } catch (error) {
          strapi.log.error(error);
          await wsp.close();
          wsp.removeAllListeners();
          strapi.services.utils.sendErrorToSlack(error, machine, user, transaction);
        }
         
      });

      return { ...doorOpenEvent };

    } catch (error) {
      strapi.log.error(error);
      strapi.services.utils.sendErrorToSlack(error, machine, user, transaction);
      ctx.send({
        ok: false,
        error
      })
    }
  }
};
