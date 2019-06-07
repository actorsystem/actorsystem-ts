
import {connect, Connection} from 'amqp-connection-manager';

import { log } from './logger';

var connection: Connection;

var connecting = false;

require('dotenv').config();

export async function getConnection() {

  while (connecting) {

    await wait(100);

  }

  if (!connection) {

    connecting = true;

    connection = await connect(process.env.AMQP_URL);

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
