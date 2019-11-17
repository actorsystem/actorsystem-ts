import { join } from 'path';
import { lstatSync } from 'fs';

// check for .rabbi/config.ts file to override defaults

let configDirectory = join(process.cwd(), '.rabbi');
let configFile = join(configDirectory, 'config.ts')

var config;

if (lstatSync(configDirectory).isDirectory() && lstatSync(configFile).isFile()) {

  config = require(configFile);

} else {

  config = {
    hapi: {
      handlers: {
        directory: process.cwd()
      }
    }
  }

}

export { config }
