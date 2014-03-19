
var os = require('os'),
	hosts = require('../../lib/hosts');

module.exports = function (argv) {

	// determine location
	if (argv.params.file === undefined) {

		if (os.platform() === 'darwin') {
			argv.params.file = '/etc/hosts';
		}

	}

	// remove a particular hosts entry
	hosts.remove(argv.params.file, argv.args.ip, argv.args.host, function (err, hostRecords) {

		if (err) {
			return console.log('There was an error reading and removing a hosts entry.\n' + err);
		}

		// write the new JSON tree to the hosts file
		hosts.write(argv.params.file, hostRecords, function (err) {

			if (err) {
				console.log('There was an error writing to the hosts file.\n' + err);
				return process.exit(1);
			}

			// output the JSON tree
			hosts.print(hostRecords);

		});

	});

};