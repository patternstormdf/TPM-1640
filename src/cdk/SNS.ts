import * as sns from "@aws-cdk/aws-sns"
import { SnsDestination } from '@aws-cdk/aws-lambda-destinations'
import {Resource} from "./Resource"
import {Application} from "./Application"
import {Lambda} from "./Lambda"
import * as core from "@aws-cdk/core"


export namespace SNS {

    export class Topic extends Resource {

        constructor(id: string, tags: Resource.Tag[]) {
            super(id, tags)
        }

        _instantiate(application: Application): Topic.Instance {
            const props: sns.TopicProps = {
                displayName: this.id,
                topicName: this.id
            }
            return new Topic.Instance(application, this.id, props)
        }
    }

    export namespace Topic {

        export class Instance extends sns.Topic implements Resource.Instance.Operations {
            get arn(): string {
                const cfn: core.CfnResource = this.node.defaultChild as core.CfnResource
                return cfn.ref
            }
        }

        export class Destination extends Lambda.Destination {
            topic: SNS.Topic

            constructor(id: string, topic: SNS.Topic) {
                super(id, topic)
                this.topic = topic
            }

            _instantiate(application: Application): Lambda.Destination.Instance {
                const topic: Topic.Instance | undefined = this.topic.for(application) as Topic.Instance
                // TODO find out why the line below does not compile
                // @ts-ignore
                return new SnsDestination(topic)
            }
        }
    }



}





