
import {connect, Connection, Channel} from 'amqplib';

const waitPort = require('wait-port')

import * as url from 'url';

import { log } from './logger';

var connection: Connection;
var channel: Channel;

var connecting = false;

require('dotenv').config();

const AMQP_URL: string = process.env.AMQP_URL || 'amqp://guest:guest@127.0.0.1:5672/';

const defaultExchange = process.env.AMQP_EXCHANGE || 'default';

export function publish(routingkey: string, message: Object): Promise<boolean>;
export function publish(exchange: string, routingkey: string, message: Object): Promise<boolean>;

export async function publish(a: string, b: string | Object, c?: Object | undefined): Promise<boolean> {

  let channel = await getChannel()

  var exchange, routingkey: string;
  var message: Object;

  if (c) {

    exchange = a;
    routingkey = b as string;
    message = c;

  } else {

    exchange = defaultExchange;
    routingkey = a;
    message = b;

  }

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
      port: parseInt(String(parsed.port)),
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
  
function wait(ms: number) {

  return new Promise((resolve, reject) => {

    setTimeout(resolve, ms);

  });

}
