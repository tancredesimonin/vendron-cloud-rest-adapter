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

## Usage

see [Usage](/USAGE.md) for the details on using the API endpoints
