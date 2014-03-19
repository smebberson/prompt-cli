var os = require('os'),
	hosts = require('../../lib/hosts');

module.exports = function (argv) {

	argv.modes.all = argv.modes.all || false;

	// determine location
	if (argv.params.hosts === undefined) {

		if (os.platform() === 'darwin') {
			argv.params.hosts = '/etc/hosts';
		}

	}

	// load the file and output all of the entries
	hosts.get(argv.params.hosts, function (err, hostRecords) {

		if (err) {
			return console.log('There was an error loading the hosts records.\n' + err);
		}

		// output the list of the host records
		hosts.print(hostRecords, argv.modes.all);

	});

};