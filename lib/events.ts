
import { EventEmitter } from 'events'

const EventEmitter2 = require('eventemitter2')

import { store, EventStore } from './store'

import { getChannel } from './amqp'

class Events {

  store: EventStore;

  emitter: any;

  constructor() {

    this.emitter = new EventEmitter2({
      wildcard: true
    })

    this.store = store;
  }

  on(event: string, callback) {

    this.emitter.on(event, callback)
  }

  async emit(event: string, payload: any = {}) {

    this.emitter.emit(event, payload)

    if (this.store.isAvailable) {

      this.store.storeEvent(event, payload)

    }

    let channel = await getChannel()

    return channel.publish('rabbi.events', event, Buffer.from(
      JSON.stringify(payload)
    ));

  }

}

const events = new Events()

export { events }

