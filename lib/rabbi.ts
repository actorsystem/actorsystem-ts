require('dotenv').config();

import * as fs from 'fs';
import * as path from 'path';

import * as datapay from 'datapay';

import { reject, reduce } from 'lodash';

import { Actor } from './actor';

import { log } from './logger';

import { getConnection, awaitChannel } from './amqp';

import * as Joi from 'joi';

export function getDirectories(source) {
  return fs.readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
}

import * as delay from 'delay';

export {
  Actor,
  log,
  getConnection,
  delay,
  Joi,
  publish
}

interface StartActorsDirectoryOpts {
  exclude: string[];
}

interface ActorHandle {
  path: string,
  name: string,
  actor?: Actor
}

interface PublishOptions {
  exchange: string;
  routingkey: string;
  content: string;
  blockchain?: boolean;
}

async function publish(options: PublishOptions) {

  let message = Buffer.from(options.content);
  let channel = await awaitChannel();

  channel.publish(options.exchange, options.routingkey, message);

  if (options.blockchain) {
    log.info('publish to blockchain', options);

    if (process.env.RABBI_DATAPAY_PRIVATE_KEY) {

      try {

        let resp = await datapay.send({
          safe: true,
          data: [message],
          pay: { key: process.env.RABBI_DATAPAY_PRIVATE_KEY }
        });

        log.info('datapay.published', resp);

      } catch(error) {

        log.error('datapay.error', error);

      }

    } else {

      await channel.publish('rabbi.persistence', 'bsv', message);

    }
  }

}

export async function startActorsDirectory(directoryIndexPath: string,
  opts: StartActorsDirectoryOpts = {
    exclude: []
  }): Promise<ActorHandle[]> {

  let directories = getDirectories(directoryIndexPath);

  var tmpHandle: ActorHandle;

  let actors: ActorHandle[] = directories.map(directory => {

    var dir = path.join(directoryIndexPath, directory);

    return fs.readdirSync(dir).reduce((actorFile, file) => {

      if (file === 'actor.ts') {

        let a = path.join(dir, file);

        return {
          path: a,
          name: directory
        }

      } else {

        return actorFile;
      }

    }, tmpHandle);

  });

  actors = reject(actors, a => !a);

  let shouldExclude = buildShouldExclude(opts.exclude);

  actors = reject(actors, actor => shouldExclude(actor.name));

  actors.forEach(actor => require(actor.path).start());

  return actors; 

}

function buildShouldExclude(excludeOpts: any[]) {

  let exclusions = reduce(excludeOpts, (exclusions, actorName) => {

    exclusions[actorName] = true;

    return exclusions;

  }, {});

  return function(actorName) {

    return exclusions[actorName];

  }

}

