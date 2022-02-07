const { sanitizeEntity } = require('strapi-utils');

module.exports = {
  /**
   * Retrieve a record.
   *
   * @return {Object}
   */

  async getStatus(ctx) {
    const { id } = ctx.params;

    const entity = await strapi.services.machines.findOne({ id });
    await strapi.services.websocket.checkMachineState(entity.vendorId);
    return sanitizeEntity(entity, { model: strapi.models.machines });
  },
};
