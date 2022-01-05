import * as AWS from 'aws-sdk'
import {Message} from '../src/lambda/handler'

test("Send a well-formed message containing a keyword to the SQS queue", async () => {
    const sqs: AWS.SQS = new AWS.SQS({region: "us-east-1"})
    const message: Message = {
        productId: "7824762567",
        textFields: {
            field1: "key1",
            field2: "value2"
        }
    }
    const params: AWS.SQS.Types.SendMessageRequest = {
        QueueUrl: "https://sqs.us-east-1.amazonaws.com/162174280605/cpaniagua-aws-lambda-badge1-queue",
        MessageBody: JSON.stringify(message),
        DelaySeconds: 0
    }
    const output: AWS.SQS.Types.SendMessageResult = await sqs.sendMessage(params).promise()
    console.log(JSON.stringify(output))
})

test("Send a series of well-formed and mal-formed messages containing a keyword to the SQS queue", async () => {
    const sqs: AWS.SQS = new AWS.SQS({region: "us-east-1"})
    const messages: any[] = [{
        productId: "1111111",
        textFields: {
            field1: "key1",
            field2: "value2"
        }
    }, {
        product: "111111F",
        textFields: {
            field1: "key1",
            field2: "value2"
        }
    }, {
        productId: "2222222",
        textFields: {
            field1: "value1",
            field2: "key2"
        }
    }, {
        product: "222222F",
        textFields: {
            field1: "key1",
            field2: "value2"
        }
    }, {
        product: "333333F",
        textFields: {
            field1: "key1",
            field2: "value2"
        }
    }, {
        productId: "3333333",
        textFields: {
            field1: "value1",
            field2: "value2"
        }
    }, {
        productId: "4444444",
        textFields: {
            field1: "key1",
            field2: "key2",
            field3: "key3"
        }
    }, {
        productId: "4444444F",
        fields: {
            field1: "key1",
            field2: "key2",
            field3: "key3"
        }
    }, {
        productId: "5555555",
        textFields: {
            field1: "key1",
            field2: "value",
            field3: "key3"
        }
    }, {
        id: "555555F",
        textFields: {
            field1: "key1",
            field2: "value",
            field3: "key3"
        }
    }]
    await Promise.all(messages.map(async message => {
        const params: AWS.SQS.Types.SendMessageRequest = {
            QueueUrl: "https://sqs.us-east-1.amazonaws.com/162174280605/cpaniagua-aws-lambda-badge1-queue",
            MessageBody: JSON.stringify(message),
            DelaySeconds: 0
        }
        const output: AWS.SQS.Types.SendMessageResult = await sqs.sendMessage(params).promise()
        console.log(JSON.stringify(output))
    }))
})

test("Send a mal-formed message to the SQS queue", async () => {
    const sqs: AWS.SQS = new AWS.SQS({region: "us-east-1"})
    const message: any = {
        textFields: {
            field1: "key1",
            field2: "value2"
        }
    }
    const params: AWS.SQS.Types.SendMessageRequest = {
        QueueUrl: "https://sqs.us-east-1.amazonaws.com/162174280605/cpaniagua-aws-lambda-badge1-queue",
        MessageBody: JSON.stringify(message),
        DelaySeconds: 0
    }
    const output: AWS.SQS.Types.SendMessageResult = await sqs.sendMessage(params).promise()
    console.log(JSON.stringify(output))
})
