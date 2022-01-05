import * as lambda from "@aws-cdk/aws-lambda"
import * as core from "@aws-cdk/core"
import {Resource} from "./Resource"
import {Application} from "./Application"
import {isDefined} from "./Utils"
import {IAM} from "./IAM"


export namespace Lambda {

    export class Function extends Resource {
        readonly directory: string
        readonly handler: string
        readonly permissions: IAM.Permissions | undefined
        readonly destination: Destination | undefined

        constructor(id: string, directory: string, handler: string, tags: Resource.Tag[],
                    permissions?: IAM.Permissions,
                    destination?: Destination) {
            super(id, tags)
            this.handler = handler
            this.directory = directory
            if (isDefined(destination)) this.destination = destination
            if (isDefined(permissions)) this.permissions = permissions
        }

        _instantiate(application: Application): Function.Instance {
            let props: lambda.FunctionProps = {
                functionName: this.id,
                runtime: lambda.Runtime.NODEJS_12_X,
                handler: this.handler,
                code: lambda.Code.fromAsset(this.directory)
            }
            if (isDefined(this.destination))
                props = {...props, ...{onSuccess: this.destination.for(application)}}
            const instance: Function.Instance = new Function.Instance(application, this.id, props)
            if (isDefined(this.permissions)) instance.addToRolePolicy(this.permissions.instantiate(application))
            return instance
        }
    }

    export namespace Function {

        export class Instance extends lambda.Function implements Resource.Instance.Operations {
            get arn(): string {
                const cfn: core.CfnResource = this.node.defaultChild as core.CfnResource
                return cfn.getAtt("Arn").toString()
            }
        }

    }

    export abstract class Destination {
        readonly id: string
        readonly target: Resource
        private _instances: Map<string, Destination.Instance> = new Map()

        protected constructor(id: string, target: Resource) {
            this.id = id
            this.target = target
        }

        protected abstract _instantiate(application: Application): Destination.Instance

        for(application: Application): Destination.Instance {
            if (!isDefined(application.getResource(this.target))) throw new Error(`The application ${application.id} does not have the target resource ${this.target.id}`)
            let instance: Destination.Instance | undefined = this._instances.get(application.id)
            if (isDefined(instance)) return instance
            instance = this._instantiate(application)
            this._instances.set(application.id, instance)
            return instance
        }
    }

    export namespace Destination {
        export type Instance = lambda.IDestination
    }

}







