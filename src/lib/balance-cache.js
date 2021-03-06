'use strict'
const BigNumber = require('bignumber.js')
const log = require('../common').log.create('BalanceCache')

function BalanceCache (core) {
  if (!core) {
    throw new TypeError('Must be given a valid Core instance')
  }

  this.core = core
  this.balanceByLedger = {}
  this.timer = null
}

BalanceCache.prototype.get = function * (ledger) {
  log.debug('getBalance', ledger)
  return this.balanceByLedger[ledger] ||
        (this.balanceByLedger[ledger] = (yield this.load(ledger)))
}

BalanceCache.prototype.load = function * (ledger) {
  // TODO use ledger notifications to reload the cache instead
  // see: https://github.com/interledger/five-bells-ledger/issues/111
  clearInterval(this.timer)
  this.timer = setInterval(this.reset.bind(this), 60000).unref()

  const plugin = this.core.getPlugin(ledger)
  return new BigNumber(yield plugin.getBalance())
}

// Used to clean up between tests.
BalanceCache.prototype.reset = function () {
  this.balanceByLedger = {}
}

module.exports = BalanceCache
