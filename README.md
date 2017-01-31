# ldjson-body

[![Build status][travis-image]][travis-url] [![NPM version][npm-image]][npm-url] [![XO code style][codestyle-image]][codestyle-url]

> Get a stream for a line delimited json response body in the browser, compatible with [Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

*Based on the JSON chunk parser from [eBay's `jsonpipe`](https://github.com/eBay/jsonpipe)*

## Installation

Install `ldjson-body` using [npm](https://www.npmjs.com/):

```bash
npm install --save ldjson-body
```

## Usage

### Module usage

```javascript
const ldjsonBody = require('ldjson-body');

fetch('https://a.url.that.provides.linedelimited.json')
	.then(res => {
		return ldjsonBody(res.body)
			.on('data', obj => console.log(obj)) // print each received object
			.on('error', err => {
				console.error(err.chunk); // log the failing json chunk
				console.error(err); // log the json parse error
			})
			.on('end', () => {
				// parsing of the complete body is finished
			});
	})
	.then(() => {
		// parsing of the complete body is finished
	})
```

## Requirement

You'll need either native [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) and [`TextDecoder`](https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder) implementations or polyfills.

## API

### `ldjsonBody(bodyStream, options)`

| Name | Type | Description |
|------|------|-------------|
| bodyStream | [`ReadableStream`](https://streams.spec.whatwg.org/#rs-class) | The response body stream to parse json from |
| options | `Object` | See [Options](#options) |

Returns: a Promise Emitter, i.e. a `Promise` enhanced with EventEmitter functions like `on` and `off` (for available events see [Events](#events)).

#### Options

##### options.delimiter

Type: `String`  
Default: `"\n"`  

Set delimiter when parsing the response. Each delimiter indicates the start of a new json object.

#### Events

##### Event: `data`

Emitted for each found and parsed json object in the response body.

##### Event: `error`

Emitted if an error occurs when parsing a chunk of json. `error.chunk` is set to the failing string.

##### Event: `end`

Emitted when the whole body have been read and parsed.

## License

MIT © [Joakim Carlstein](http://joakim.beng.se) and eBay Inc

[npm-url]: https://npmjs.org/package/ldjson-body
[npm-image]: https://badge.fury.io/js/ldjson-body.svg
[travis-url]: https://travis-ci.org/joakimbeng/ldjson-body
[travis-image]: https://travis-ci.org/joakimbeng/ldjson-body.svg?branch=master
[codestyle-url]: https://github.com/sindresorhus/xo
[codestyle-image]: https://img.shields.io/badge/code%20style-XO-5ed9c7.svg?style=flat
