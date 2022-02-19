import * as path from 'path';

import * as assert from 'assert';

import { startActorsDirectory } from '../lib/rabbi';

describe("Excluding actors from an actors directory", () => {

  it.skip('--exclude should translate to options.exclude', async () => {

    let actors = await startActorsDirectory(path.join(__dirname, 'actors'), {
      exclude: ['test_exclude']
    });

    actors.forEach(actor => {

      assert(actor.name !== 'test_exclude')

    });

  });

});

