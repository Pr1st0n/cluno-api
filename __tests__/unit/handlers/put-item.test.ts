// Import all functions from put-item.ts
import * as lambda from '../../../handlers/put-item';
// Import dynamodb from aws-sdk
import dynamodb from 'aws-sdk/clients/dynamodb';
import { APIGatewayEvent } from 'aws-lambda';

// This includes all tests for putItemHandler()
describe('Test putItemHandler', function () {
    let putSpy: any;

    // Test one-time setup and teardown, see more in https://jestjs.io/docs/en/setup-teardown 
    beforeAll(() => {
        // Mock dynamodb get and put methods 
        // https://jestjs.io/docs/en/jest-object.html#jestspyonobject-methodname 
        putSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'put');
    });

    // Clean up mocks 
    afterAll(() => {
        putSpy.mockRestore();
    });

    // This test invokes putItemHandler() and compare the result  
    it('should add id to the table', async () => {
        const returnedItem = { id: 'id1', name: 'name1' };

        // Return the specified value whenever the spied put function is called 
        putSpy.mockReturnValue({
            promise: () => Promise.resolve(returnedItem)
        });

        const event = {
            httpMethod: 'POST',
            body: '{"id": "id1","name": "name1"}'
        };

        // Invoke putItemHandler() 
        const result = await lambda.putItemHandler(event as APIGatewayEvent);
        const expectedResult = {
            statusCode: 200,
            body: JSON.stringify(returnedItem)
        };

        // Compare the result with the expected result 
        expect(result).toEqual(expectedResult);
    });
}); 
 