# Cluno-API

This repository implements serverless API application allowing to request offers data.

|Endpoint          |Description                     |
|------------------|--------------------------------|
|/api/v1/offers    |Returns filtered list of offers |
|/api/v1/offers/:id|Returns offer detail information|

List of offers can be filtered using next query params (values are case sensitive)

|Filter   |Description                                             |
|---------|--------------------------------------------------------|
|portfolio|Single value. Default is *0001*                         |
|make     |Comma separated list of 'makes' (ex. *make=BMW,Opel*)   |
|price    |Comma separated price range values (ex. *price=100,300*)|

## Requirements

* AWS SAM CLI - [Install the AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html).
* Node.js - [Install Node.js 12](https://nodejs.org/en/), including the npm package management tool.
* Docker - [Install Docker community edition](https://hub.docker.com/search/?type=edition&offering=community).

## Usage

General commands:

```bash
# Install dependencies
npm install
# Compile Typescript (should be run before deployment or local execution of API)
npm run build
# Run handlers tests
npm run test
# ESlint
npm run lint
# Import data from *$DYNAMODB_EXPORT_JSON* (url) to *$DYNAMODB_TABLE* (default: *cluno-api-offers*)
npm run import
```

Run locally (still requires existing DynamoDB table with data):

```bash
sam local start-api --env-vars env.json
```

Deploy SAM APP with next commands:

```bash
sam build
sam deploy --guided
```

Delete SAM APP:

```bash
aws cloudformation delete-stack --stack-name cluno-api
```

## // TODO

- Extend tests coverage
- Implement pagination using *limit* and *offset* filters
- Implement pipeline using *buildspec.yml*
- Delegate scan result sort and maximum result items number to DB
- Implement minimal authorization
