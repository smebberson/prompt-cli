"use strict";

var path = require('path'),
	exec = require('child_process').exec,
	chalk = require('chalk'),
	rimraf = require('rimraf'),
	platform = require('./platform');

/**
 * Provided a URI, pass it to create a proper github clone URL
 *
 * Accepts URLs in the following formats:
 * 
 * gh:smebberson/pkg-angular-starter
 * github:smebberson/pkg-angular-starter
 * https://github.com/smebberson/pkg-angular-starter.git
 *
 * @param {String} URI
 * @param {Function} callback
 */
exports.parseURL = function (url, callback) {

	var ghMatch = url.match(/^(?:gh|github):([^\/].+?)\/(.+?)$/),
		urlMatch = url.match(/^https:\/\/github.com\/([^\/].+?)\/([^.].+?).git$/);

	// look for the gh, or github url first
	if (ghMatch) {

		return callback(null, exports.formatURL(ghMatch[1], ghMatch[2]));

	// look for a complete github url
	} else if (urlMatch) {

		return callback(null, exports.formatURL(urlMatch[1], urlMatch[2]));

	// support any other url provided and attempt to work with it
	} else {

		return callback(null, url);

	}

	return callback(new Error('Provided URL did not match one of the required formats.'));

};

/**
 * Provided a username and repository name created github (https) clone URL
 *
 * Given: smebberson, pkg-angular-starter; returns:
 * 
 * https://github.com/smebberson/pkg-angular-starter.git
 *
 * @param {String} user
 * @param {String} repository
 * @param {Function} callback
 */
exports.formatURL = function (user, repository) {

	return 'https://github.com/' + user + '/' + repository + '.git';

};

/**
 * Provided a string (relative or full path), turns it into a full path
 *
 * @param {String} path
 */
exports.parseFolder = function (folder, callback) {

	callback(null, path.resolve(process.cwd(), folder));

};

/**
 * Provided a remote github URL and local folder, will clone the repository into the local folder.
 * Assumes use of init.formatURL and init.parseFolder
 *
 * @param {String} url
 * @param {String} path
 * @param {Function} callback
 */
exports.clone = function (url, folder, callback) {

	exec('git clone ' + url + ' ' + folder, function (error, stdout, stderr) {

		if (error || stderr) {

			return callback(error || new Error(stderr));

		}

		return callback(null);

	});

};

/**
 * Provided a local git folder, will remove the .git folder and render it un-git-ted
 * Assumes use of init.parseFolder
 *
 * @param {String} path
 * @param {Function} callback
 */
exports.degit = function (folder, callback) {

	rimraf(folder, callback);

};
