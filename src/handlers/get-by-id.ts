import { APIGatewayEvent } from 'aws-lambda';
import dynamodb from 'aws-sdk/clients/dynamodb';
import AWS from 'aws-sdk';
import { formatResponse, serialize } from '../util/common';

AWS.config.update({
    region: 'eu-central-1'
});

const tableName = process.env.DYNAMODB_TABLE || 'cluno-api-offers';
const docClient = new dynamodb.DocumentClient();

/**
 * A simple example includes a HTTP get method to get one offer by id from a DynamoDB table.
 */
export const getByIdHandler = async (event: APIGatewayEvent): Promise<any> => {
    if (event.httpMethod !== 'GET') {
        return formatResponse(
            serialize({ error: `getMethod only accept GET method, you tried: ${event.httpMethod}` }),
            400
        );
    }
    // All log statements are written to CloudWatch
    console.info('received:', event);
    // Get id from pathParameters from APIGateway because of `/{id}` at template.yml
    const id = event.pathParameters?.id;
    // Get Offer details
    const params = {
        TableName: tableName,
        Key: {
            id: id
        },
        ProjectionExpression:
            'available,car,conditions,estimatedDeliveryTime,id,images,labels,portfolio,pricing,#segment,visible',
        ExpressionAttributeNames: {
            '#segment': 'segment'
        },
        ExpressionAttributeValues: {
            ':visible': true
        },
        FilterExpression: 'visible = :visible'
    };
    try {
        const data = await docClient.get(params).promise();
        return formatResponse(serialize(data.Item));
    } catch (err) {
        // All log statements are written to CloudWatch
        console.info(`response from: ${event.path} statusCode: ${err.statusCode} body: ${err.body}`);
        return formatResponse(serialize(err), 500);
    }
};
