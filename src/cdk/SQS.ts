import * as sqs from "@aws-cdk/aws-sqs"
import {Resource} from "./Resource"
import {Application} from "./Application"
import { SqsEventSource } from '@aws-cdk/aws-lambda-event-sources'
import {Lambda} from "./Lambda"
import * as core from "@aws-cdk/core"

export namespace SQS {

    export class Queue extends Resource {
        retries: number

        constructor(id: string, retries: number, tags: Resource.Tag[]) {
            super(id, tags)
            this.retries = retries
        }

        _instantiate(application: Application): Queue.Instance {
            const deadLetterQueue: Queue.Instance = new Queue.Instance(application,
                `${this.id}-dead-letter`, {
                queueName: `${this.id}-dead-letter`,
            })
            const props: sqs.QueueProps = {
                queueName: this.id,
                deadLetterQueue: {
                    queue: deadLetterQueue,
                    maxReceiveCount: this.retries
                }
            }
            return new Queue.Instance(application, this.id, props)
        }
    }

    export namespace Queue {
        export class Instance extends sqs.Queue implements Resource.Instance.Operations {
            get arn(): string {
                const cfn: core.CfnResource = this.node.defaultChild as core.CfnResource
                return cfn.getAtt("Arn").toString()
            }
        }
    }

    export class EventSource extends Resource.EventSource {
        queue: SQS.Queue
        lambda: Lambda.Function
        batchSize: number
        reportBatchItemFailures: boolean

        constructor(queue: SQS.Queue, lambda: Lambda.Function, batchSize: number, reportBatchItemFailures: boolean) {
            super(`event-source-${queue.id}-${lambda.id}`, queue, lambda)
            this.queue = queue
            this.lambda = lambda
            this.batchSize = batchSize
            this.reportBatchItemFailures = reportBatchItemFailures
        }

        _instantiate(application: Application): Resource.EventSource.Instance {
            const queue: Queue.Instance | undefined = this.queue.for(application) as Queue.Instance
            const lambda: Lambda.Function.Instance | undefined = this.lambda.for(application) as Lambda.Function.Instance
            const eventSource: SqsEventSource = new SqsEventSource(queue as Queue.Instance, {
                batchSize: this.batchSize,
                reportBatchItemFailures: this.reportBatchItemFailures
            })
            lambda.addEventSource(eventSource)
            return eventSource
        }
    }
}
