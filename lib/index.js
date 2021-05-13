module.exports = processMonitor

const os = require('os')
const axios = require('axios')
const pslist = require('ps-list')
const buzJson = require('@buzuli/json')
const scheduler = require('@buzuli/scheduler')

async function processMonitor ({
  checkInterval,
  slackWebhook,
  verbose,
}) {
  const sched = scheduler()
  let minecraftRunning = false

  const log = {
    error: text => console.error(text),
    warn: text => console.warn(text),
    info: text => console.info(text),
    verbose: text => {
      if (verbose) {
        console.info(text)
      }
    }
  }
  
  checkProcesses()

  // Scan for processes
  async function checkProcesses () {
    log.verbose('Scheduling next process check ...')
    sched.after(checkInterval, checkProcesses)

    log.verbose('Listing processes ...')
    const processes = await pslist({ all: true })

    log.verbose(`Searching ${processes.length} processes ...`)
    let minecraftFound = false
    for (const process of processes) {
      if (process.cmd.match(/minecraft/) && process.cmd.match(/java/)) {
        log.verbose(`Minecraft process found with pid ${process.pid}`)
        minecraftFound = true
      }
    }

    if (!minecraftFound) {
      log.verbose('No Minecraft process found.')
    }

    const stateChanged = minecraftFound !== minecraftRunning
    minecraftRunning = minecraftFound

    if (stateChanged) {
      const hostname = os.hostname().split('.')[0]

      if (minecraftFound) {
        log.warn(`Minecraft started on ${hostname}.`)
        await slackMessage(':bricks: Minecraft started :large_green_circle:')
      } else {
        log.warn(`Minecraft halted on ${hostname}.`)
        await slackMessage(':bricks: Minecraft halted :red_circle:')
      }
    }
  }

  // Send message to Slack
  async function slackMessage (message) {
    if (slackWebhook == null) {
      log.warn('Could not send Slack message. Webhook not configured.')
      return
    }

    const {
      status: statusCode,
      data: body
    } = await axios({
      method: 'POST',
      url: slackWebhook,
      data: {
        text: message
      }
    })

    if (statusCode != 200) {
      log.error(`Error sending Slack message.\n[${statusCode}] ${body}`)
    } else {
      log.info('Slack message sent.')
    }
  }
}
