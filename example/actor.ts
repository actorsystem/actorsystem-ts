
import { Actor, log } from '../lib/rabbi';

import { connect } from 'amqplib';

(async () => {

  // connects to AMQP_URL environment variable

  let actor = Actor.create({

    exchange: 'orders',

    routingkey: 'ordercreated',

    queue: 'printorderreceipt'

  });

  await actor.start(async (channel, msg) => {

    console.log(msg);

    log.info('print order receipt', msg.content.toString());

    await channel.ack(msg);

    log.info('message acknowledged', msg.content.toString());

    /*
    setTimeout(() => {

      //process.exit(0);

    }, 500);
    */

  });

  // publish example message with order uid as content

  let buffer = new Buffer('cf9418e8-eb0f-4c7e-88a3-4aca045a30f2');

  await actor.channel.publish('orders', 'ordercreated', buffer);

})()

