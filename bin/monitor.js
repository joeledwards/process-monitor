#! /usr/bin/env node

const app = require('@buzuli/app')
const yargs = require('yargs')

const processMonitor = require('../lib')

app({
  modules: {
    logalog: () => require('log-a-log')
  }
})(
  async ({
    modules: {
      logalog
    }
  }) => {
    const options = yargs
      .env('PROCESS_MONITOR')
      .option('check-interval', {
        type: 'number',
        desc: 'check process status on this interval (second)',
        default: 60000,
      })
      .option('slack-webhook', {
        type: 'string',
        desc: 'slack webhook where notifications should be sent',
      })
      .option('verbose', {
        type: 'boolean',
        desc: 'log more detailed info',
      })
      .parse()

    logalog()

    await processMonitor(options)
  }
)
