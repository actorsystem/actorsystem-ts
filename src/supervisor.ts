
import { join } from 'path'

import { reject, reduce, filter } from 'lodash';

import { readdirSync } from 'fs'

import { BaseActor } from './base_actor'

export function startActors(actorNames=[]) {

  actorNames.map(actorName => {

    return require(join(process.cwd(), 'actors', actorName, 'actor.ts'));

  })
  .forEach(actor => actor.start());

}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function requireHandlersDirectory(dirname) {

  var handlers: any = require('require-all')({
    dirname,
    filter      :  /(.+)\.ts$/,
    map: function(name, path) {

      return name.split('_').map(p => {

        return capitalizeFirstLetter(p);

      })
      .join('');
    }
  });

  return handlers;
}

interface StartActorsDirectoryOpts {
  exclude?: string[];
  include?: string[];
}

interface ActorHandle {
  path: string,
  name: string,
  actor?: BaseActor
}

export async function startActorsDirectory(directoryIndexPath: string,
  opts: StartActorsDirectoryOpts = {
    exclude: [],
    include: []
  }): Promise<ActorHandle[]> {

  let directories = getDirectories(directoryIndexPath);

  var tmpHandle: ActorHandle;

  let actors: any[] = directories.map(directory => {

    var dir = join(directoryIndexPath, directory);

    return readdirSync(dir).reduce((actorFile, file) => {

      if (file === 'actor.ts') {

        let a = join(dir, file);

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

  if (opts.exclude) {

    let shouldExclude = buildShouldExclude(opts.exclude);

    actors = reject(actors, actor => shouldExclude(actor.name));

  }

  if (opts.include && opts.include.length > 0) {
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

export function getDirectories(source) {
  return readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
}


