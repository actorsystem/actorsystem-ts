require('dotenv').config();

import * as Chance from 'chance';

import * as uuid from 'uuid';

import * as chai from 'chai';

import * as bsv from 'bsv';

const spies = require('chai-spies');

const chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)

chai.use(spies)

const expect = chai.expect

const chance = new Chance();

import * as assert from 'assert';

const spy = chai.spy

export {
  chance,
  assert,
  uuid,
  expect,
  spy
}

export function newIdentity() {

  let privateKey = new bsv.PrivateKey()

  return privateKey.publicKey.toString()

}
