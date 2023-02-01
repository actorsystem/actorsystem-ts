
# Rabbi

Build Better Typescript Services Faster With More Smiles

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

## Installation

Typescript and `ts-node` are required in your PATH to run rabbi apps. 

```
npm install -g rabbi
```



###### Publishing Messages

First install rabbi into your typescript app:

```
npm install --save rabbi
```

Once connected to the amqp server cluster any application component may publish messages the exchange with a routing key and a json object

```
import { publish } from 'rabbi'

const exchange = 'midasvalley'

const routingkey = 'lease.created'

const json = {
  lessor: 'Dan',
  lessee: 'Jan',
  term: {
    period: 'month',
    number: 12
  },
  price: {
    currency: 'XBT',
    value: 1
  }
}

await publish(exchange, routingkey, json)

```
The above json will be automatically serialzed into a binary buffer and published to all listeners within the `midasvalley` exchange interested in the topic `lease.created`. These values are simply demo values.

## Basic Actors Usage

Rabbi uses a directory and file naming convention to speed up writing and
deploying new apps based on the reactive messaging and actor model.

### Command Line

All actors should be under directories such as `./actors/{actor_name}/actor.ts`.

```
/my/app/directory> rabbi start
```

### Programmatic Use

All actors should be under directories such as `./{actor_name}/actor.ts`.

import { startActorsDirectory } from 'rabbi';

startActorsDirectory(__dirname);

```

# Bunnies

Microservices Actor Toolchain for RabbitMQ

Build more services faster, better and with more smiles.

Extracted out of patterns used in my work on a multitute of live systems.

Simplifies an abstracts the creation of actors that respond to messages received
via AMQP.

Each actor maintains its own single queue of messages from which it pulls and
reacts to messages.

Sane defaults for managing amqp state make previously tedious code warm and
fuzzy, like a bunny.

## Architecture

According to AMQP best practices bunnies will connect a single socket to
the AMQP server provided by the AMQP_URL environment variable. This singleton
connection is used automatically when starting all actors, unless another
connection is specified explicitly.

You can also get a handle on the singleton connection by running

```
import { getConnection } from 'bunnies';

let connection = await getConnection();

```

`getConnection` will always return a single connection reused by all callers in
a given process.


## Library

Each actor consumes messages from a single rabbitmq queue. On startup the
actor will establish connection with your AMQP server, assert the specified
exchange and queue, and bind the queue to the exchange with the routing key.

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

#### Re-Using An Existing AMQP Connection

It may not be idea to connect a separate TCP socket for every single actor.
Instead, optionally provide an `amqp.Connection` when creating Actor.

```

import { connect, Connection } from 'amqplib';

let connection: Connection = await connect();

let actor = Actor.create({
  
  exchange,

  routingkey,

  queue,

  connection

})
```

The above will still create a new channel but will re-use the existing
connection.

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

