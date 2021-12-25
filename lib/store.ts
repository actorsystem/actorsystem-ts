

const knex = require('knex')

export class EventStore {

  eventTable: string = 'rabbi_events';

  pg: any;

  isAvailable: boolean = false

  constructor() {

    if (process.env.RABBI_POSTGRES_URL) {

      this.configureStore(process.env.RABBI_POSTGRES_URL) 
    }

  }

  async configureStore(connection: any, table:string = this.eventTable) {

    this.pg = knex({
      client: 'pg',
      connection
    });

    this.eventTable = table;

    this.isAvailable = true

  }

  async storeEvent(event: string, payload: any) {

    return this.pg(this.eventTable).insert({ event, payload })

  }

}

var store = new EventStore()

export { store }

