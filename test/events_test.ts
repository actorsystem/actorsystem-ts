
require('dotenv').config()

import * as assert from 'assert'

import { events, store, configure } from '../lib/rabbi'

describe('Events', () => {

  before(async () => {

    await configure({ amqp: process.env.AMQP_URL })

  })

  it.skip('#emit should not persist an event when database is not available', async () => {

    assert(!store.isAvailable)

  })

  it.skip('#should persist an event when database is available', async () => {

    await configure({ store: process.env.DATABASE_URL })

    store.configureStore(process.env.DATABASE_URL)

    assert(store.isAvailable)

    let record = await events.emit('greatevent', { some: 'good data' })

    assert(record)

    assert(record.id > 0)

  })

})
