import {
  Schema, JsonapiManager
} from "hotpot-jsonapi";
import {buildJsonapiManager} from '../src/index';

describe('core', () => {
  test('create jsonapi manager', () => {
    const m = buildJsonapiManager({
      schema: new Schema({
        store: {
          type: 'commerce_store--online',
          primary: 'id',
          attributes: {
            name: {
              type: "string"
            },
            mail: {
              type: "string"
            },
            address: {
              type: "string"
            }
          }
        }
      }),
      host: 'http://jsonapi.org/jsonapi'
    });

    expect(m).toBeInstanceOf(JsonapiManager)
  })
});
