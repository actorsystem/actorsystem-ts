
import { EventEmitter } from 'events'

const EventEmitter2 = require('eventemitter2')

import { store, EventStore } from './store'

import { getChannel } from './amqp'

class Events {

  store: EventStore;

  exchange: string = 'rabbi.events';

  emitter: any;

  constructor() {

    this.emitter = new EventEmitter2({
      wildcard: true
    })

    this.init()

    this.store = store;
  }

  on(event: string, callback) {

    this.emitter.on(event, callback)
  }

  async init() {

    let channel = await getChannel()

    channel.assertExchange(this.exchange, 'direct')
  }

  async emit(event: string, payload: any = {}): Promise<any> {

    this.emitter.emit(event, payload)

    let channel = await getChannel()

    channel.publish(this.exchange, event, Buffer.from(
      JSON.stringify(payload)
    ));

    if (this.store.isAvailable) {

      return this.store.storeEvent(event, payload)

    }

  }

}

const events = new Events()

export { events }

