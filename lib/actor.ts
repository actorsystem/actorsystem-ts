
import { connect, Connection, Channel, Message } from 'amqplib';

import * as uuid from 'uuid'

import { EventEmitter } from 'events';

import { log } from './logger';

import { getConnection } from './amqp';

import  Ajv from 'ajv'

const ajv = new Ajv()

const publicIp = require('public-ip');

import * as os from 'os';

import * as Joi from 'joi';

import * as bsv from 'bsv';

export class Actor extends EventEmitter {

  connection?: Connection | null;

  channel?: Channel | null;

  actorParams: ActorConnectionParams;
  
  privateKey: bsv.PrivateKey;

  consumerTag?: string;

  id: string;

  hostname: string;

  ip: string;

  schema?: Joi.Schema;

  validateSchema?: any;

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

      if (this.actorParams.connection) {

        this.connection = this.actorParams.connection;

      } else {

        this.connection = await getConnection();

        log.info(`rabbi.amqp.connected`);
      }

      if (this.actorParams.channel) {

        this.channel = this.actorParams.channel

      } else {

        this.channel = await this.connection.createChannel();

      }

      log.info('rabbi.amqp.channel.created');

      //this.channel.checkExchange(this.actorParams.exchange, async (err) => {

        await this.channel.assertExchange(this.actorParams.exchange, this.actorParams.exchangeType);

        await this.channel.assertQueue(this.actorParams.queue, this.actorParams.queueOptions);

        log.info('rabbi.amqp.binding.created', this.toJSON());

        await this.channel.bindQueue(
          this.actorParams.queue,
          this.actorParams.exchange,
          this.actorParams.routingkey
        );

        await this.channel.prefetch(this.actorParams.prefetch || 1);

        resolve(this.channel);

      //})

    })

  }

  constructor(actorParams: ActorConnectionParams) {

    super();

    this.consumerTag = uuid.v4();

    this.hostname = os.hostname();

    this.actorParams = actorParams;

    if (!actorParams.queue) {
      this.actorParams.queue = actorParams.routingkey;
    }

    if (!actorParams.exchangeType) {
      this.actorParams.exchangeType = 'direct';
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

    this.channel.cancel(this.consumerTag)

    if (this.heartbeatInterval) {

      clearInterval(this.heartbeatInterval);

    }
    
  }

  async start(consumer?: (channel: any, msg: any, json?: any) => Promise<void>) {

    var json;

    let channel = await this.connectAmqp(this.actorParams.connection);

    await channel.assertExchange('rabbi', 'direct')

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

      if (consumer) {

        try {

          let result = await consumer(channel, msg, json);

        } catch(error) {

          console.error('rabbi.exception.caught', error.message);

          // TODO: Send Message to UnhandledExceptions exchange

        }


      } else {

        this.defaultConsumer(channel, msg, json);

      }

      await channel.ack(msg); // auto acknowledge

    }, {

      consumerTag: this.consumerTag

    });

  }

}

export interface ActorConnectionParams {

  exchange: string;

  routingkey: string;

  queue: string;

  connection?: Connection;

  channel?: Channel;

  prefetch?: number;

  schema?: Joi.Schema;

  queueOptions?: object; 

  exchangeType?: string;

}

