"use strict";

var os = require('os');

/**
 * All platform abstractions will live in this file
 */

/*
 * Retrieve the users home directory so that we can write our .dotfiles to it
 */
exports.homeDirectory = function () {

	return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;

};

/*
 * A simple alias for os.EOL and we later wrap an abstractions that we need to around it
 */
exports.EOL = os.EOL;