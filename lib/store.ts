
//import * as models from '../models'

export class EventStore {

  eventTable: string = 'RabbiEvents';

  models: any;

  isAvailable: boolean = false

  constructor() {

    if (process.env.RABBI_DATABASE_URL) {

      console.log('configure in constructor')

      this.configureStore(process.env.RABBI_DATABASE_URL) 
    }

  }

  async configureStore(url: string, table:string = this.eventTable) {

    console.log('configure store', url)

    this.models = require('../models')(url)

    this.eventTable = table;

    this.isAvailable = true

  }

  async storeEvent(event: string, payload: any) {

    try {

      let result = await this.models.RabbiEvent.create({event, payload})

      return result

    } catch(error) {

      console.error('rabbi.store.error', error)

    }

  }

}

var store = new EventStore()

export { store }

