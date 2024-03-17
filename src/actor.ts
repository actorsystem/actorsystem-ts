
import { Connection, Channel, Message } from 'amqplib';

import * as uuid from 'uuid'

import { EventEmitter } from 'events';

import { log } from './logger';

import { getConnection } from './amqp';

import * as Joi from '@hapi/joi';

interface ActorAsJson {
  exchange: string;

  routingkey: string;
  queue: string;
  queueOptions: {

  }
}

const defaultExchange = 'default'
const defaultExchangeType = 'direct'

interface CreateNewActorParams {
  routingkey: string;

  queue?: string;

  exchange?: string;

  connection?: Connection;

  channel?: Channel;

  prefetch?: number;

  schema?: Joi.Schema;

  queueOptions?: object; 

  exchangeType?: string;
}

export interface ActorConnectionParams extends CreateNewActorParams {

  exchange: string;

  queue: string;

  exchangeType: string;

}


export class Actor extends EventEmitter {

  connection?: Connection | null;

  channel?: Channel | null;

  actorParams: ActorConnectionParams;
  
  consumerTag?: string;

  schema?: Joi.Schema;

  validateSchema?: any;

  heartbeatMilliseconds: number = 10000; // Timeout from setInterval

  heartbeatInterval: any; // Timeout from setInterval

  toJSON(): ActorAsJson {

    return {

      exchange: this.actorParams.exchange,

      routingkey: this.actorParams.routingkey,

      queue: this.actorParams.queue,

      queueOptions: this.actorParams.queueOptions || {},

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

  constructor(params: CreateNewActorParams) {

    super();

    const actorParams: ActorConnectionParams = Object.assign({
      exchange: 'default',
      queue: params.routingkey,
      exchangeType: 'direct'
    }, params);

    if (!params.exchange) {
      actorParams.exchange = 'default';
    }

    if (!actorParams.queue) {
      actorParams.queue = actorParams.routingkey
    }

    this.consumerTag = uuid.v4();

    if (!actorParams.exchangeType) {
      actorParams.exchangeType = 'direct';
    }

    if (!actorParams.routingkey) {
      actorParams.routingkey = actorParams.queue;
    }

    this.actorParams = actorParams

  }

  static create(connectionInfo: CreateNewActorParams) {

    let actor = new Actor(connectionInfo);

    return actor;
  }

  async defaultConsumer(channel: Channel, msg: Message, json?: any) {

    const message = msg.content.toString();

    log.info(message);

  }

  async stop() {

    if (this.channel && this.consumerTag) {

      this.channel.cancel(this.consumerTag)
    }
    
  }

  async start<T>(consumer?: (channel: any, msg: any, json?: any) => Promise<void>) {

    var json: T;

    let channel = await this.connectAmqp(this.actorParams.connection);

    await channel.assertExchange(this.actorParams.exchange, this.actorParams.exchangeType)

    await channel.publish('rabbi', 'actor.started', Buffer.from(JSON.stringify(
      this.toJSON()
    )));

    this.heartbeatInterval = setInterval(async () => {

      await channel.publish('rabbi', 'actor.heartbeat', Buffer.from(JSON.stringify(
        this.toJSON()
      )));

    }, this.heartbeatMilliseconds);

    channel.consume(this.actorParams.queue, async (msg: Message) => {

      try {

        json = JSON.parse(msg.content.toString());

      } catch(error) {

      }

      if (consumer) {

        try {

          let result = await consumer(channel, msg, json);

        } catch(error: any) {

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



