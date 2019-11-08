
import {connect, Connection, Channel} from 'amqplib';

var channel: Channel;

import * as waitPort from 'wait-port';

import * as url from 'url';

import { log } from './logger';

var connection: Connection;

var connecting = false;
var channelIsConnected = false;

require('dotenv').config();

const AMQP_URL = process.env.AMQP_URL || 'amqp://guest:guest@127.0.0.1:5672/';

(async function() {

  connection = await getConnection();
 
  channel = await connection.createChannel();  

  channelIsConnected = true;
  
})();
 

export async function awaitChannel() {

  while (!channelIsConnected) {

    await wait(100);

  }

  return channel;

}

export async function getConnection() {

  while (connecting) {

    await wait(100);

  }

  if (!connection) {

    connecting = true;

    let parsed = url.parse(AMQP_URL);

    await waitPort({
      host: parsed.hostname,
      port: parseInt(parsed.port)
    });

    connection = await connect(AMQP_URL);

    connecting = false;

    log.info('bunnies.amqp.connected');

  }

  return connection;

}
  
function wait(ms) {

  return new Promise((resolve, reject) => {

    setTimeout(resolve, ms);

  });

}
