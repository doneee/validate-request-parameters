import { APIGatewayEvent } from 'aws-lambda';
import validateParams, { ValidatorConfiguration } from './validateParams';

export interface APIGatewayEventValidatorConfiguration {
	pathParameters?: ValidatorConfiguration,
	queryStringParameters?: ValidatorConfiguration,
	multiValueQueryStringParameters?: ValidatorConfiguration,
};

export interface APIGatewayParameters {
	pathParameters?: { [key: string]: string | undefined } | null,
	queryStringParameters?: { [key: string]: string | undefined } | null,
	multiValueQueryStringParameters?: { [key: string]: string[] | undefined} | null,
}

export default function validateAPIGatewayEvent (
	event: APIGatewayEvent,
	config: APIGatewayEventValidatorConfiguration
) {
	const [ queryStringParameters, queryStringParametersErrors ] =
		validateParams(
			event.queryStringParameters || {},
			config.queryStringParameters || {},
	);

	const [ pathParameters, pathParametersErrors ] =
		validateParams(event.pathParameters || {}, config.pathParameters || {});

	return [
		{ queryStringParameters, pathParameters },
		{
			queryStringParameters: queryStringParametersErrors,
			pathParameters: pathParametersErrors,
		},
	];
}

