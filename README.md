# Bunnies

Microservices Toolchain for RabbitMQ

Extracted out of patterns used in my work on a multitute of live systems.

## Library

Each actor consumes messages from a single rabbitmq queue.

Usage

```
import { Actor, log } from 'bunnies';

import { connect } from 'amqplib';

(async () => {

  // connects to AMQP_URL environment variable

  let actor = Actor.create({

    exchange: 'orders',

    routingkey: 'ordercreated',

    queue: 'printorderreceipt'

  });

  await actor.start(async (channel, msg) => {

    log.info('print order receipt', msg.content.toString());

    await channel.ack(msg);

    log.info('message acknowledged', msg.content.toString());

  });

  // publish example message with order uid as content

  let buffer = new Buffer('cf9418e8-eb0f-4c7e-88a3-4aca045a30f2');

  await actor.channel.publish('orders', 'ordercreated', buffer);

})();

```

## Events

Each actor is also an Event Emitter, emitting the following events:

- exchange.created
- queue.created
- binding.created

- amqp.connected
- amqp.disconnected

- message.received
- message.acked
- message.nacked

- error

## File System

Actors are exported as javascript modules. Each module must export an Actor
which implements the bunnies.Actor interface.

## Command Line Tool

Microservices can be run one or more at a time from the command line using the
`bunnies` command.


To run all actors
```
sh> bunnies --dir=./actors


```
sh> bunnies -a actors/matcher.js -a actors/rpc.js -a actors/websocket.js

```

```
sh> bunnies -bind universalgoldtrust|payments|ugt.payments \
            -queue ugt.payments \
            -exec process_payments.sh \
            -cleanup
```

