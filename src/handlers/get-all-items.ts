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
 * A simple example includes a HTTP get method to get all offers from a DynamoDB table.
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
    const params = buildParams(event.queryStringParameters);
    try {
        const data = await docClient.scan(params).promise();
        const limit = parseInt(event.queryStringParameters?.limit || '', 10) || data.Items?.length || 0;
        const items = processItems(data.Items, limit);
        return formatResponse(serialize({ items: items, count: items.length }));
    } catch (err) {
        // All log statements are written to CloudWatch
        console.info(`response from: ${event.path} statusCode: ${err.statusCode} body: ${err.body}`);
        return formatResponse(serialize(err), 500);
    }
};

const buildParams = (queryString: { [name: string]: string } | null ): dynamodb.DocumentClient.ScanInput => {
    const params: dynamodb.DocumentClient.ScanInput = {
        TableName: tableName,
        ProjectionExpression: 'id,teaser,detailUrl,labels,pricing.price',
        ExpressionAttributeValues: {
            ':visible': true, // Return only visible offers
            ':portfolio': '0001'
        },
        FilterExpression: 'visible = :visible AND portfolio = :portfolio'
    };

    if (!queryString) {
        return params;
    }

    if (queryString?.portfolio && queryString.portfolio.length) {
        params.ExpressionAttributeValues![':portfolio'] = queryString.portfolio;
    }

    // Apply 'make' filter
    if (queryString?.make && queryString.make.length) {
        let makes = queryString.make.split(',');
        makes = makes.map((val, idx) => {
            const name = ':make' + idx;
            params.ExpressionAttributeValues![name] = val;
            return name;
        });
        params.FilterExpression += ` AND car.make IN (${makes.join(',')})`;
    }

    // Apply 'price' range filter
    if (queryString?.price && queryString.price.length) {
        const price = queryString.price.split(',');
        const pmin = parseInt(price[0], 10);
        const pmax = parseInt(price[1], 10);
        if (price.length !== 2 || !pmin || !pmax || pmin > pmax) {
            return params; // Ignore invalid filter
        }
        params.ExpressionAttributeValues![':pmin'] = pmin;
        params.ExpressionAttributeValues![':pmax'] = pmax;
        params.FilterExpression += ' AND pricing.price BETWEEN :pmin AND :pmax';
    }

    return params;
};

const processItems = (items: dynamodb.DocumentClient.ItemList | undefined, limit: number) => {
    if (!items) {
        return [];
    }

    items.sort((a: dynamodb.DocumentClient.AttributeMap, b: dynamodb.DocumentClient.AttributeMap) => {
        if (a.pricing.price < b.pricing.price) {
            return -1;
        }
        if (a.pricing.price > b.pricing.price) {
            return 1;
        }
        return 0;
    });

    return items.slice(0, limit);
};
