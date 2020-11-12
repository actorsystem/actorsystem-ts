
import { connect, Connection, Channel, Message } from 'amqplib';

import { EventEmitter } from 'events';

import { log } from './logger';

import { getConnection } from './amqp';

const publicIp = require('public-ip');

import * as os from 'os';

import * as Joi from 'joi';

import * as bsv from 'bsv';

export class Actor extends EventEmitter {

  connection?: any;

  channel?: any;

  actorParams: ActorConnectionParams;
  
  privateKey: bsv.PrivateKey;

  id: string;

  hostname: string;

  ip: string;

  schema: Joi.Schema;

  heartbeatMilliseconds: number = 10000; // Timeout from setInterval

  heartbeatInterval: any; // Timeout from setInterval

  toJSON(): any {

    return {

      exchange: this.actorParams.exchange,

      routingkey: this.actorParams.routingkey,

      queue: this.actorParams.queue,

      queueOptions: this.actorParams.queueOptions,

      id: this.privateKey.toAddress().toString(),

      hostname: this.hostname,

      ip: this.ip

    };

  }

  connectAmqp(connection?: any): Promise<any> {
    return new Promise(async (resolve, reject) => {

      if (connection) {

        this.connection = connection;

      } else {

        this.connection = await getConnection();

        log.info(`rabbi.amqp.connected`);
      }

      this.channel = await this.connection.createChannel();

      log.info('rabbi.amqp.channel.created');

      this.channel.checkExchange(this.actorParams.exchange, async (err) => {

        if (err) {

          console.log('err', err)
          await this.channel.assertExchange(this.actorParams.exchange, 'topic');

        }

        await this.channel.assertQueue(this.actorParams.queue, this.actorParams.queueOptions);

        log.info('rabbi.amqp.binding.created', this.toJSON());

        await this.channel.bindQueue(
          this.actorParams.queue,
          this.actorParams.exchange,
          this.actorParams.routingkey
        );

        await this.channel.prefetch(3);

        resolve(this.channel);

      })

    })

  }

  constructor(actorParams: ActorConnectionParams) {

    super();

    this.hostname = os.hostname();

    this.actorParams = actorParams;

    if (!actorParams.queue) {
      this.actorParams.queue = actorParams.routingkey;
    }

    if (!actorParams.routingkey) {
      this.actorParams.routingkey = actorParams.queue;
    }

    if (!this.privateKey) {
      this.privateKey = new bsv.PrivateKey();
      this.id = this.privateKey.toAddress().toString()
    }

  }

  static create(connectionInfo: ActorConnectionParams) {

    let actor = new Actor(connectionInfo);

    return actor;
  }

  async defaultConsumer(channel: Channel, msg: Message, json?: any) {

    let message = this.toJSON();

    message.message = msg.content.toString();

    log.info(message);

  }

  async stop() {

    if (this.heartbeatInterval) {

      clearInterval(this.heartbeatInterval);

    }
    
  }

  async start(consumer?: (channel: any, msg: any, json?: any) => Promise<void>) {

    process.on('SIGINT', async () => {

      await this.channel.publish('rabbi', 'actor.stopped', Buffer.from(JSON.stringify(
        this.toJSON()
      )));


      setTimeout(() => {

        this.channel.close();

        process.kill(process.pid, 'SIGKILL');

      }, 500)

    })


    var json;

    let channel = await this.connectAmqp(this.actorParams.connection);

    this.ip = await publicIp.v4();

    await channel.publish('rabbi', 'actor.started', Buffer.from(JSON.stringify(
      this.toJSON()
    )));

    this.heartbeatInterval = setInterval(async () => {

      await channel.publish('rabbi', 'actor.heartbeat', Buffer.from(JSON.stringify(
        this.toJSON()
      )));

    }, this.heartbeatMilliseconds);

    channel.consume(this.actorParams.queue, async (msg) => {

      try {

        json = JSON.parse(msg.content.toString());

      } catch(error) {

      }

      if (this.schema) {

        let result = this.schema.validate(json);

        if (result.error) {

          log.error('schema.invalid', result.error);

          return channel.ack(msg);
  
        }

      }

      if (consumer) {

        try {

          let result = await consumer(channel, msg, json);

        } catch(error) {

          console.error('rabbi.exception.caught', error.message);

          await channel.ack(msg); // auto acknowledge

        }

      } else {

        this.defaultConsumer(channel, msg, json);

      }


    });

  }

}

export interface ActorConnectionParams {

  exchange: string;

  routingkey: string;

  queue: string;

  connection?: Connection;

  schema?: Joi.Schema;

  queueOptions?: object;  

}

