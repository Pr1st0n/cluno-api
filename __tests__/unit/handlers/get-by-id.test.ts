// Import dynamodb from aws-sdk
import dynamodb from 'aws-sdk/clients/dynamodb';
// Import all functions from get-by-id.ts
import * as lambda from '../../../handlers/get-by-id';
import { APIGatewayEvent } from 'aws-lambda';

// This includes all tests for getByIdHandler()
describe('Test getByIdHandler', () => {
    let getSpy: any;

    // Test one-time setup and teardown, see more in https://jestjs.io/docs/en/setup-teardown 
    beforeAll(() => {
        // Mock dynamodb get and put methods 
        // https://jestjs.io/docs/en/jest-object.html#jestspyonobject-methodname 
        getSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'get');
    });

    // Clean up mocks 
    afterAll(() => {
        getSpy.mockRestore();
    });

    // This test invokes getByIdHandler() and compare the result  
    it('should get item by id', async () => {
        const item = { id: 'id1' };

        // Return the specified value whenever the spied get function is called 
        getSpy.mockReturnValue({
            promise: () => Promise.resolve({ Item: item })
        });

        const event: any = {
            httpMethod: 'GET',
            pathParameters: {
                id: 'id1'
            }
        };

        // Invoke getByIdHandler() 
        const result = await lambda.getByIdHandler(event as APIGatewayEvent);

        const expectedResult = {
            statusCode: 200,
            body: JSON.stringify(item)
        };

        // Compare the result with the expected result 
        expect(result).toEqual(expectedResult);
    });
}); 
 