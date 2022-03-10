# Vendron Cloud Websocket to Rest API Adapter

This adapter aims at providing an API REST interface to the Vendron Smart Fridge Websocket API.

## Features

- Unique endpoint for the CheckState
- Unique endpoint for the Door Open
- User integrations with your current user management system
- Multi-machines handling *not tested on more than 2X for the moment*
- Transaction history
- Transaction events history for in-depth study (all ws events are logged and stored in the db)
- SlackBot alerts in case of errors

## Developer Experience

- Full Swagger documentation with interactions
- [Fake Smart Fridge emulator available to locally simulate a smart fridge behaviour](https://github.com/tancredesimonin/vendron-public-smart-fridge-fake)

## Stack

- Made with the amazing strapi.io (v3.6.8)
- BYO Postgresql

- 1 push deployment on scalingo or heroku (not tested on heroku - you may need to configure a procfile before deployment)

> Scalingo is a high-performance PAAS based in France, heroku-compatible and comes with managed databases, with top quality SLAs.
> [Create your account here](https://sclng.io/r/79e2f6ba0afa51e7)
> *This is a referral link - it'll help support my open-sourced projects by lowering a little bit my hosting costs*

## First install or deployment

see [Installation](/INSTALLATION.md) for the details on setting up your instance - either locally or hosted - for the first time
## Usage

see [Usage](/USAGE.md) for the details on using the API endpoints

## Improvements / Contributions / Support

Feel free to contact me on [linkedin](https://www.linkedin.com/in/tancredesimonin/) if you want to use, contribute or get support/installation.
Or at tancrede-simonin@live.fr

## User profile in the Admin Panel

![user card](/public/panel-user.PNG)

## Transaction Data in the Admin Panel

![user card](/public/panel-transaction.PNG)

## Transaction-Event Data in the Admin Panel

![user card](/public/panel-transaction-event.PNG)