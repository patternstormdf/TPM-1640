import * as CDK from "@aws-cdk/core"
import {Application} from "./Application"
import {Tags} from "@aws-cdk/core"
import * as lambda from "@aws-cdk/aws-lambda"
import {isDefined} from "./Utils"

export abstract class Resource {
    readonly id: string
    readonly tags: Resource.Tag[]
    private _instances: Map<string, Resource.Instance> = new Map()

    protected constructor(id: string, tags: Resource.Tag[]) {
        this.id = id
        this.tags = tags
    }

    protected abstract _instantiate(application: Application): Resource.Instance

    for(application: Application): Resource.Instance {
        if (!isDefined(application.getResource(this)))
            throw new Error(`The application ${application.id} does not have the resource ${this.id}`)
        let instance: Resource.Instance | undefined = this._instances.get(application.id)
        if (isDefined(instance)) return instance
        instance = this._instantiate(application)
        const tags: CDK.Tags = Tags.of(instance)
        this.tags.map(tag => tags.add(tag.key, tag.value))
        this._instances.set(application.id, instance)
        return instance
    }
}

export namespace Resource {

    export type Instance = CDK.Resource & Instance.Operations

    export namespace Instance {

        export interface Operations {
            get arn(): string
        }
    }

    export type Tag = {key: string, value: string}

    export abstract class EventSource {
        readonly id: string
        readonly source: Resource
        readonly target: Resource
        private _instances: Map<string, EventSource.Instance> = new Map()

        protected constructor(id: string, source: Resource, target: Resource) {
            this.id = id
            this.source = source
            this.target = target
        }

        protected abstract _instantiate(application: Application): EventSource.Instance

        for(application: Application): EventSource.Instance {
            if (!isDefined(application.getEventSource(this)))
                throw new Error(`The application ${application.id} does not have the event source ${this.id}`)
            let instance: EventSource.Instance | undefined = this._instances.get(application.id)
            if (isDefined(instance)) return instance
            instance = this._instantiate(application)
            this._instances.set(application.id, instance)
            return instance
        }
    }

    export namespace EventSource {
        export type Instance = lambda.IEventSource
    }
}

