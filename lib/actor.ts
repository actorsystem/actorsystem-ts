
import { connect, Connection, Channel, Message } from 'amqplib';

import { EventEmitter } from 'events';

import { log } from './logger';

import { getConnection } from './amqp';

import * as Joi from 'joi';

export class Actor extends EventEmitter {

  connection?: any;

  channel?: Channel;

  actorParams: ActorConnectionParams;

  schema: Joi.Schema;

  toJSON(): any {

    return {

      exchange: this.actorParams.exchange,

      routingkey: this.actorParams.routingkey,

      queue: this.actorParams.queue

    };

  }

  async connectAmqp(connection?: any) {

    if (connection) {

      this.connection = connection;

    } else {

      console.log('GET CONNECTION');

      this.connection = await getConnection();

    }

    this.channel = await this.connection.createChannel();

    log.info('bunnies.amqp.channel.created');

    await this.channel.assertExchange(this.actorParams.exchange, 'direct');

    await this.channel.assertQueue(this.actorParams.queue);

    log.info('bunnies.amqp.binding.created', this.toJSON());

    await this.channel.bindQueue(
      this.actorParams.queue,
      this.actorParams.exchange,
      this.actorParams.routingkey
    );

    return this.channel;

  }

  constructor(actorParams: ActorConnectionParams) {

    super();

    this.actorParams = actorParams;

  }

  static create(connectionInfo: ActorConnectionParams) {

    let actor = new Actor(connectionInfo);

    return actor;
  }

  async defaultConsumer(channel: Channel, msg: Message, json?: any) {

    let message = this.toJSON();

    message.message = msg.content.toString();

    log.info(message);

    await channel.ack(msg);

  }

  async start(consumer?: (channel: any, msg: any, json?: any) => Promise<void>) {

    console.log('START');

    var json;

    let channel = await this.connectAmqp(this.actorParams.connection);

    channel.consume(this.actorParams.queue, (msg) => {

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

        consumer(channel, msg, json);

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

  connection?: Connection

  schema?: Joi.Schema

}

