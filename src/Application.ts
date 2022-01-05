#!/usr/bin/env node
import 'source-map-support/register'
import {Application} from './cdk/Application'
import {Resource} from "./cdk/Resource"
import {SQS} from "./cdk/SQS"
import {Lambda} from "./cdk/Lambda"
import {SNS} from "./cdk/SNS"
import {IAM} from "./cdk/IAM"

const tags: Resource.Tag[] = [
    {key: "owner", value : "cpaniagua"},
    {key: "purpose", value: "https://devgraph-alp.atlassian.net/browse/TPM-1640"}
]

export const prefixId: string = "cpaniagua-aws-lambda-badge1"

const stack = Application.new( "162174280605", "us-east-1", `${prefixId}-stack`)
const topic: SNS.Topic = new SNS.Topic(`${prefixId}-topic`, tags)
stack.addResource(topic);
const lambdaPermissions: IAM.Permissions = new IAM.Permissions(
    ["SNS:Publish"],
    "Allow",
    [topic]
)
const lambda: Lambda.Function = new Lambda.Function(
    `${prefixId}-lambda`, "./src/lambda",
    "handler.handler", tags, lambdaPermissions)
stack.addResource(lambda);
const queue: SQS.Queue = new SQS.Queue(`${prefixId}-queue`, 1, tags)
stack.addResource(queue)
stack.addEventSource(new SQS.EventSource(queue, lambda, 10, true))
stack.create()
