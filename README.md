# Bunnies

Microservices Toolchain for RabbitMQ

Extracted out of patterns used in my work on a multitute of live systems.

## Library

Each actor consumes messages from a single rabbitmq queue.

Usage

```
import {
  Actor,
  amqp
} from 'bunnies';

let connection = await amqp.connect();

let service = new Actor(connection, {

  queue: 'potentialmatches'

});

service.start();

```

## Events

Each actor is also an Event Emitter, emitting the following events:

- message.received
- message.acked
- message.nacked
- amqp.disconnected
- amqp.connected
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

