console.log('Here we go...');

/* === VARIABLE CITY === */
/* ===================== */

var http = require('http');
var SSH = require('simple-ssh');
var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');

var app = express();
var privatekey = fs.readFileSync('key', 'utf8') // read the private key stored locally
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

/* === Run the Server === */
/* ====================== */

app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});

/* === REST GET Calls === */
/* ====================== */

app.get('/', function(req,res) {
	res.send('Testing ground...');
});

/* === REST POST Calls === */
/* ======================= */

// POST call to test access to the VPS is working
app.post('/api/v1/test', function(req,res) {
	var ipaddress = req.body.ipaddress;
	var ssh = new SSH({
		host: ipaddress,
		user: 'root',
		key: privatekey
	});
	// Test to make sure SSH is working
	function test() {
		ssh
			// Echo the $PATH
			.exec('echo $PATH', {
				out: function(stdout) {
					console.log(stdout);
					res.send('Your IP address is ' + ipaddress + '. Your $PATH is: ' + stdout)
				}
			})
		.start();
	}
	// Run the function
	test();
});

// POST call to setup the VPS
app.post('/api/v1/setup', function(req,res) {
	var ipaddress = req.body.ipaddress;
	var password = req.body.password;
	var ssh = new SSH({
		host: ipaddress,
		user: 'root',
		key: privatekey
	});
	// Setup 'obuser' on the VPS
	function gosetup() {
		ssh
			// Download the setup script file
			.exec('wget https://gist.githubusercontent.com/drwasho/bac24f115349475e1f6c4ba91337ab95/raw/7c4cfb686d29096808d220a04c8f5ccee6854861/setup.sh', {
				out: function(stdout) {
					console.log(stdout);
				}
			})

			// Modify the 'obuser' password for the VPS
			.exec('sed -i "4s/.*/echo obuser:' + password + ' | chpasswd/" setup.sh', {
				out: function(stdout) {
			 		console.log(stdout);
			 		console.log('Password changed.');
			 	}
			})

			// Change permission of script
			.exec('chmod +x setup.sh', {
				out: function(stdout) {
					console.log(stdout);
				}
			})

			// Run installation file
			.exec('bash setup.sh', {
				out: function(stdout) {
					console.log(stdout);
				}
			})
		.start();
	};
	// Run the function
	gosetup();
	res.send('Setting up your VPS at ' + ipaddress)
});

// POST call to install OpenBazaar on the VPS
app.post('/api/v1/install', function(req,res) {
	var ipaddress = req.body.ipaddress;
	var username = req.body.username;
	var password = req.body.password;
	var ssh = new SSH({
		host: ipaddress,
		user: 'root',
		key: privatekey
	});
	// Install OpenBazaar
	function install() {
		ssh
			// Download the installation script file
			.exec('wget https://gist.githubusercontent.com/drwasho/2fbe71ea57e0f22b52476ade44e2eb9f/raw/e9907cca6356b877862a693c7e9c4fcd6219f533/obinstall.sh', {
				out: function(stdout) {
					console.log(stdout);
				}
			})

			// Change permission of script
			.exec('chmod +x obinstall.sh', {
				out: function(stdout) {
					console.log(stdout);
				}
			})

			// Run installation file
			.exec('bash obinstall.sh', {
				out: function(stdout) {
					console.log(stdout);
				}
			})

			// Modify the username and password in ob.cfg
			.exec('sed -i "26s/.*/USERNAME = ' + username + '/" /home/obuser/OpenBazaar-Server/ob.cfg', {
				out: function(stdout) {
			 		console.log(stdout);
			 		console.log('Username changed.');
			 	}
			})

			// Modify the username and password in ob.cfg
			.exec('sed -i "27s/.*/PASSWORD = ' + password + '/" /home/obuser/OpenBazaar-Server/ob.cfg', {
			 	out: function(stdout) {
					console.log(stdout);
					console.log('Password changed.');
			 	}
			})
		.start();
	}
	// Run the function
	install();
	res.send('Installing OpenBazaar on your VPS at ' + ipaddress)
});

// POST call to start OpenBazaar on the VPS
app.post('/api/v1/runob', function(req,res) {
	var ipaddress = req.body.ipaddress;
	var ssh = new SSH({
		host: ipaddress,
		user: 'root',
		key: privatekey
	});
	// Run OpenBazaar
	function runob() {
		ssh
			// Run the server
			.exec('(cd /home/obuser/OpenBazaar-Server/; python openbazaard.py start -da 0.0.0.0)', {
				out: function(stdout) {
					console.log(stdout);
					console.log('OpenBazaar is running at ' + ipaddress);
				}
			})
		.start();
	}
	// Run the function
	runob();
	res.send('Running OpenBazaar on your VPS at ' + ipaddress)
});

// POST call to stop OpenBazaar on the VPS
app.post('/api/v1/stopob', function(req,res) {
	var ipaddress = req.body.ipaddress;
	var ssh = new SSH({
		host: ipaddress,
		user: 'root',
		key: privatekey
	});
	// Stop OpenBazaar
	function stopob() {
		ssh
			// Stop the server
			.exec('(cd /home/obuser/OpenBazaar-Server/; python openbazaard.py stop)', {
				out: function(stdout) {
					console.log(stdout);
					console.log('OpenBazaar has stopped.');
				}
			})
		.start();
	}
	// Run the function
	stopob();
	res.send('Stopping OpenBazaar on your VPS at ' + ipaddress)
});

// POST call to stop OpenBazaar on the VPS
app.post('/api/v1/update', function(req,res) {
	var ipaddress = req.body.ipaddress;
	var ssh = new SSH({
		host: ipaddress,
		user: 'root',
		key: privatekey
	});
	// Update OpenBazaar
	function update() {
		ssh
			// Stop OpenBazaar
			.exec('(cd /home/obuser/OpenBazaar-Server/; python openbazaard.py stop)', {
				out: function(stdout) {
					console.log(stdout);
				}
			})

			// Run git pull
			.exec('(cd /home/obuser/OpenBazaar-Server/; git pull)', {
				out: function(stdout) {
					console.log(stdout);
				}
			})

			// Remove PID file in case it's there
			.exec('(cd /home/obuser/OpenBazaar-Server/; rm /tmp/openbazaard.pid)', {
				out: function(stdout) {
					console.log(stdout);
				}
			})

			// Start OpenBazaar
			.exec('(cd /home/obuser/OpenBazaar-Server/; python openbazaard.py start -da 0.0.0.0)', {
				out: function(stdout) {
					console.log(stdout);
				}
			})
		.start();
	}
	// Run the function
	update();
	res.send('Updating OpenBazaar on your VPS at ' + ipaddress)
});
