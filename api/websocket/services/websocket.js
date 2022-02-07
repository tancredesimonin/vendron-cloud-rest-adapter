'use strict';

const { WebSocket } = require("ws");

/**
 * `websocket` service.
 */

module.exports = {
  checkMachineState: async (machineUID) => {
    try {
      const client = new WebSocket('ws://localhost:3000');
      let message = {
        command:"check_machine_state",
        command_data:{
        public_api_token:"XXXX",
        machine_uid: machineUID
        },
        ref:"12345"
        }
      client.on('open', function open() {
        client.send(JSON.stringify(message))
      });
      
      client.on('message', function message(data) {
        const string = data.toString();
        const json = JSON.parse(string);
        strapi.log.debug('received: %j', json);
      });
    } catch (error) {
      
    }    
  }
};
