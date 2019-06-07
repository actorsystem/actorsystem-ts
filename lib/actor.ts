
import { Connection, Channel } from 'amqplib';

import { EventEmitter } from 'events';

import { log } from './logger';

import { getConnection } from './amqp';

export class Actor extends EventEmitter {

  connection?: any;

  channel?: Channel;

  actorParams: ActorConnectionParams;

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

  async defaultConsumer(channel, msg) {

    let json = this.toJSON();

    json.message = msg.content.toString();

    log.info(json);

    await channel.ack(msg);

  }

  async start(consumer?: (channel: any, msg: any) => Promise<void>) {

    let channel = await this.connectAmqp(this.actorParams.connection);

    channel.consume(this.actorParams.queue, (msg) => {

      if (consumer) {

        consumer(channel, msg);

      } else {

        this.defaultConsumer(channel, msg);

      }


    });

  }

}

export interface ActorConnectionParams {

  exchange: string;

  routingkey: string;

  queue: string;

  connection?: Connection

}

