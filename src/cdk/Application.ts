import cdk = require('@aws-cdk/core')
import {Resource} from "./Resource"
import {isDefined} from "./Utils"

export class Application extends cdk.Stack {
  id: string

  private _resources: Map<string, Resource> = new Map()
  private _eventSources: Map<string, Resource.EventSource> = new Map()

  static new(account: string, region: string, id: string): Application {
    const env: cdk.Environment = {account: account, region: region}
    return new Application(new cdk.App(), id,{env: env})
  }

  private constructor(scope: cdk.Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props)
    this.id = id
  }

  addResource(resource: Resource): void {
    if (isDefined(this._resources.get(resource.id)))
      throw new Error(`Duplicated resource. ${JSON.stringify(resource)}`)
    this._resources.set(resource.id, resource)
  }

  addEventSource(eventSource: Resource.EventSource): void {
    if (isDefined(this._eventSources.get(eventSource.id)))
      throw new Error(`Duplicated event source. ${JSON.stringify(eventSource)}`)
    if (!isDefined(this._resources.get(eventSource.source.id)))
      throw new Error(`The application ${this.id} does not have the resource ${eventSource.source.id}`)
    if (!isDefined(this._resources.get(eventSource.target.id)))
      throw new Error(`The application ${this.id} does not have the resource ${eventSource.target.id}`)
    this._eventSources.set(eventSource.id, eventSource)
  }

  getResource(resource: Resource): Resource | undefined {
    return this._resources.get(resource.id)
  }

  getEventSource(eventSource: Resource.EventSource): Resource.EventSource | undefined {
    return this._eventSources.get(eventSource.id)
  }

  get resources(): Resource[] {
    return Array.from(this._resources.values())
  }

  get eventSources(): Resource.EventSource[] {
    return Array.from(this._eventSources.values())
  }

  create(): void {
    this.resources.map(resource => resource.for(this))
    this.eventSources.map(eventSource => eventSource.for(this))
  }
}
