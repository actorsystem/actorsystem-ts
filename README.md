
# Rabbi

Microservices Controller for RabbitMQ

```
## Installation

Typescript and `ts-node` are required in your PATH to run rabbi apps. 

```
npm install -g rabbi

```

## Basic Usage

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

# Rabbi

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

According to AMQP best practices Rabbi will connect a single socket to
the AMQP server provided by the AMQP_URL environment variable. This singleton
connection is used automatically when starting all actors, unless another
connection is specified explicitly.

You can also get a handle on the singleton connection by running

```
import { getConnection } from 'rabbi';

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

## Configuring Multiple Actors per Process 

A single node.js process requires 200MB of RAM just to smoothly run the V8
runtime and load all of your code objects into memory, even for the most basic
Actor. However the additional resource overhead of adding a second Actor to a
single operating  system process is significantly less, likely under 1 MB per
Actor or less. Rabbi establishes a single TCP connection to amqp per process so
including additional Actors leads to only new logical rabbimtq channel but no
new physical network connections.

Thus we can scale Rabbi from only less than a dozen Actors per virtual machine
to many hundreds of actors per virtual machine. Higher level orchestration
frameworks can schedule Rabbi processes such that the total number of Actors are
split up evenly in processes based on the number of CPU cores available on the
host system. For each one core Rabbi may run one process in parallel with
processes on other cores. Within each operating system process Rabbi runs any
number of co-routines concurrently. Co-routines will block each other only on
blocking calls for computation or blocking IO. Since Rabbi Actors react
passively to new events many can be run at once.

### Loading Configuration File

By default Rabbi will search for a configuration file in json format at the
standard linux config file location:

`/etc/rabbi/rabbi.conf.json`

When this file is not found rabbi will search the current working directory for
a configuration json file and load that:

`${pwd}/rabbi.conf.json`

If neither of these files is present Rabbi will fall back to using the default
configuration.

To customize the search path for your Rabbi configuration file you may
optionally provide an environment variable at runtime called
`RABBI_CONFIG_FILE_PATH`. When specified the path will be used and if a file is
found it will take precedence over all other configuration file options.

### Example Configuration For Multiple Actors

Most Rabbi applications will run a decent number of Actors in parallel, often
concurrently within the same operating system process. In the follow example
configuration file we specify which actors we would like to run in this process.

This simple app is a wallet which has a balance and can send and receive
payments. We have actors named UpdateBalance, SendPayment, ReceivePayment which
we would like to run. By convention the actors are stored at files with their
names in snake_case such that the actor named `UpdateBalance` lives in
`actors/update_balance/actor.ts`. Use the snake_case version of your actor in
the Rabbi configuration file section array called `actors`.

```
#/etc/rabbi/rabbi.conf.json
{
  "actors": [
    "update_balance",
    "send_payment",
    "receive_payment"
  ]
}
```

From your terminal in the root of your Rabbi project run `rabbi start` to start
rabbi with the three actors listed in your configuration file. Rabbi will look
in the unix standard location for your configuration and load all three actors.
Congratulations your app is now running three actors and can respond to sending
and receiving payments by updating your balance

