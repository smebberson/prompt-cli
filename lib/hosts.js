
var fs = require('fs'),
	split = require('split'),
	es = require('event-stream'),
	through = require('through');

exports.get = function (file, callback) {

	var lines = [];

	 fs.ReadStream(file, {flags: 'r'})
		.pipe(split())
		.pipe(through(function (line) {

			var results = /^(?:\s+?)?([^#\s]+?)\s+?([^#\s]+)([\s\w#]+)?$/.exec(line);

			if (results) {

				// build the entry object
				var entry = {
					type: 'entry',
					content: line,
					ip: results[1],
					domain: results[2]
				};

				// did we find content at the end?
				if (results[3]) entry.comment = results[3];

				lines.push(entry);

			} else {

				lines.push({
					type: 'other',
					content: line
				});

			}

		}))
		.on('close', function () {
			callback(null, lines);
		});

};