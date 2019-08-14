
import {connect, Connection} from 'amqplib';

import * as waitPort from 'wait-port';

import * as url from 'url';

import { log } from './logger';

var connection: Connection;

var connecting = false;

require('dotenv').config();

const AMQP_URL = process.env.AMQP_URL || 'amqp://guest:guest@127.0.0.1:5672/';

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
