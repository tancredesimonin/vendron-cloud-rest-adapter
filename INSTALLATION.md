# Step by step guide to your first installation or deployment

## Only locally

1. `git clone git@github.com:tancredesimonin/vendron-cloud-rest-adapter.git`
2. `npm i`

## All environments

1. setup your environment variables (check the `.env.example` file with all required configuration variables)


## If you use scalingo or ssh deployment

### ssh on windows

[scalingo SSH documentation](https://doc.scalingo.com/platform/getting-started/setup-ssh-windows)

if not already setup

- `export PATH=$PATH:/c/Program\ Files/`

if you have many different ssh keys

- `ssh -vT git@ssh.osc-fr1.scalingo.com`
- `eval `ssh-agent.exe``
- `ssh-add ~/.ssh/yourkeyname-id_rsa`

### 