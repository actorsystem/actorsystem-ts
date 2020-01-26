/* implements rabbi actor protocol */

require('dotenv').config();

import { Actor, Joi, log } from '../../lib/rabbi';
import { getChannel } from '../../lib/amqp';

export async function start() {

  let channel = await getChannel();

  await channel.assertExchange('anypay', 'topic');

  Actor.create({

    exchange: 'anypay',

    routingkey: 'tmp.rabbi',

    queue: 'rabbi_tmp',

    schema: Joi.object() // optional, enforces validity of json schema

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

