# Step by step guide to your first installation or deployment

## Only locally

1. `git clone git@github.com:tancredesimonin/vendron-cloud-rest-adapter.git`
2. `npm i`

## All environments

1. setup your environment variables (check the `.env.example` file with all required configuration variables)

## Slack app

The built-in slack logger will send error messages to the channel of your choice.
you can enable or disable it through the `SLACK_ENABLE` variable (set to `true` or `false`)

If you enable it you must first create a slack app in your slack workspace and retrieve the notification url to set the `SLACK_WEBHOOK_URL` env.

1. go to [slack api dashboard](https://api.slack.com/apps) and select 'Create New App'
2. follow the instructions
3. you'll just need the basic informations setup and activate incoming webhooks in > Feature > Incoming Webhooks

## If you use scalingo or ssh deployment

### ssh on windows

[scalingo SSH documentation](https://doc.scalingo.com/platform/getting-started/setup-ssh-windows)

if not already setup

- `export PATH=$PATH:/c/Program\ Files/`

if you have many different ssh keys

- `ssh -vT git@ssh.osc-fr1.scalingo.com`
- `eval `ssh-agent.exe``
- `ssh-add ~/.ssh/yourkeyname-id_rsa`

CLI login with APIKEY

```
scalingo.exe login --api-token <yourtoken>
```

### 