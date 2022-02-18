# validate-request-parameters
The purpose of this module is to enable configurable query parameter validation from HTTP request
events, such as API Gateway Events or Express Routes.

## Key Features
* Type Coercion
* Type Enforcement
* Default Values
* Defined Value Options
* Regular Expression Matching
* Apply Transforms to Values
* Numeric Value Ranges
* String Length Ranges

## Working
* AWS APIGatewayEvent Handling (Lambda)
* Query String Parameter Validation


# Not Working, yet
* Multi Value Query String Parameters
* Request Body JSON Validation
* Express.js Support

## Lambda API Gateway Example
```typescript
// https://.../query?searchTerm=code&limit=10&offset=10&order=asc&orderBy=name

import {
  validateAPIGatewayEvent,
  QueryStringValueTypes,
} from '@doneee/validate-request-parameters';

import { toUpperCase, toLowerCase } from '@doneee/composable-transform-functions';

const config = {
  offset: {
    type: QueryStringValueTypes.Integer,
    min: 0,
    defaultValue: 0,
  },
  limit: {
    type: QueryStringValueTypes.Integer,
    min: 1,
    max: 100,
    defaultValue: 10,
  },
  searchTerm: {
    type: QueryStringValueTypes.String,
    regex: /[a-z0-9]+/gi,
    min: 4,
    max: 75,
  },
  order: {
    type: QueryStringValueTypes.String,
    options: ['ASC', 'DESC'],
    defaultValue: 'ASC',
    transforms: [ toUpperCase ],
  },
  orderBy: {
    type: QueryStringValueTypes.String,
    transforms: [ toLowerCase ],
    options: [
      'name',
      'date',
    ],
    defaultValue: 'name',
  },
};

exports.handler = (event) => {
  const [ params, paramErrors ] = validateAPIGatewayEvent(event, config);
  
  // params = {
  //  queryStringParameters: {
  //    offset: 10,
  //    limit: 10,
  //    searchTerm: 'code',
  //    order: 'ASC',
  //    orderBy: 'name',
  //   },
  // };

  // Use params without needing to do additional type checks or validation
}
```
