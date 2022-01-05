import * as AWS from "aws-sdk"

export type Event = { Records: Record[] }

export type Record = {
    messageId: string,
    receiptHandle: string,
    eventSourceARN: string,
    body: string
}

export type Message = {
    productId: string,
    textFields: { [key: string]: string }
}

type UnprocessedMessage = {
    itemIdentifier: string
}

type Output = {
    productId: string,
    flaggedWords: string[]
}

const keywords: string[] = ["key1", "key2", "key3"]

function isDefined<T>(argument: T | undefined | null): argument is T {
    return (argument !== undefined) && (argument !== null)
}

function processRecord(record: Record): Output {
    if (
        !isDefined(record.messageId) ||
        !isDefined(record.body) ||
        !isDefined(record.receiptHandle) ||
        !isDefined(record.eventSourceARN)
    ) throw new Error(`malformed record ${JSON.stringify(record)}`)
    const message: Message = JSON.parse(record.body)
    if (!isDefined(message.productId) || !isDefined(message.textFields))
        throw new Error(`malformed message ${JSON.stringify(record)}`)
    let output: Output = {
        productId: message.productId,
        flaggedWords: []
    }
    const body: string = record.body
    keywords.map(keyword => {
        if (body.includes(keyword)) output.flaggedWords = output.flaggedWords.concat(keyword)
    })
    return output
}

function getQueueURL(sqs: AWS.SQS, record: Record): string {
    const tokens: string[] = record.eventSourceARN.split(":")
    return `${sqs.endpoint.href}${tokens[4]}/${tokens[5]}`
}

async function notifyMatch(sns: AWS.SNS, output: Output): Promise<void> {
    const params: AWS.SNS.Types.PublishInput = {
        TopicArn: "arn:aws:sns:us-east-1:162174280605:cpaniagua-aws-lambda-badge1-topic",
        Message: JSON.stringify(output)
    }
    await sns.publish(params).promise()
}

export const handler = async (event: Event, context: any): Promise<any> => {
    let unprocessedMessages: UnprocessedMessage[] = []
    try {
        const sqs: AWS.SQS = new AWS.SQS({region: "us-east-1"})
        const sns: AWS.SNS = new AWS.SNS({region: "us-east-1"})
        console.log(JSON.stringify(event))
        if (!isDefined(event)) throw new Error("message is null or undefined")
        if (!isDefined(event.Records)) throw new Error(`malformed event ${JSON.stringify(event)}`)
        let outputs: Output[] = []
        let errors: string[] = []
        await Promise.all(event.Records.map(async record => {
            try {
                const output: Output = processRecord(record)
                if (output.flaggedWords.length > 0) await notifyMatch(sns, output)
                outputs = outputs.concat(output)
            } catch (err: any) {
                unprocessedMessages = unprocessedMessages.concat({itemIdentifier: record.messageId})
                errors = errors.concat(err.message)
            }
        }))
        if (errors.length != 0) throw new Error(JSON.stringify(errors))
        console.log(JSON.stringify(outputs))
    } catch(err: any) {
        console.log(`ERROR: ${err.message}`)
    } finally {
        console.log(`Unprocessed messages: ${JSON.stringify(unprocessedMessages)}`)
        return { batchItemFailures: unprocessedMessages }
    }
}
