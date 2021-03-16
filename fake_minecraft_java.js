#! /usr/bin/env node

require('log-a-log')()

const app = require('@buzuli/app')
const scheduler = require('@buzuli/scheduler')

app()(() => {
  const sched = scheduler()

  run()

  function run () {
    sched.after(4999, run)

    console.info('process is active ...')
  }
})
