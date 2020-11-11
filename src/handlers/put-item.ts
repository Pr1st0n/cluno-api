// Create clients and set shared const values outside of the handler.

import { APIGatewayEvent } from 'aws-lambda';
import dynamodb from 'aws-sdk/clients/dynamodb';

// Get the DynamoDB table name from environment variables
const tableName = process.env.DYNAMODB_TABLE || '';
// Create a DocumentClient that represents the query to add an item
const docClient = new dynamodb.DocumentClient();

/**
 * A simple example includes a HTTP post method to add one item to a DynamoDB table.
 */
export const putItemHandler = async (event: APIGatewayEvent): Promise<any> => {
    if (event.httpMethod !== 'POST') {
        throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
    }
    // All log statements are written to CloudWatch
    console.info('received:', event);

    // Get id and name from the body of the request
    const body = JSON.parse(event.body || '');
    const id = body.id;
    const name = body.name;

    // Creates a new item, or replaces an old item with a new item
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#put-property
    const params = {
        TableName: tableName,
        Item: { id: id, name: name }
    };

    const result = await docClient.put(params).promise();

    const response = {
        statusCode: 200,
        body: JSON.stringify(body)
    };

    // All log statements are written to CloudWatch
    console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
    return response;
};
