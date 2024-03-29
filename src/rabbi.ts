require('dotenv').config();

import * as fs from 'fs';
import * as path from 'path';

import { reject, reduce, filter } from 'lodash';

import { Actor } from './actor';

import { log } from './logger';

import { getConnection, getChannel, publish } from './amqp';

export { events } from './events'

import * as Joi from '@hapi/joi';

import * as delay from 'delay';

export { requireDirectory } from './require';

export function getDirectories(source: string) {
  return fs.readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
}

interface Configuration {
  amqp?: string;
}

export function startActors(actorNames=[]) {

  actorNames.map(actorName => {

    return require(path.join(process.cwd(), 'actors', actorName, 'actor.ts'));

  })
  .forEach(actor => actor.start());

}

export async function init() {

  let channel = await getChannel()

  await channel.assertExchange('rabbi.events', 'direct')

}


function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function requireHandlersDirectory(dirname: string) {

  var handlers: any = require('require-all')({
    dirname,
    filter      :  /(.+)\.ts$/,
    map: function(name: string, path: string) {

      return name.split('_').map(p => {

        return capitalizeFirstLetter(p);

      })
      .join('');
    }
  });

  return handlers;
}

export function jToB(json: any): Buffer {

  return Buffer.from(JSON.stringify(json))

}

export {
  Actor,
  log,
  getConnection,
  getChannel,
  publish,
  delay,
  Joi,
  requireHandlersDirectory
}

interface StartActorsDirectoryOpts {
  exclude?: string[];
  include?: string[];
}

interface ActorHandle {
  path: string,
  name: string,
  actor?: Actor
}

export async function startActorsDirectory(directoryIndexPath: string,
  opts: StartActorsDirectoryOpts = {
    exclude: [],
    include: []
  }): Promise<ActorHandle[]> {

  let directories = getDirectories(directoryIndexPath);

  var tmpHandle: ActorHandle;

  let actors: any[] = directories.map(directory => {

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

  let shouldExclude = buildShouldExclude(opts.exclude || []);

  actors = reject(actors, actor => shouldExclude(actor.name));

  if (opts.include && opts.include.length > 0) {
    let included = buildIncluded(opts.include);
    actors = filter(actors, actor => included(actor.name));
  }

  actors.forEach(actor => require(actor.path).start());

  return actors; 

}

interface Exclusions {
  [key: string]: boolean;
}

function buildShouldExclude(excludeOpts: any[]) {

  const exclusions: Exclusions = reduce(excludeOpts, (exclusions: Exclusions, actorName: string) => {

    exclusions[actorName] = true;

    return exclusions;

  }, {});

  return function(actorName: string) {

    return exclusions[actorName];

  }

}

interface Inclusions {
  [key: string]: boolean;
}
 
function buildIncluded(includeOpts: any[]) {

  var inclusions: Inclusions = reduce(includeOpts, (inclusions: Inclusions, actorName: string) => {

    inclusions[actorName] = true;

    return inclusions;

  }, {});

  return function(actorName: string) {

    return inclusions[actorName];

  }

}

