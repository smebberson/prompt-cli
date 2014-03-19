
var os = require('os'),
	path = require('path'),
	init = require('../lib/init'),
	chalk = require('chalk');

module.exports = function (argv) {

	// let's parse the url
	var url;

	init.parseURL(argv.args.url, function (err, parsedURL) {
		
		if (err) {
			return console.error(chalk.red('\n' + err));
		}

		url = parsedURL;

	});

	// let's parse the local folder
	var folder;

	init.parseFolder(argv.args.path, function (err, parsedFolder) {

		if (err) {
			return console.error(chalk.red('\n' + err));
		}

		folder = parsedFolder;

	});


	// now that we have everything we need, let's:
	// 1. clone the directory
	// 2. remove the .git folder

	console.log('\n' + chalk.cyan('Cloning \'%s\' into \'%s\'...'), url, folder);

	// 1. clone the directory
	init.clone(url, folder, function (err, location) {

		if (err) {
			return console.error(chalk.red('\n' + err));
		}

		// 2. degit baby
		init.degit(path.join(folder, '.git'), function (err) {

			if (err) {
				return console.error(chalk.red('\n' + err));
			}

			// we're all done
			return console.log(chalk.green('All done.\n'));

		});

	});

};