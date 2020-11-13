// Import all functions from get-all-items.ts
import * as lambda from '../../../src/handlers/get-all-items';
// Import dynamodb from aws-sdk
import dynamodb from 'aws-sdk/clients/dynamodb';
import { APIGatewayEvent } from 'aws-lambda';
import { serialize } from '../../../src/util/common';

// This includes all tests for getAllItemsHandler() 
describe('Test getAllItemsHandler', () => {
    let scanSpy: any;

    // Test one-time setup and teardown, see more in https://jestjs.io/docs/en/setup-teardown 
    beforeAll(() => {
        // Mock dynamodb get and put methods 
        // https://jestjs.io/docs/en/jest-object.html#jestspyonobject-methodname 
        scanSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'scan');
    });

    // Clean up mocks 
    afterAll(() => {
        scanSpy.mockRestore();
    });

    it('should return ids', async () => {
        const items = [
            {
                detailUrl: '/car1',
                id: '1',
                pricing: {
                    price: 99
                },
                teaser: {
                    title: 'Car1',
                    teaserImage: 'https://example.com/car.jpg'
                },
                labels: []
            },
            {
                detailUrl: '/car2',
                id: '2',
                pricing: {
                    price: 15
                },
                teaser: {
                    title: 'Car2',
                    teaserImage: 'https://example.com/car.jpg'
                },
                labels: []
            },
            {
                detailUrl: '/car3',
                id: '3',
                pricing: {
                    price: 10
                },
                teaser: {
                    title: 'Car3',
                    teaserImage: 'https://example.com/car.jpg'
                },
                labels: []
            }
        ];

        // Return the specified value whenever the spied scan function is called 
        scanSpy.mockReturnValue({
            promise: () => Promise.resolve({ Items: [...items] })
        });

        const event = {
            httpMethod: 'GET'
        };

        // Invoke helloFromLambdaHandler() 
        const result = await lambda.getAllItemsHandler(event as APIGatewayEvent);

        const expectedResult = {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            isBase64Encoded: false,
            body: serialize({ items: items.reverse(), count: 3 })
        };

        // Compare the result with the expected result 
        expect(result).toEqual(expectedResult);
    });
}); 
