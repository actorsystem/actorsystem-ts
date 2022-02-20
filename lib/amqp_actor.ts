
import { BaseActor, BaseNewActor, MessageHandler, Message } from './base_actor'

import { Channel, Connection, ConsumeMessage } from 'amqplib'

import { getConnection, getChannel } from './amqp'

import { log } from './logger'

import { v4 } from 'uuid'

interface NewAmqpActor extends BaseNewActor {

  channel?: Channel;

  connection?: Connection;

  routingkey?: string;

  exchange?: string;

  queue?: string;

  consumer?: string;
}

export class AmqpActor extends BaseActor {

  channel: Channel

  connection: Connection

  queue: string;

  exchange: string;

  routingkey: string;

  consumer: string;

  constructor(newActor: NewAmqpActor) {

    super({

      event: newActor.event,

      receive: newActor.receive,

      schema: newActor.schema
    })

    if (newActor.exchange) {

      this.exchange = newActor.exchange

    } else {

      this.exchange = 'rabbi'

    }

    if (newActor.queue) {

      this.queue = newActor.queue

    } else {

      this.queue = newActor.event

    }

    if (newActor.routingkey) {

      this.routingkey = newActor.routingkey

    } else {

      this.routingkey = newActor.event

    }

    if (newActor.consumer) {

      this.consumer = newActor.consumer

    } else {

      this.consumer = v4()

     
    }

  }

  async connect() {

    if (!this.connection) {

      this.connection = await getConnection()

    }

    if (!this.channel) {

      this.channel = await getChannel()
    }

  }

  async initialize() {

    await this.connect()

    await this.channel.assertExchange(this.exchange, 'direct')

    await this.channel.assertQueue(this.queue)

    await this.channel.bindQueue(this.queue, this.exchange, this.routingkey)

  }

  async start() {

    await this.initialize();

    this.channel.consume(this.queue, (msg: ConsumeMessage) => {

      const ack = () => {

        this.channel.ack(msg)

      }

      try {

        const data = JSON.parse(msg.content.toString())

        this.receive({

          data,

          ack

        })

      } catch(error) {

        log.error('message.invalid.json', error)

        ack()

      }

    }, {

      consumerTag: this.consumer

    })

  }

  async publish(event: string, json: any) {

    let message = Buffer.from(JSON.stringify(json))

    this.channel.sendToQueue(event, message)

  }

  async stop() {

    this.channel.cancel(this.consumer)

  }

}
