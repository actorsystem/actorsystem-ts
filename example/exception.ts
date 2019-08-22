
import { Actor, log } from '../lib/rabbi';
import * as delay from 'delay';

(async () => {

  let actor = Actor.create({

    exchange: 'orders',

    routingkey: 'ordercreated',

    queue: 'printorderreceipt',

  });

  var i = 0;

  await actor.start(async (channel, msg, json) => {

    if (i++ < 5) {

      throw new Error('this should be caught');

    }

    log.info('print order receipt', msg.content.toString());

    return channel.ack(msg);

  });

  // publish example message with order uid as content

  let buffer = new Buffer('cf9418e8-eb0f-4c7e-88a3-4aca045a30f2');

  await actor.channel.publish('orders', 'ordercreated', buffer);

  await delay(300);
  await actor.channel.publish('orders', 'ordercreated', buffer);
  await delay(300);
  await actor.channel.publish('orders', 'ordercreated', buffer);
  await delay(300);
  await actor.channel.publish('orders', 'ordercreated', buffer);
  await delay(300);
  await actor.channel.publish('orders', 'ordercreated', buffer);
  await delay(300);
  await actor.channel.publish('orders', 'ordercreated', buffer);
  await delay(300);
  await actor.channel.publish('orders', 'ordercreated', buffer);

  setTimeout(() => {

    process.exit(0);

  }, 500);

})()


