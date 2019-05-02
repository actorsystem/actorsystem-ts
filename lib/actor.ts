
import { connect, Connection, Channel } from 'amqplib';

import { log } from './logger';

export class Actor {

  connection?: Connection;

  channel?: Channel;

  actorParams: ActorConnectionParams;

  async connectAmqp(connection?: Connection) {

    this.connection = connection || await connect(process.env.AMQP_URL);

    log.info('amqp.channel.connected');

    this.channel = await this.connection.createChannel();

    log.info('amqp.channel.created');

    await this.channel.assertExchange(this.actorParams.exchange, 'direct');

    await this.channel.assertQueue(this.actorParams.queue);

    log.info('bind actor to amqp', this.actorParams);

    await this.channel.bindQueue(
      this.actorParams.queue,
      this.actorParams.exchange,
      this.actorParams.routingkey
    );

    return this.channel;

  }

  constructor(actorParams: ActorConnectionParams) {

    this.actorParams = actorParams;

  }

  static create(connectionInfo: ActorConnectionParams) {

    let actor = new Actor(connectionInfo);

    return actor;
  }

  async start(consumer) {

    let channel = await this.connectAmqp(this.actorParams.connection);

    channel.consume(this.actorParams.queue, function(msg) {

      consumer(channel, msg);

    });

  }

}

export interface ActorConnectionParams {

  exchange: string;

  routingkey: string;

  queue: string;

  connection?: Connection

}

