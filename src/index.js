// create jsonapi manager
import {
  JsonapiManager
} from "hotpot-jsonapi"
import Deserializer from './lib/jsonapi-serializer/deserializer'
import {URLBuilder} from './url-builder'
import {HttpClient} from './http-client'

const builder = new URLBuilder()

export const buildJsonapiManager = (options) => {
  return new JsonapiManager({
    ...options,
    httpClient: new HttpClient(builder),
    deserializer: new Deserializer({
      keyForAttribute: 'camelCase'
    })
  })
}
