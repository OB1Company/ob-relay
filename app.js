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
					res.send('Your IP address is ' + ipaddress + '. Your <code>$PATH</code> is: ' + stdout)
				}
			})
		.start();
	}
	// Run the function
	test();
});

// POST call to setup the VPS
app.post('/api/v1/provision', function(req,res) {
	var ipaddress = req.body.ipaddress;
	var ssh = new SSH({
		host: ipaddress,
		user: 'root',
		key: privatekey
	});
	var randomVPSpassword = Math.random().toString(36).slice(-8);
	var randomOBpassword = Math.random().toString(36).slice(-8);
	// Setup 'obuser' on the VPS
	function provision() {
		ssh
			// Download the setup script file
			.exec('wget https://gist.githubusercontent.com/drwasho/c8b3b7af2aa41f789cd14ef3d820c3cd/raw/600e351d42b181c98766a92302e333f8547b7029/provision.sh', {
				out: function(stdout) {
					console.log(stdout);
				}
			})

			// Modify the 'obuser' password for the VPS
			.exec('sed -i "5s/.*/echo obuser:' + randomVPSpassword + ' | chpasswd/" setup.sh', {
				out: function(stdout) {
			 		console.log(stdout);
			 		console.log('Password changed.');
			 	}
			})

			// Change permission of script
			.exec('chmod +x provision.sh', {
				out: function(stdout) {
					console.log(stdout);
				}
			})

			// Run installation file
			.exec('bash provision.sh', {
				out: function(stdout) {
					console.log(stdout);
				}
			})

			// Modify the username and password in ob.cfg
			.exec('sed -i "26s/.*/USERNAME = obuser/" /home/obuser/OpenBazaar-Server/ob.cfg', {
				out: function(stdout) {
			 		console.log(stdout);
			 		console.log('Username changed.');
			 	}
			})

			// Modify the username and password in ob.cfg
			.exec('sed -i "27s/.*/PASSWORD = ' + randomOBpassword + '/" /home/obuser/OpenBazaar-Server/ob.cfg', {
			 	out: function(stdout) {
					console.log(stdout);
					console.log('Password changed.');
			 	}
			})
		.start();
	};
	// Run the function
	provision();
	res.send('<p>Your OpenBazaar node is being provisioned!</p><p><font color="red"><b>Please save the following details as they will not be available after you close this window.</b></font></p><p> Your VPS and OpenBazaar node has this IP address: <font color="blue"><code>' + ipaddress + '</code></font></p><p>Your OpenBazaar username is <font color="blue">obuser</font> and your password is: <font color="blue"><code>' + randomOBpassword + '</code></font>.</p><p>Your temporary VPS login username is <font color="blue">obuser</font> and login password is: <font color="blue"><code>' + randomVPSpassword + '</code></font>.</p>')
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
