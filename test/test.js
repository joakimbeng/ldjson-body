const {TextDecoder, TextEncoder} = require('text-encoding');
const test = require('ava');
const ldjsonBody = require('../src');

global.TextDecoder = TextDecoder;

const toUint8Array = str => new TextEncoder().encode(str);

function * lineDelimitedJson(delimiter) {
	yield toUint8Array('{"prop":"va');
	yield toUint8Array('lue1"}');
	yield toUint8Array(`${delimiter}{"pro`);
	yield toUint8Array('p":"value2');
	yield toUint8Array(`"}${delimiter}`);
}

const fakeStream = delimiter => {
	const bodyGenerator = lineDelimitedJson(delimiter);
	return {
		getReader() {
			return {
				read() {
					return Promise.resolve(bodyGenerator.next());
				}
			};
		}
	};
};

test('it emits objects delimited by newline', async t => {
	const rows = [];

	await ldjsonBody(fakeStream('\n'))
		.on('data', row => rows.push(row))
		.on('error', err => t.fail(err));

	t.is(rows.length, 2);
	t.deepEqual(rows[0], {prop: 'value1'});
	t.deepEqual(rows[1], {prop: 'value2'});
});

test('custom delimiter', async t => {
	const rows = [];

	await ldjsonBody(fakeStream('<delimiter>'), {delimiter: '<delimiter>'})
		.on('data', row => rows.push(row))
		.on('error', err => t.fail(err));

	t.is(rows.length, 2);
	t.deepEqual(rows[0], {prop: 'value1'});
	t.deepEqual(rows[1], {prop: 'value2'});
});
