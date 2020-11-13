import AWS from 'aws-sdk';
import { AWSError } from 'aws-sdk/lib/error';
import * as https from 'https';

AWS.config.update({
    region: 'eu-central-1'
});

const url = process.env.DYNAMODB_EXPORT_JSON;
if (!url || !url.length) {
    console.log('Unable to import data. Export file URL is not defined');
    process.exit();
}
const docClient = new AWS.DynamoDB.DocumentClient();
const importData = (rawData: string) => {
    const data = JSON.parse(rawData);

    data.Items.forEach((item: any) => {
        const params = {
            TableName: process.env.DYNAMODB_TABLE || 'cluno-api-offers',
            Item: AWS.DynamoDB.Converter.unmarshall(item)
        };

        docClient.put(params, (err: AWSError) => {
            if (err) {
                console.error('Unable to import Offer', params.Item.id, '. Error JSON:', JSON.stringify(err, null, 2));
            } else {
                console.log('PutItem succeeded:', params.Item.id);
            }
        });
    });
};

console.log('Importing offers into DynamoDB. Please wait.');

const req = https.get(url, (res) => {
    let rawData = '';
    res.on('data', chunk => {
        rawData += chunk;
    });
    res.on('error', (error) => {
        console.log(error);
    });
    res.on('end', () => {
        importData(rawData);
    });
});

req.on('error', (error) => {
    console.log(error);
});
