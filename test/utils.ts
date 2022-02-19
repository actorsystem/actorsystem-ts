require('dotenv').config();

import * as Chance from 'chance';
import * as uuid from 'uuid';

import * as chai from 'chai'

const chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)

const expect = chai.expect

const chance = new Chance();

import * as assert from 'assert';

export {
  chance,
  assert,
  uuid,
  expect
}

