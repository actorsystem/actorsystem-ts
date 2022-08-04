
import {connect, Connection, Channel} from 'amqplib';

import * as waitPort from 'wait-port';

import * as url from 'url';

import { log } from './logger';

var connection: Connection;
var channel: Channel;

var connecting = false;

require('dotenv').config();

const AMQP_URL = process.env.AMQP_URL || 'amqp://guest:guest@127.0.0.1:5672/';

export async function publish(exchange: string, routingkey: string, message: any) {

  let channel = await getChannel()

  return channel.publish(exchange, routingkey, Buffer.from(JSON.stringify(message)))

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
      port: parseInt(parsed.port),
      output: 'silent'
    });

    connection = await connect(AMQP_URL);

    connecting = false;

    log.debug('amqp.amqp.connected');

  }

  return connection;

}

export async function getChannel() {

  if (channel) {

    return channel;
  }

  let conn = await getConnection();

  channel = await conn.createChannel();

  return channel;

}
  
function wait(ms) {

  return new Promise((resolve, reject) => {

    setTimeout(resolve, ms);

  });

}
