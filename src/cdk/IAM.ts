import * as iam from "@aws-cdk/aws-iam"
import {Resource} from "./Resource"
import {Application} from "./Application"
import {isDefined} from "./Utils"

export namespace IAM {

    export class Permissions {
        actions: string[]
        effect: Permissions.Effect
        resources: Resource[]

        constructor(actions: string[], effect: Permissions.Effect, resources: Resource[]) {
            this.actions = actions
            this.effect = effect
            this.resources = resources
        }

        instantiate(application: Application): Permissions.Instance {
            const instances: Resource.Instance[] = this.resources.map(resource => {
                if (!isDefined(application.getResource(resource)))
                    throw new Error(`The application ${application.id} has not the resource ${resource.id}`)
                return resource.for(application)
            })
            return new iam.PolicyStatement({
                actions: this.actions,
                effect: this.effect as iam.Effect,
                resources: instances.map(instance => instance.arn)
            })
        }
    }

    export namespace Permissions {
        export type Instance = iam.PolicyStatement
        export type Effect = "Allow" | "Deny"
    }
}
