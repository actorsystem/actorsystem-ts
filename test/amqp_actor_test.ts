
require('dotenv').config()

import { spy, expect, assert } from './utils'

import { getChannel, getConnection } from '../lib/amqp'

import { Channel, Connection } from 'amqplib'

import { AmqpActor } from '../lib/amqp_actor'

describe('AMQP Actor', () => {

  it("should create the rabbi exchange by default", async () => {

    let actor = new AmqpActor({

      event: 'super_fantastic_event'

    })

    expect(actor.exchange).to.be.equal('rabbi')

    expect(actor.queue).to.be.equal('super_fantastic_event')

    expect(actor.routingkey).to.be.equal('super_fantastic_event')

  })

  describe('Initializing Connection', () => {

    it("by default creates a queue with event name and binds it to the rabbi exchange", async () => {

      let actor = new AmqpActor({

        event: 'super_fantastic_event'

      })

      await actor.connect()

      expect(actor.connection).to.not.be.null

      expect(actor.channel).to.not.be.null

      spy.on(actor.channel, ['assertExchange', 'assertQueue', 'bindQueue'])

      await actor.initialize()

      expect(actor.channel.assertExchange).to.have.been.called.with('rabbi', 'direct') 

      expect(actor.channel.assertQueue).to.have.been.called.with(actor.queue) 

      expect(actor.channel.bindQueue).to.have.been.called.with(actor.queue, actor.exchange, actor.routingkey) 

    })

  })

  it("start should connect, bind queue to exchange, and begin consuming messages", (done) => {

    var isDone = false;

    let actor = new AmqpActor({

      event: 'super_fantastic_event',

      receive: (message) => {

        expect(message.data.foo).to.be.equal('bar')

        actor.stop()

        if (!isDone) { isDone = true; done() }

      }

    });

    spy.on(actor, ['connect', 'initialize'])

    actor.connect().then(() => {

      spy.on(actor.channel, ['consume'])

      return actor.start()

    })
    .then(() => {

      expect(actor.channel.consume).to.have.been.called.with(actor.queue)

      let message = Buffer.from(JSON.stringify({

        foo: 'bar'

      }))

      actor.channel.publish(actor.exchange, actor.routingkey, message)

    })

  });

  it("publish should allow an actor to publish any message to another actor", (done) => {

    var isDone = false;

    let actor = new AmqpActor({

      event: 'super_fantastic_event',

      receive: (message) => {

        expect(message.data.foo).to.be.equal('bar')

        actor.stop()

        if (!isDone) { isDone = true; done() }

      }

    });

    actor.start().then(() => {

      spy.on(actor.channel, ['sendToQueue'])

      actor.publish('super_fantastic_event', { foo: 'bar' })

      let message = Buffer.from(JSON.stringify({

        foo: 'bar'

      }))

      expect(actor.channel.sendToQueue).to.be.called.with('super_fantastic_event', message)

    })

  })


})
