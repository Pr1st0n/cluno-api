// Create clients and set shared const values outside of the handler.

import { APIGatewayEvent } from 'aws-lambda';
import dynamodb from 'aws-sdk/clients/dynamodb';

// Get the DynamoDB table name from environment variables
const tableName = process.env.DYNAMODB_TABLE || '';
// Create a DocumentClient that represents the query to add an item
const docClient = new dynamodb.DocumentClient();

/**
 * A simple example includes a HTTP get method to get one item by id from a DynamoDB table.
 */
export const getByIdHandler = async (event: APIGatewayEvent): Promise<any> => {
    if (event.httpMethod !== 'GET') {
        throw new Error(`getMethod only accept GET method, you tried: ${event.httpMethod}`);
    }
    // All log statements are written to CloudWatch
    console.info('received:', event);

    // Get id from pathParameters from APIGateway because of `/{id}` at template.yml
    const id = event.pathParameters?.id;

    // Get the item from the table
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#get-property
    const params = {
        TableName: tableName,
        Key: { id: id },
    };
    const data = await docClient.get(params).promise();
    const item = data.Item;

    const response = {
        statusCode: 200,
        body: JSON.stringify(item)
    };

    // All log statements are written to CloudWatch
    console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
    return response;
};