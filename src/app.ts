
import { EventEmitter } from 'events'

interface NewApp {

  identity: string;

}

import { BaseActor } from './actors/base' 

interface NewMessage {

  event: string;

  data: any;

}

type ActorsMap = {

  [event: string]: BaseActor;

}

class DuplicateActor implements Error {

  name = "DuplicateActor"

  message = `App already contains event with name` 

  constructor(event: string, app: App) {

    this.message = `App ${app.identity} already contains ${event} actor`

  }
}

export class App extends EventEmitter {

  identity: string;

  actors: ActorsMap = {};

  constructor(params: NewApp) {

    super();

    this.identity = params.identity

  }

  addActor(actor: BaseActor) {

    if (this.actors[actor.event]) {

      throw new DuplicateActor(actor.event, this)

    }

    this.actors[actor.event] = actor

  }

  send(newMessage: NewMessage) {

    let actor = this.actors[newMessage.event]

    if (actor) {

      actor.send(newMessage.data)

    } else {

      this.emit('error.actor.notfound', newMessage)

    }

  }

  start() {

    this.emit('start')

    Object.values(this.actors).forEach(actor => actor.start())

  }

}
