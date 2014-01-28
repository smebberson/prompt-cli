"use strict";

var fs = require('fs'),
	split = require('split'),
	es = require('event-stream'),
	through = require('through'),
	pad = require('pad'),
	chalk = require('chalk'),
	platform = require('./platform');

/**
 * Read the provided hosts file and convert it into a JSON tree
 *
 * Returns a JSON with each host record. For example:
 * 
 * [ { type: 'other', content: '##' },
 *   { type: 'other', content: '# Host Database' },
 *   { type: 'other', content: '#' },
 *   { type: 'other',
 *     content: '# localhost is used to configure the loopback interface' },
 *   { type: 'other',
 *     content: '# when the system is booting.  Do not change this entry.' },
 *   { type: 'other', content: '##' },
 *   { type: 'entry',
 *     content: '127.0.0.1\tlocalhost',
 *     ip: '127.0.0.1',
 *     host: 'localhost' },
 *   { type: 'entry',
 *     content: '127.0.0.1\developmentdomain.local',
 *     ip: '127.0.0.1',
 *     host: 'developmentdomain.local' }
 * ]
 *
 * @param {String} location of the hosts file
 * @param {Function} a callback to passed the JSON tree when completed
 */
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
					host: results[2]
				};

				// did we find content at the end?
				if (results[3]) {
					entry.comment = results[3];
				}

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

/**
 * Create a new hosts entry consisting of ip, host and optional comment.
 * It automatically reads in the hosts file before processing it
 *
 * @param {String} location of the hosts file
 * @param {String} the ip for the hosts entry
 * @param {String} the host for the hosts entry
 * @param {String|null} an optional comment string (or null)
 * @param {Function} a callback to passed the JSON tree when completed
 * @api public
 */
exports.set = function (file, ip, host, comment, callback) {

	exports.get(file, function (err, records) {

		var record = {
			type: 'entry',
			ip: ip,
			host: host
		};

		if (comment) {
			record.comment = comment;
		}

		records.push(record);

		callback(null, records);

	});

};

/**
 * Remove a hosts entry if the ip and host match
 *
 * @param {String} location of the hosts file
 * @param {String} the ip for the hosts entry
 * @param {String} the host for the hosts entry
 * @param {Function} a callback to passed the JSON tree when completed
 * @api public
 */
exports.remove = function (file, ip, host, callback) {

	exports.get(file, function (err, records) {

		var newRecords = records.filter(function (record) {

			return !(record.type === 'entry' &&
				record.ip.trim() === ip.trim() &&
				record.host.trim() === host.trim());

		});

		callback(null, newRecords);

	});

};

/**
 * Outputs the contents of the hosts file (or the JSON tree specifically) to process.stdout
 *
 * @param {Object} the JSON tree as loaded by get
 * @param {Boolean} a flag to determine if blank lines or comment lines should be printed to screen
 * @api public
 */
exports.print = function (hostRecords, all) {

	for (var i = 0; i < hostRecords.length; i++) {

		if (hostRecords[i].type === 'entry') {

			console.log(
				chalk.cyan.bold(pad(hostRecords[i].ip, 20)) +
				chalk.blue(pad(hostRecords[i].host, 40)) +
				((hostRecords[i].comment && hostRecords[i].comment.trim()) ? chalk.gray(' # ' + hostRecords[i].comment) : ''));

		}

		if (all && hostRecords[i].type === 'other') {
			console.log(chalk.gray(hostRecords[i].content));
		}

	}

};

/**
 * Writes the contents of the JSON tree back to the hosts file
 *
 * @param {String} the location of the hosts file
 * @param {Object} the JSON tree as loaded by get, or manipulated by set
 * @param {Function} a callback for completion
 * @api public
 */
exports.write = function (file, hostRecords, callback) {

	fs.stat(file, function (err, stat) {

		if (err) {
			return callback(err);
		}

		var stream = fs.createWriteStream(file, { mode: stat.mode })
			.on('close', callback)
			.on('error', callback);

		for (var i = 0; i < hostRecords.length; i++) {

			if (hostRecords[i].content) {
				stream.write(hostRecords[i].content + addEOL(i, hostRecords.length));
			} else {
				stream.write(hostRecords[i].ip + '\t' + hostRecords[i].host + (hostRecords[i].comment && hostRecords[i].comment.trim() ? ' # ' + hostRecords[i].comment : '') + addEOL(i, hostRecords.length));
			}

		}

		stream.end();

	});

};

/**
 * We don't want a linebreak on the last line,
 * this function determines if os.EOL is output.
 *
 * @param {Int} current iteration
 * @param {Int} the total iterations
 * @api private
 */
var addEOL = exports.addEOL = function (index, total) {

	if (index < total-1) {
		return platform.EOL;
	}

	return '';

};