'use strict';
var mitt = require('mitt');

module.exports = exports = function (bodyStream, options) {
	options = options || {};
	var emitter = mitt();
	var decoder = new TextDecoder();
	var reader = bodyStream.getReader();

	var parse = jsonParser(options, function (err, row) {
		if (err) {
			emitter.emit('error', err);
		} else {
			emitter.emit('data', row);
		}
	});

	function next() {
		return reader.read()
			.then(function (result) {
				var value = decoder.decode(result.value || new Uint8Array(), {
					stream: !result.done
				});

				parse(value, result.done);

				if (result.done) {
					emitter.emit('end');
					return;
				}
				return next();
			});
	}

	var emitterPromise = next();

	emitterPromise.on = function () {
		emitter.on.apply(emitter, arguments);
		return emitterPromise;
	};
	emitterPromise.off = function () {
		emitter.off.apply(emitter, arguments);
		return emitterPromise;
	};

	return emitterPromise;
};

function jsonParser(options, cb) {
	options = options || {};
	var delimiter = options.delimiter || '\n';
	var chunk = '';

	function jsonParse(chunk) {
		try {
			var data = JSON.parse(chunk);
			cb(null, data);
		} catch (err) {
			err.chunk = chunk;
			cb(err);
		}
	}

	return function (partialChunk, isFinalChunk) {
		chunk += partialChunk;
		var start = 0;
		var finish = chunk.indexOf(delimiter, start);
		var subChunk;

		if (finish === 0) { // The delimiter is at the beginning so move the start
			start = delimiter.length;
		}

		// Re-assign finish to the next delimiter
		finish = chunk.indexOf(delimiter, start);

		while (finish > -1) {
			subChunk = chunk.substring(start, finish);
			if (subChunk) {
				jsonParse(subChunk);
			}
			start = finish + delimiter.length; // move the start
			finish = chunk.indexOf(delimiter, start); // Re-assign finish to the next delimiter
		}

		// Get the remaning chunk
		chunk = chunk.substring(start);
		// If final chunk and still unprocessed chunk and no delimiter, then execute the full chunk
		if (isFinalChunk && chunk && finish === -1) {
			jsonParse(chunk);
		}
	};
}
