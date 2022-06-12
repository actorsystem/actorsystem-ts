
const requireAll = require('require-all')

import { join } from 'path'

const stack = require('callsite');

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function getCallerDirectory(): string {

  let site = stack().filter(function(site){
    return !site.getFunctionName()
  })[0]

  let parts = site.getFileName().split('/')

  parts.pop()

  return parts.join('/')

}

interface Options {
  filter?: RegExp;
  map?: Function;
}

interface Directory {
    [key: string]: any;
}

export function requireDirectory(dirname: string, options: Options={}): Directory {

  if (dirname.match(/^\//)) {

    // requiring root file
    // do not change dirname

  } else if (dirname.match(/^\./)) {

    // requiring relative to current file

    dirname = join(getCallerDirectory(), dirname)

  } else {

    // requiring directory from root of process

    dirname = join(process.cwd(), dirname)

  }

  const filter = options.filter || /(.+)\.ts$/;

  const map = options.map || function(name, path) {

    return name.split('_').map(p => {

      return capitalizeFirstLetter(p);

    })
    .join('');
  }

  return requireAll({ dirname, filter, map })

}

