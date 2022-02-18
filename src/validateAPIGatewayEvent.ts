import { APIGatewayEvent } from 'aws-lambda';
import validateQueryStringParams, { ValidatorConfiguration } from './validateQueryStringParams';

export default function validateAPIGatewayEvent (event: APIGatewayEvent, config: ValidatorConfiguration) {
	const [ queryStringParameters, queryStringParametersErrors ] =
		validateQueryStringParams(event.queryStringParameters || {}, config);

	return [
		{ queryStringParameters },
		{ queryStringParameters: queryStringParametersErrors },
	];
}

