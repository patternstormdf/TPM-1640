import * as AWS from 'aws-sdk'
import {Message} from '../src/lambda/handler'

test("Send a well-formed message containing a keyword to the SQS queue", async () => {
    AWS.config.credentials = new AWS.SharedIniFileCredentials({profile: "p2vtpm"})
    const sqs: AWS.SQS = new AWS.SQS({region: "us-east-1"})
    const message: Message = {
        productID: "xyzzy420",
        textFields: {
            title: "How to use Oracle Cloud",
            description: "The definitive guide to using the world's leading cloud platform that isn't AWS, Azure, GCP, or several others."
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
    AWS.config.credentials = new AWS.SharedIniFileCredentials({profile: "p2vtpm"})
    const sqs: AWS.SQS = new AWS.SQS({region: "us-east-1"})
    const messages: any[] = [{
        productID: "1111111",
        textFields: {
            field1: "AWS",
            field2: "value2"
        }
    }, {
        product: "111111F",
        textFields: {
            field1: "AWS",
            field2: "value2"
        }
    }, {
        productID: "2222222",
        textFields: {
            field1: "value1",
            field2: "Oracle"
        }
    }, {
        product: "222222F",
        textFields: {
            field1: "AWS",
            field2: "value2"
        }
    }, {
        product: "333333F",
        textFields: {
            field1: "AWS",
            field2: "value2"
        }
    }, {
        productID: "3333333",
        textFields: {
            field1: "IBM",
            field2: "value2"
        }
    }, {
        productID: "4444444",
        textFields: {
            field1: "Oracle",
            field2: "AWS",
            field3: "GCP"
        }
    }, {
        productID: "4444444F",
        fields: {
            field1: "GCP",
            field2: "Oracle",
            field3: "AWS"
        }
    }, {
        productID: "5555555",
        textFields: {
            field1: "value1",
            field2: "oracle",
            field3: "AWS"
        }
    }, {
        id: "555555F",
        textFields: {
            field1: "value1",
            field2: "GCP",
            field3: "value2"
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
    AWS.config.credentials = new AWS.SharedIniFileCredentials({profile: "p2vtpm"})
    const sqs: AWS.SQS = new AWS.SQS({region: "us-east-1"})
    const message: any = {
        textFields: {
            field1: "AWS",
            field2: "Oracle"
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
