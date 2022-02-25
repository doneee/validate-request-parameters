import { applyTransforms, TransformFn } from '@doneee/composable-transform-functions';

export interface QueryString {
	[key: string]: string|number|boolean|null|undefined;
}
export interface QueryStringErrors {
	[key: string]: string[];
}

export enum QueryStringValueTypes {
	String = 'string',
	Number = 'number',
	Integer = 'integer',
}

export interface ValidatorConfigurationItem {
	type?: QueryStringValueTypes,
	defaultValue?: string|number|null,
	min?: number,
	max?: number,
	regex?: RegExp,
	options?: string[],
	transforms?: TransformFn[],
}

export interface ValidatorConfiguration {
	[key: string]: ValidatorConfigurationItem,
};

export default function validateParams (
	params: QueryString,
	config: ValidatorConfiguration
): [QueryString, QueryStringErrors] {
	if (!params) throw new Error('No parameters');

	const validatedParams: QueryString = {};
	const failedValidations: QueryStringErrors = {};

	Object.keys(config).forEach((key) => {
		const {
			type = QueryStringValueTypes.String,
			required,
			defaultValue,
			transforms = [],
		}:{
			type?: QueryStringValueTypes,
			required?: boolean,
			defaultValue?: string|number|null,
			transforms?: TransformFn[],
		} = config[key];

		let value = params[key];

		const defaultTypes: {[key in QueryStringValueTypes]:any} = {
			string: (value: string) => String(value),
			number: (value: string) => Number(value),
			integer: (value: string) => Number(value),
		};

		if (value === undefined || value === null) {
			if(defaultValue !== undefined) {
				validatedParams[key] = defaultTypes[type](defaultValue);
			}

			if (required && defaultValue === undefined) {
				failedValidations[key] = ['parameter required'];
			}
			return;
		}

		// Apply transforms to the initial value, if any are set
		value = applyTransforms(value, transforms) as string;

		const validators: {[key in QueryStringValueTypes]:any} = {
			string: validateString,
			number: validateNumber,
			integer: validateNumber,
		}; 

		if (validators[type]) {
			const [validatedValue, errors] = validators[type](value as string, config[key]);	
			if (errors.length) {
				if (defaultValue) validatedParams[key] = defaultValue;
				failedValidations[key] = errors; 
			} else {
				validatedParams[key] = validatedValue;
			}
		}
	});

	return [ validatedParams, failedValidations ];
}

function validateString(
	queryValue: string,
	config: ValidatorConfigurationItem,
): [string, string[]] {
	const value = String(queryValue);
	const failures: string[] = [];
	const {
		options,
		min,
		max,
		regex,
	}:{
		options?: string[],
		min?: number,
		max?: number,
		regex?: RegExp,
	} = config;

	if (Array.isArray(options) && !options.includes(value)) {
		failures.push(`invalid option: [${options.join()}]`);
	}


	if (regex !== undefined) {
		regex.lastIndex = 0;
		if (!regex.test(value)) {
			failures.push(`regex test failure: ${regex}`);
		}
	}

	if (min !== undefined && !isNaN(min) && min > value.length) {
		failures.push('below minimum length');
	}

	if (max !== undefined && !isNaN(max) && max < value.length) {
		failures.push('exceeds maximum length');
	}

	return [
		failures.length ? '' : value,
		failures,
	];
}

function validateNumber(
	queryValue: string,
	config: ValidatorConfigurationItem,
): [number, string[]] {
	const value = Number(queryValue);
	const failures: string[] = [];
	const {
		type = QueryStringValueTypes.String,
		min,
		max,
	}:{
		type?: QueryStringValueTypes,
		min?: number,
		max?: number,
	} = config;

	if (type === QueryStringValueTypes.Integer && (isNaN(value) || !Number.isInteger(value))) {
			failures.push('not an integer');
	} else if (isNaN(value)) {
		failures.push('not a number');
	} else {
		if (min !== undefined && !isNaN(min) && min > value) {
			failures.push('below minimum value');
		}

		if (max !== undefined && !isNaN(max) && max < value) {
			failures.push('exceeds maximum value');
		}
	}

	return [
		failures.length ? 0 : value,
		failures,
	];
}

