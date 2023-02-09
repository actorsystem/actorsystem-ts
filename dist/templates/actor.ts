/* implements rabbi actor protocol */

require('dotenv').config();

import { Actor, Joi, log } from 'rabbi';

export default async function start() {

  Actor.create({

    exchange: 'rabbi',

    routingkey: '',

    queue: '',

  })
  .start(async (channel, msg, json) => {

    log.info(msg.content.toString());

    log.info(json);

    channel.ack(msg);

  });

}

if (require.main === module) {

  start();

}
