'use strict';
const axios = require('axios');
const { isDraft } = require('strapi-utils').contentTypes;
const { sanitizeEntity } = require('strapi-utils');

/**
 * `utils` service.
 */

var self = module.exports = {
  sendErrorToSlack: async (error, machine, user, transaction) => {
    let blocks = [];
    let contextBlocks = [];
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: "💣 An Error occured"
      }
    });
    if (machine && machine.id && machine.label) {
      contextBlocks.push({
        type: "mrkdwn",
        text: `*Machine:* ${machine.label} \n`
      })
    }
    if (user && user.id && user.email) {
      contextBlocks.push({
        type: "mrkdwn",
        text: `*User:* ${user.email} - <${process.env.API_URL}/admin/plugins/content-manager/collectionType/plugins::users-permissions.user/${user.id}|Backend Profile>\n`
      })
    }
    if (transaction && transaction.id) {
      contextBlocks.push({
        type: "mrkdwn",
        text: `*Transaction:* ${transaction.id} - <${process.env.API_URL}/admin/plugins/content-manager/collectionType/application::transactions.transactions/${transaction.id}|See More>\n`
      })
    }
    if (error) {
      blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*Error data:* -"+error.message+"\n```\n"+JSON.stringify(error, null, 2)+"\n```"
      }})
    }
    blocks.push({
      type: "section",
      fields: contextBlocks
    })
    return await axios.post(process.env.SLACK_WEBHOOK_URL, {
      blocks: blocks
    })
  },

  sendTransactionNotification: async (transactionEvent) => {
    return await axios.post(process.env.WEBHOOK_URL_TRANSACTION, {
      ...transactionEvent
    }, {
      headers: {
        Authorization: `Bearer ${process.env.WEBHOOK_URL_BEARER}`
      }
    })
  },

  
  userFindOrCreate: async (customer) => {
    let user;
    const existingUser = await strapi.query('user', 'users-permissions').findOne({ email: customer.email })
    /** if exists, return */
    if (existingUser) {
      user = existingUser;
    }
    /** else, create new user */
    else {
      if (customer.id) {
        delete customer.id;
      }
      user = await strapi.query('user', 'users-permissions').create({
        email: customer.email,
        username: customer.email,
        confirmed: true,
        blocked: true,
        customerId: customer.customerId,
        role: process.env.DEFAULT_END_USER_ROLE_ID
      })
    }
    return sanitizeEntity(user, { model: strapi.plugins['users-permissions'].models.user });
  },

  saveCheckStateEventInHistory: async (success, response, machine, user) => {
      
    /** create transaction as checkstate is the first event of a transaction flow */
      const newTransaction = await strapi.services.transactions.create({
        user: user.id,
        machine: machine.id,
        status: success ? 'purchasing' : 'error'
      })

      const label = success ? 'Check State Success' : 'Check State Failed';

      /** create transaction event for history */
      return await strapi.services['transaction-events'].create({
        transaction: newTransaction.id,
        user: user.id,
        machine: machine.id,
        label: label,
        type: 'machine',
        name: response.command,
        status: success ? 'success' : 'error',
        message: success ? response.command_data.json_data.message : response.command_data.error_data.message,
        data: response
      })
  },

  handleCheckStateEvent: async (message, machine, user) => {

    strapi.log.debug("Event: Check State %j", message);

    if ( !message.command 
      || !message.command_data
      || !message.command_data.status
      || !message.command_data.json_data 
      || !message.command_data.error_data ) {
      throw { success: false, message, machine, user }
    }
    let success;
    let transactionEvent;
    if (message.command === 'check_machine_state_success' && Number(message.command_data.status) === 1) {
      success = true;
      transactionEvent = await self.saveCheckStateEventInHistory(success, message, machine, user)
      return { success, transactionId: transactionEvent.transaction.id, transactionEvent }
    }
    if (message.command === 'check_machine_state_error' || Number(message.command_data.status) !== 1) {
      success = false;
      transactionEvent = await self.saveCheckStateEventInHistory(success, message, machine, user)
      throw { success, transactionId: transactionEvent.transaction.id, transactionEvent }
    }
  },

  saveRequestBegunEventInHistory: async (success, response, machine, user, transaction) => {

    const label = success ? 'Request Begun Success' : 'Request Begun Error'

    /** create transaction event for history */
    return await strapi.services['transaction-events'].create({
      transaction: transaction.id,
      user: user.id,
      machine: machine.id,
      label: label,
      type: 'transaction',
      name: response.command,
      status: success ? 'success' : 'error',
      message: success ? response.command_data.json_data.message : response.command_data.error_data.message,
      data: response
    })
  },

  handleRequestBegun: async (message, machine, user, transaction) => {

    strapi.log.debug("Event: Request Begun %j", message);

    /** check missing data */
    if ( !message.command 
      || !message.command_data
      || !message.command_data.status
      || !message.command_data.json_data 
      || !message.command_data.error_data ) 
      {
      throw { success: false, message, machine, user, transaction }
    }

    let success;
    let transactionEvent;
    if (message.command === 'smart_fridge_request_begun' && Number(message.command_data.status) === 1) {
      success = true;
      transactionEvent = await self.saveRequestBegunEventInHistory(success, message, machine, user, transaction)
      return { success,  message, machine, user, transactionEvent }
    }
    if (Number(message.command_data.status) !== 1) {
      success = false;
      transactionEvent = await self.saveRequestBegunEventInHistory(success, message, machine, user, transaction)
      throw { success,  message, machine, user, transactionEvent }
    }
  },

  saveDoorOpenEventInHistory: async (success, response, machine, user, transaction) => {

    const label = success ? 'Door Open Success' : 'Door Open Error'

    return await strapi.services['transaction-events'].create({
      transaction: transaction.id,
      user: user.id,
      machine: machine.id,
      label: label,
      type: 'transaction',
      name: response.command,
      status: success ? 'success' : 'error',
      message: success ? response.command_data.json_data.message : response.command_data.error_data.message,
      data: response
    })
  },

  handleDoorOpenSuccess: async (message, machine, user, transaction) => {

    strapi.log.debug("Event: Door Open Success %j", message);

    /** check missing data */
    if ( !message.command 
      || !message.command_data
      || !message.command_data.status
      || !message.command_data.json_data 
      || !message.command_data.error_data ) 
      {
      throw { success: false, message, machine, user, transaction }
    }

    let success;
    let transactionEvent;
    if (Number(message.command_data.status) === 1) {
      success = true;
      transactionEvent = await self.saveDoorOpenEventInHistory(success, message, machine, user, transaction)
      return { success,  message, machine, user, transactionEvent }
    }
    if (Number(message.command_data.status) !== 1) {
      success = false;
      transactionEvent = await self.saveDoorOpenEventInHistory(success, message, machine, user, transaction)
      throw { success,  message, machine, user, transactionEvent }
    }
  },

  saveProductTakenEventInHistory: async (success, response, machine, user, transaction) => {
    // let productName = '';
    // if (response.command_data.json_data.list.length > 0) {
    //   productName = response.command_data.json_data.list[response.command_data.json_data.list.length].description
    // }
    const label = success ? 'Product Taken' : 'Product Taken Error';

    return await strapi.services['transaction-events'].create({
      transaction: transaction.id,
      user: user.id,
      machine: machine.id,
      label: label,
      type: 'transaction',
      name: response.command,
      status: success ? 'success' : 'error',
      message: success ? response.command_data.json_data.message : response.command_data.error_data.message,
      data: response
    })
  },

  handleProductTaken: async (message, machine, user, transaction) => {

    strapi.log.debug("Event: Product Taken %j", message);

    /** check missing data */
    if ( !message.command 
      || !message.command_data
      || !message.command_data.status
      || !message.command_data.json_data 
      || !message.command_data.error_data ) 
      {
      throw { success: false, message, machine, user, transaction }
    }

    let success;
    let transactionEvent;
    if (Number(message.command_data.status) === 1) {
      success = true;
      transactionEvent = await self.saveProductTakenEventInHistory(success, message, machine, user, transaction)
      return { success,  message, machine, user, transactionEvent }
    }
    if (Number(message.command_data.status) !== 1) {
      success = false;
      transactionEvent = await self.saveProductTakenEventInHistory(success, message, machine, user, transaction)
      throw { success,  message, machine, user, transactionEvent }
    }
  },

  saveDoorCloseEventInHistory: async (success, response, machine, user, transaction) => {

    const label = success ? 'Door Close Success' : 'Door Close Error'

    return await strapi.services['transaction-events'].create({
      transaction: transaction.id,
      user: user.id,
      machine: machine.id,
      label: label,
      type: 'transaction',
      name: response.command,
      status: success ? 'success' : 'error',
      message: success ? response.command_data.json_data.message : response.command_data.error_data.message,
      data: response
    })
  },

  handleDoorCloseSuccess: async (message, machine, user, transaction) => {

    strapi.log.debug("Event: Door Close Success %j", message);

    /** check missing data */
    if ( !message.command 
      || !message.command_data
      || !message.command_data.status
      || !message.command_data.json_data 
      || !message.command_data.error_data ) 
      {
      throw { success: false, message, machine, user, transaction }
    }

    let success;
    let transactionEvent;
    if (Number(message.command_data.status) === 1) {
      success = true;
      transactionEvent = await self.saveDoorCloseEventInHistory(success, message, machine, user, transaction)
      return { success,  message, machine, user, transactionEvent }
    }
    if (Number(message.command_data.status) !== 1) {
      success = false;
      transactionEvent = await self.saveDoorCloseEventInHistory(success, message, machine, user, transaction)
      throw { success,  message, machine, user, transactionEvent }
    }
  },

  saveRequestCompletedEventInHistory: async (success, response, machine, user, transaction) => {

    let label = success ? 'Request Completed Success' : 'Request Completed Error';
    let status = success ? 'success' : 'error';
    if (!success && Number(response.command_data.error_data.code) === -10) {
      strapi.log.debug("TEST 3: in loop");
      label = 'Request Completed & Canceled';
      status = 'empty';
    }
    strapi.log.debug("TEST 2: success:", success);
    strapi.log.debug("TEST 2: label:", label);
    strapi.log.debug("TEST 2: status:", status);

    const validTransactionData = await strapi.entityValidator.validateEntityUpdate(
      strapi.models.transactions,
      {
        status: status,
        products: success ? response.command_data.json_data.data.transaction_product : ''
      },
      { isDraft: isDraft(transaction, strapi.models.transactions) }
    );

    const entry = await strapi.query('transactions').update({ id: transaction.id }, validTransactionData);
    strapi.log.debug("TEST 4: transaction: %j", entry);
    return await strapi.services['transaction-events'].create({
      transaction: transaction.id,
      user: user.id,
      machine: machine.id,
      label: label,
      type: 'transaction',
      name: response.command,
      status: success ? 'success' : 'error',
      message: success ? response.command_data.json_data.message : response.command_data.error_data.message,
      data: response
    })
  },

  handleRequestCompleted: async (message, machine, user, transaction) => {

    strapi.log.debug("Event: Request Completed %j", message);

    // {"command":"smart_fridge_request_completed","command_data":{"status":"0","error_data":{"code":"-10","message":"This VDPS transaction has been canceled & closed"},"json_data":[]},"ref":"1649839656"
    /** check missing data */
    if ( !message.command 
      || !message.command_data
      || !message.command_data.status
      || !message.command_data.json_data 
      || !message.command_data.error_data ) 
      {
      throw { success: false, message, machine, user, transaction }
    }

    let success;
    let transactionEvent;
    if (Number(message.command_data.status) === 1) {
      strapi.log.debug("TEST 1: command === 1");
      success = true;
      transactionEvent = await self.saveRequestCompletedEventInHistory(success, message, machine, user, transaction)
      strapi.log.debug("TEST 1: after command");
      return { success,  message, machine, user, transactionEvent }
    }
    if (Number(message.command_data.status) !== 1) {
      strapi.log.debug("TEST 1: command !== 1");
      success = false;
      transactionEvent = await self.saveRequestCompletedEventInHistory(success, message, machine, user, transaction)
      strapi.log.debug("TEST 1: after command");
      return { success,  message, machine, user, transactionEvent }
    }
  },


};
