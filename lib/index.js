module.exports = processMonitor

const axios = require('axios')
const pslist = require('ps-list')
const buzJson = require('@buzuli/json')
const scheduler = require('@buzuli/scheduler')

async function processMonitor ({
  checkInterval,
  slackWebhook
}) {
  const sched = scheduler()
  let minecraftRunning = false
  
  checkProcesses()

  // Scan for processes
  async function checkProcesses () {
    console.info('Scheduling next process check...')
    sched.after(checkInterval, checkProcesses)

    console.info('Scanning processes...')

    const processes = await pslist({ all: true })

    let minecraftFound = false
    for (const process of processes) {
      if (process.cmd.match(/minecraft/)) {
        //console.info(buzJson(process))
        minecraftFound = true
      }
    }

    const stateChanged = minecraftFound !== minecraftRunning
    minecraftRunning = minecraftFound

    if (stateChanged) {
      if (minecraftFound) {
        console.warn('Minecraft started.')
        await slackMessage(':bricks: Minecraft started :large_green_circle:')
      } else {
        console.warn('Minecraft halted.')
        await slackMessage(':bricks: Minecraft halted :red_circle:')
      }
    }
  }

  // Send message to Slack
  async function slackMessage (message) {
    if (slackWebhook == null) {
      console.warn('Could not send Slack message. Webhook not configured.')
      return
    }

    const {
      status: statusCode,
      data: body
    } = await axios({
      method: 'POST',
      url: slackWebhook
    })

    if (statusCode != 200) {
      console.error(`Error sending Slack message.\n[${statusCode}] ${body}`)
    } else {
      console.info('Slack message sent.')
    }
  }
}
