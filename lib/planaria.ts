
import { EventEmitter } from 'events'

import * as split2 from 'split2'

import * as through2 from 'through2'

import fetch from 'node-fetch';

interface CrawlerParams {
  query: any;
  onTransaction: Function;
  token?: string;
  onEnd?: Function;
}

const token = process.env.PLANARIA_TOKEN;

export class Crawler extends EventEmitter {

  query: string;

  onTransaction: Function;

  onEnd: Function;

  token: string;

  constructor(params: CrawlerParams) {
    super()
    this.query = params.query
    this.onTransaction = params.onTransaction
    this.token = params.token || process.env.PLANARIA_TOKEN

    if (!this.token) {
      throw new Error('planaria.token.required')
    }
  }

  start() {

    fetch("https://txo.bitbus.network/block", {
      method: "post",
      headers: {
        'Content-type': 'application/json; charset=utf-8',
        'token': token
      },
      body: JSON.stringify(this.query)
    })
    .then(async (res) => {
      return res.body
        .pipe(split2())
        .pipe(through2(async (chunk, enc, callback) => {

          try {

            let json = JSON.parse(chunk.toString())

            this.emit('chunk', json)

            await this.onTransaction(json)

          } catch(error) {

            this.emit('error', error)

          }

          callback()

        }))
        .on('end', () => {

          this.emit('end')
          this.onEnd()

        })

     })

    return this

  }

}

