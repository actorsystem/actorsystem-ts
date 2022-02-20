
import { BaseActor } from '../lib/base_actor'

import { App } from '../lib/app'

import { expect, newIdentity } from './utils'

describe("Base Actor", () => {

  it("at the simplest it should allow only the event name", (done) => {

    let actor = new BaseActor({

      event: "simple_event_no_schema",

      receive: async (message) => {

        expect(message.data.foo).to.be.equal("goodstuff");

        done()

      }

    })

    actor.send({

      foo: "goodstuff"

    })

    expect(actor.event).to.be.equal('simple_event_no_schema')

  })

  it("should validate messages given a json schema definition", (done) => {

    let actor = new BaseActor({

      event: "simple_event_no_schema",

      schema: {

        type: "object",

        properties: {

          foo: {type: "integer"},

          bar: {type: "string"}

        },

        required: ["foo"],

        additionalProperties: false
   
      },

      receive: async (message) => {

        expect(message.data.foo).to.be.equal(808);

        done()

      }

    })

    actor.on('message.invalid', ([errors, data]) => {

      expect(data.bar).to.be.equal('notrequired')

    })

    /* This message should not be received because it is not valid since foo is required but missing*/
    actor.send({

      bar: "notrequired"

    })

    /* This message is valid so it should be received */
    actor.send({

      foo: 808

    })

  })

})

describe("Actor System | App", () => {

  it("should pass events to the correct actor", (done) => {

    let actor = new BaseActor({

      event: "simple_event_no_schema",

      receive: async (message) => {

        expect(message.data.foo).to.be.equal("goodstuff");

        done()
      }

    })

    let app = new App({

      identity: newIdentity()

    })

    app.addActor(actor)

    app.send({

      event: "simple_event_no_schema",

      data: {

        foo: "goodstuff"

      }

    })


  })

})

