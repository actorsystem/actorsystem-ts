
import { Actor, log, Joi } from '../lib/rabbi';

import * as amqp from 'amqplib';

(async () => {

  // connects to AMQP_URL environment variable

  let actor = Actor.create({

    exchange: 'orders',

    routingkey: 'ordercreated',

    queue: 'printorderreceipt',

    schema: Joi.object().keys({

      order_id: Joi.number().integer().required(),

      memo: Joi.string()

    })

  });

  await actor.start(async (channel: amqp.Channel, msg: amqp.Message, json) => {

    log.info('print order receipt', msg.content.toString());

    await channel.ack(msg);

    log.info('message acknowledged', msg.content.toString());

    log.info('json parsed', json);

    /*
    setTimeout(() => {

      //process.exit(0);

    }, 500);
    */

  });

  // publish example message with order uid as content

  let buffer = new Buffer(JSON.stringify({

    order_id: 1324345,

    memo: '2 skinny scouts',

  }));

  await actor.channel.publish('orders', 'ordercreated', buffer);

})()

