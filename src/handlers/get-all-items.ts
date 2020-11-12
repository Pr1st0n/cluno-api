import { APIGatewayEvent } from 'aws-lambda';
import dynamodb from 'aws-sdk/clients/dynamodb';
import AWS from 'aws-sdk';
import { formatResponse, serialize } from '../util/common';

AWS.config.update({
    region: 'eu-central-1'
});

// Get the DynamoDB table name from environment variables
const tableName = process.env.DYNAMODB_TABLE || 'cluno-api-orders';
// Create a DocumentClient that represents the query to add an item
const docClient = new dynamodb.DocumentClient();

/**
 * A simple example includes a HTTP get method to get all orders from a DynamoDB table.
 */
export const getAllItemsHandler = async (event: APIGatewayEvent): Promise<any> => {
    if (event.httpMethod !== 'GET') {
        return formatResponse(
            serialize({ error: `getAllItems only accept GET method, you tried: ${event.httpMethod}` }),
            400
        );
    }
    // All log statements are written to CloudWatch
    console.info('received:', event);
    // get all items from the table (only first 1MB data, you can use `LastEvaluatedKey` to get the rest of data)
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#scan-property
    // https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Scan.html
    const params = {
        TableName: tableName,
        ProjectionExpression: 'id, teaser, detailUrl, labels, pricing.price',
        ExpressionAttributeValues: {
            ':visible': true
        },
        FilterExpression: 'visible = :visible',
        Limit: 10
    };
    try {
        const data = await docClient.scan(params).promise();
        return formatResponse(serialize(data.Items));
    } catch (err) {
        // All log statements are written to CloudWatch
        console.info(`response from: ${event.path} statusCode: ${err.statusCode} body: ${err.body}`);
        return formatResponse(serialize(err), 500);
    }
};
