import { expect } from 'chai';
import {
	validateParams,
	validateAPIGatewayEvent,
	QueryStringValueTypes,
} from '../src/index';
import APIGatewayEventStub from './APIGatewayEventStub';
import { toUpperCase } from '@doneee/composable-transform-functions';

describe('validateParams', () => {
	it('is a function', () => {
		expect(validateParams).to.be.a('function');
	});

	describe('required fields', () => {
		it('error on undefined', () => {
			const params = {
			};

			const config = {
				item: {
					type: QueryStringValueTypes.Integer,
					required: true,
				},
			};

			const [results, errors] = validateParams(params, config);
			expect(results).to.deep.equal({});
			expect(errors).to.deep.equal({ item: ['parameter required'] });
		});
	});

	describe('defaultValue tests', () => {
		it('defaultValue returned when undefined', () => {
			const params = {
			};

			const config = {
				item: {
					type: QueryStringValueTypes.Integer,
					defaultValue: 5,
				},
			};

			const [results, errors] = validateParams(params, config);
			expect(results).to.deep.equal({ item: 5 });
			expect(errors).to.deep.equal({});
		});

		it('defaultValue returned when failing validation', () => {
			const params = {
				item: 'test',
			};

			const config = {
				item: {
					type: QueryStringValueTypes.Integer,
					defaultValue: 5,
				},
			};

			const [results, errors] = validateParams(params, config);
			expect(results).to.deep.equal({ item: 5 });
			expect(errors).to.deep.equal({ item: ['not an integer'] });
		});
	});

	describe('type coercion', () => {
		it('converts integers', () => {
			const params = {
				item: '1',
			};

			const config = {
				item: {
					type: QueryStringValueTypes.Integer,
				},
			};

			const [results, errors] = validateParams(params, config);
			expect(results).to.deep.equal({ item: 1 });
			expect(errors).to.deep.equal({});
		});

		it('converts numbers', () => {
			const params = {
				item: '1.1',
			};

			const config = {
				item: {
					type: QueryStringValueTypes.Number,
				},
			};

			const [results, errors] = validateParams(params, config);
			expect(results).to.deep.equal({ item: 1.1 });
			expect(errors).to.deep.equal({});
		});

		it('passes strings', () => {
			const params = {
				item: 'test',
			};

			const config = {
				item: {
					type: QueryStringValueTypes.String,
				},
			};

			const [results, errors] = validateParams(params, config);
			expect(results).to.deep.equal({ item: 'test' });
			expect(errors).to.deep.equal({});
		});
	});

	describe('type coercion failures', () => {
		it('not an integer(float)', () => {
			const params = {
				item: '1.1',
			};

			const config = {
				item: {
					type: QueryStringValueTypes.Integer,
				},
			};

			const [results, errors] = validateParams(params, config);
			expect(results).to.deep.equal({});
			expect(errors).to.deep.equal({ item: ['not an integer']});
		});

		it('not an integer(string)', () => {
			const params = {
				item: 'string',
			};

			const config = {
				item: {
					type: QueryStringValueTypes.Integer,
				},
			};

			const [results, errors] = validateParams(params, config);
			expect(results).to.deep.equal({});
			expect(errors).to.deep.equal({ item: ['not an integer']});
		});

		it('not a number', () => {
			const params = {
				item: 'test',
			};

			const config = {
				item: {
					type: QueryStringValueTypes.Number,
				},
			};

			const [results, errors] = validateParams(params, config);
			expect(results).to.deep.equal({});
			expect(errors).to.deep.equal({ item: ['not a number']});
		});
	});

	describe('handles multiple parameters', () => {
		it('passes multiple valid parameters', () => {
			const params = {
				number: '1.1',
				integer: '5',
				string: 'test',
			};

			const config = {
				number: {
					type: QueryStringValueTypes.Number,
				},
				integer: {
					type: QueryStringValueTypes.Integer,
				},
				string: {
					type: QueryStringValueTypes.String,
				},
			};

			const [results, errors] = validateParams(params, config);
			expect(results).to.deep.equal({ number: 1.1, integer: 5, string: 'test'});
			expect(errors).to.deep.equal({});
		});

		it('passes multiple valid parameters, returns errors', () => {
			const params = {
				number: '1.1',
				integer: '5.5',
				string: 'test',
			};

			const config = {
				number: {
					type: QueryStringValueTypes.Number,
				},
				integer: {
					type: QueryStringValueTypes.Integer,
				},
				string: {
					type: QueryStringValueTypes.String,
				},
			};

			const [results, errors] = validateParams(params, config);
			expect(results).to.deep.equal({ number: 1.1, string: 'test'});
			expect(errors).to.deep.equal({integer: ['not an integer']});
		});
	});

	describe('number validation', () => {
		it('exceeds maximum value', () => {
			const params = {
				number: '50',
			};

			const config = {
				number: {
					type: QueryStringValueTypes.Number,
					max: 10,
				},
			};

			const [results, errors] = validateParams(params, config);
			expect(results).to.deep.equal({});
			expect(errors).to.deep.equal({number: ['exceeds maximum value']});
		});

		it('under minimum value', () => {
			const params = {
				number: '-20',
			};

			const config = {
				number: {
					type: QueryStringValueTypes.Number,
					min: 0,
				},
			};

			const [results, errors] = validateParams(params, config);
			expect(results).to.deep.equal({});
			expect(errors).to.deep.equal({number: ['below minimum value']});
		});
	});


	describe('string validations', () => {
		it('accepts valid option', () => {
			const params = {
				string: 'value1',
			};

			const config = {
				string: {
					type: QueryStringValueTypes.String,
					options: [ 'value1', 'value2', 'value3' ],
				},
			};

			const [results, errors] = validateParams(params, config);
			expect(results).to.deep.equal({ string: 'value1' });
			expect(errors).to.deep.equal({});
		});

		it('rejects invalid option', () => {
			const params = {
				string: 'value4',
			};

			const config = {
				string: {
					type: QueryStringValueTypes.String,
					options: [ 'value1', 'value2', 'value3' ],
				},
			};

			const [results, errors] = validateParams(params, config);
			expect(results).to.deep.equal({});
			expect(errors).to.deep.equal(
				{ string: [`invalid option: [${config.string.options.join()}]`] }
			);
		});

		it('under minimum length', () => {
			const params = {
				string: '1234',
			};

			const config = {
				string: {
					type: QueryStringValueTypes.String,
					min: 5,
				},
			};

			const [results, errors] = validateParams(params, config);
			expect(results).to.deep.equal({});
			expect(errors).to.deep.equal({ string: ['below minimum length'] });
		});

		it('exceeds maximum length', () => {
			const params = {
				string: '1234',
			};

			const config = {
				string: {
					type: QueryStringValueTypes.String,
					max: 3,
				},
			};

			const [results, errors] = validateParams(params, config);
			expect(results).to.deep.equal({});
			expect(errors).to.deep.equal({ string: ['exceeds maximum length'] });
		});

		it('passes regular expression', () => {
			const params = {
				string: '1234',
			};

			const config = {
				string: {
					type: QueryStringValueTypes.String,
					regex: /[0-9]+/gi,
				},
			};

			const [results, errors] = validateParams(params, config);
			expect(results).to.deep.equal({ string: '1234' });
			expect(errors).to.deep.equal({});
		});

		it('fails regular expression', () => {
			const params = {
				string: '1234',
			};

			const config = {
				string: {
					type: QueryStringValueTypes.String,
					regex: /[a-z]+/gi,
				},
			};

			const [results, errors] = validateParams(params, config);
			expect(results).to.deep.equal({});
			expect(errors).to.deep.equal(
				{ string: [`regex test failure: ${config.string.regex}`]}
			);
		});
	});

	describe('string transforms', () => {
		it('applies transforms', () => {
			const params = {
				string: 'abcd',
			};

			const config = {
				string: {
					type: QueryStringValueTypes.String,
					transforms: [ toUpperCase ],
				},
			};

			const [results, errors] = validateParams(params, config);
			expect(results).to.deep.equal({ string: 'ABCD' });
			expect(errors).to.deep.equal({});
		});
	});
});

describe('validateAPIGatewayEvent', () => {
	it('is a function', () => {
		expect(validateAPIGatewayEvent).to.be.a('function');
	});

	it('applies validation to an APIGatewayEvent event object', () => {
		const event = {
			...APIGatewayEventStub,
			queryStringParameters: {
				item: 'abcd',
			},
			pathParameters: {
				page: '5',
			}
		};

		const config = {
			queryStringParameters: {
				item: {
					type: QueryStringValueTypes.String,
				},
			},
			pathParameters: {
				page: {
					type: QueryStringValueTypes.Integer,
				},
			},
		};

		const [results, errors] = validateAPIGatewayEvent(event, config);
		expect(results).to.deep.equal({
			queryStringParameters: { item: 'abcd' },
			pathParameters: { page: 5 },
		});
		expect(errors).to.deep.equal({ queryStringParameters: {}, pathParameters: {} });
	});
});
