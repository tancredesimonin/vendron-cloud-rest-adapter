'use strict';

import { WebSocketServer } from "ws";

 module.exports = ({ env }) => {
    const wss = new WebSocketServer({server: strapi.server})

    wss.on('connection', function connection(ws) {
        ws.on('message', (data) => {
            const string = data.toString();
            const json = JSON.parse(string);
            console.log(json)
        })
    })
  };
