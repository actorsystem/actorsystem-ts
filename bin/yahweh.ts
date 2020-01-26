#!/usr/bin/env ts-node

require('dotenv').config();

import { Actor } from '../lib/actor';
import { getChannel } from '../lib/amqp';
import { log } from '../lib/logger';

import * as Hapi from 'hapi';

import { actorHeartbeat, actorStarted, actorStopped, actorError, listHosts, listActors } from '../lib/actors';

async function start() {

  let channel = await getChannel();

  channel.assertExchange('rabbi', 'topic');

  let actor = Actor.create({

    exchange: 'rabbi',

    routingkey: 'actor.started',

    queue: 'rabbi_handle_actor_started'

  })
  .start(async (channel, msg, json) => {

    console.log('actor.started', json);
    //log.info(JSON.stringify(json));

    actorStarted(json);

    channel.ack(msg);

  });

  Actor.create({

    exchange: 'rabbi',

    routingkey: 'actor.stopped',

    queue: 'rabbi_handle_actor_stopped'

  })
  .start(async (channel, msg, json) => {

    console.log('actor.stopped', json);
    //log.info(JSON.stringify(json));

    actorStopped(json);

    channel.ack(msg);

  });

  Actor.create({

    exchange: 'rabbi',

    routingkey: 'actor.error',

    queue: 'rabbi_handle_actor_error'

  })
  .start(async (channel, msg, json) => {

    console.log('actor.error', json);
    //log.info(JSON.stringify(json));

    actorError(json);

    channel.ack(msg);

  });

  Actor.create({

    exchange: 'rabbi',

    routingkey: 'actor.heartbeat',

    queue: 'rabbi_handle_actor_heartbeat'

  })
  .start(async (channel, msg, json) => {

    console.log('actor.heartbeat', json);

    actorHeartbeat(json);

    channel.ack(msg);

  });

  const server = Hapi.server({
    port: process.env.YAHWEH_PORT || 5200,
    host: '0.0.0.0',
    routes: {
      cors: true
    }
  });

  await server.register(require('hapi-auth-basic'));
  server.auth.strategy("yahweh", "basic", { validate: (req, user, pass) => {

    if (user.toLowerCase() !== 'yahweh') {

      return {

        isValid: false

      }

    }

    try {

      if (process.env.YAHWEH_PASSWORD) {

        if (pass !== process.env.YAHWEH_PASSWORD) {

          return {

            isValid: false

          }
          
        }

      }

      return {

        isValid: true,

        credentials: {

          admin: true

        }

      }

    } catch(error) {

      log.error(error.message);

      return {

        isValid: false

      }

    }
  
  }});

  server.route({
    method: 'GET',
    path: '/api/dashboard',
    handler: async (request, h) => {

      let hosts = await listHosts();
      let actors = await listActors();

      return { hosts, actors }

    },
    config: {
      auth: 'yahweh'
    }
  });

  await server.start();
  console.log('Server running on %s', server.info.uri);

}

start();
