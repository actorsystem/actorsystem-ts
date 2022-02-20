
import { EventEmitter } from 'events';

import  Ajv, { JSONSchemaType } from 'ajv'

import { log } from './logger'

const ajv = new Ajv()

export class InvalidSchema implements Error {
  validationErrors: any[];

  constructor(errors) {
    this.validationErrors = errors
  }

  name = "InvalidJSONSchema"
  message = "Invalid JSON Schema Definition For Actor - See https://ajv.js.org for Specification"
}

interface NewBaseActor {
  schema?: any;
}

export abstract class ActorInterface {

  start: Function;

  schema: any;

}

export type MessageHandler = (message: Message) => Promise<void>;

type ValidateSchema = (any) => [boolean, any];

export interface Message {
  data: any;
  ack: Function
}

export interface BaseNewActor {
  event: string;
  receive?: any;
  schema?: any;
}

export class BaseActor extends EventEmitter {

  event: string;

  schema: any;

  validateSchema: ValidateSchema;

  receive: MessageHandler;

  constructor(newActor) {

    super();

    this.event = newActor.event

    if (newActor.receive) {

      this.receive = newActor.receive

    }

    if (newActor.schema) {

      this.schema = newActor.schema

      this.validateSchema = (message) => {

        try {

          const compiled = ajv.compile(this.schema)

          let isValid = compiled(message)

          return [isValid, compiled.errors]

          } catch(error) {

            throw new InvalidSchema(error)
          }

      }

    }
    

  }

  async handleMessage(message: Message): Promise<any> {

    try {

      await this.receive(message)

      await message.ack()

    } catch(error) {

      log.error('message.handle.error', error)

    }

  }

  send(data: any) {

    if (this.schema) {

      let [isValid, errors] = this.validateSchema(data)

      if (isValid) {

        this.emit('message.valid', data)

      } else {

        this.emit('message.invalid', [errors, data])

        return

      }

    }

    this.handleMessage({

      data,

      ack: () => {

      }

    })

  }

  private async defaultHandler(message: Message): Promise<void> {

    log.info('actor.receive.default', message)

  }

  async start(receive?: MessageHandler): Promise<any> {


    if (receive) {

      this.receive = receive

    } else {

      if (!this.receive) {

        this.receive = this.defaultHandler

      }

    }

    this.emit('start')

  }

}

