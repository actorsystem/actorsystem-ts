/* implements rabbi actor protocol */

require('dotenv').config();

import { Actor, Joi, log } from '../../lib/rabbi';
import { getChannel } from '../../lib/amqp';

export async function start() {

  let channel = await getChannel();

  Actor.create({

    exchange: 'anypay',

    routingkey: 'tmp.rabbi',

    queue: 'test_autoDelete',

    schema: Joi.object(), // optional, enforces validity of json schema

    autoDelete: true

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

