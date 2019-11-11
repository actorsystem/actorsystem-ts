require('dotenv').config();

import * as fs from 'fs';
import * as path from 'path';

import { reject, reduce, filter } from 'lodash';

import { Actor } from './actor';

import { log } from './logger';

import { getConnection, getChannel } from './amqp';

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
  getChannel,
  delay,
  Joi
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

  if (opts.include.length > 0) {
    let included = buildIncluded(opts.include);
    actors = filter(actors, actor => included(actor.name));
  }

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
 
function buildIncluded(includeOpts: any[]) {

  var inclusions = reduce(includeOpts, (inclusions, actorName) => {

    inclusions[actorName] = true;

    return inclusions;

  }, {});

  return function(actorName) {

    return inclusions[actorName];

  }

}

