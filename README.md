# process-monitor

Very simple daemon which looks for a process (minecraft for now), and alerts if its status changes.

## Requirements

Install Node.js (I recommend using [nvm](https://nvm.sh)) which comes with npm.

Install dependencies in the project root:
```
npm install
```

Run the monitor daemon:
```
PROCESS_MONITOR_SLACK_WEBHOOK=<your-slack-webhook> node bin/monitor.js
```

