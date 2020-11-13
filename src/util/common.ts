export const formatResponse = (body: string, status= 200) => {
    return {
        statusCode: status,
        headers: {
            'Content-Type': 'application/json'
        },
        isBase64Encoded: false,
        body: body
    };
};

export const serialize = (object: any) => {
    return JSON.stringify(object, null, 2);
};
