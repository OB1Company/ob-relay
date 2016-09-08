console.log('Here we go...');
'user strict';

/* === VARIABLE CITY === */
/* ===================== */

const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const exec = require('child_process').exec;
const fs = require('fs');

const app = express();

const Base64 = {
    
	_keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
	decode: function(input) {
			var output = "";
			var chr1, chr2, chr3;
			var enc1, enc2, enc3, enc4;
			var i = 0;
			input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
			while (i < input.length) {
				enc1 = this._keyStr.indexOf(input.charAt(i++));
				enc2 = this._keyStr.indexOf(input.charAt(i++));
				enc3 = this._keyStr.indexOf(input.charAt(i++));
				enc4 = this._keyStr.indexOf(input.charAt(i++));
				chr1 = (enc1 << 2) | (enc2 >> 4);
				chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
				chr3 = ((enc3 & 3) << 6) | enc4;
				output = output + String.fromCharCode(chr1);
				if (enc3 != 64) {
					output = output + String.fromCharCode(chr2);
				}
				if (enc4 != 64) {
					output = output + String.fromCharCode(chr3);
				}
			}
			output = Base64._utf8_decode(output);
			return output;
		},
    _utf8_decode: function(utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;

        while (i < utftext.length) {

            c = utftext.charCodeAt(i);

            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if ((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }

        }
        return string;
    }
}

/* === Configuration === */
/* ===================== */

var port = process.env.PORT || 8080; // used to create, sign, and verify tokens

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies ==> watch this

// read the authorization password locally
const authpassword = fs.readFileSync('password', 'utf-8'); 


/* === Routes === */
/* ============== */

/* === Start the Server === */
app.listen(port);
console.log('Magic happens at http://localhost:' + port);

/* === Basic Route === */
app.get('/', function(req, res) {
	res.send('Hello! The API is at http://localhost:' + port + '/api/v1');
});

/* === API Routes === */

// POST call to test access to the VPS is working
app.post('/api/v1/test', function(req, res) {
	var password = req.body.password;
	var $password = Base64.decode(password);
	if ($password == authpassword) {
		var cmd = 'echo %PATH%';
		exec(cmd, function(error, stdout, stderr) {
			console.log(stdout);
			res.send(stdout);
		});
	} else {
		console.log('Password is incorrect');
		res.status(401);
		res.send('Password is incorrect');
		return;
		};
	});

// GET call to test if OpenBazaar is online
app.get('/api/v1/status', function(req, res) {
	var password = req.param('password');
	console.log(password);
	var $password = Base64.decode(password);
	console.log($password);
	console.log('authpassword is: ' + authpassword)
	if ($password == authpassword) {
		var cmd = 'ps cax | grep python';
		exec(cmd, function(error, stdout, stderr) {
			if (stdout != '') {
				res.send('OpenBazaar is up.');
			} else {
				res.send('OpenBazaar is offline.');
			};
		});
	} else {
		console.log('Password is incorrect');
		res.status(401);
		res.send('Password is incorrect');
		return;
		};
});

// POST call to start OpenBazaar on the VPS
app.post('/api/v1/runob', function(req,res) {
	var password = req.body.password;
	var $password = Base64.decode(password);
	if ($password == authpassword) {
		var cmd = 'python /home/openbazaar/src/openbazaard.py start -a 0.0.0.0';
		exec(cmd, function(error, stdout, stderr) {
			console.log(stdout);
			res.send(stdout);
		});
	} else {
		console.log('Password is incorrect');
		res.status(401);
		res.send('Password is incorrect');
		return;
		};
	});

// POST call to stop OpenBazaar on the VPS
app.post('/api/v1/stopob', function(req,res) {
	var password = req.body.password;
	var $password = Base64.decode(password);
	if ($password == authpassword) {
		var cmd = '/home/openbazaar/venv/bin/python /home/openbazaar/src/openbazaard.py stop';
		exec(cmd, function(error, stdout, stderr) {
			console.log(stdout);
			res.send(stdout);
		});
	} else {
		console.log('Password is incorrect');
		res.status(401);
		res.send('Password is incorrect');
		return;
		};
	});

// POST call to update and restart OpenBazaar on the VPS
app.post('/api/v1/updateob', function(req,res) {
	var password = req.body.password;
	var $password = Base64.decode(password);
	if ($password == authpassword) {
		var cmd = '/home/openbazaar/venv/bin/python /home/openbazaar/src/openbazaard.py stop'; // stops the server
		var cmd = 'git -C /home/openbazaar/src pull'; // updates to the latest code
		var cmd = '/home/openbazaar/venv/bin/python /home/openbazaar/src/openbazaard.py start -a 0.0.0.0'; // start the server in daemon mode again
		exec(cmd, function(error, stdout, stderr) {
			console.log(stdout);
			res.send(stdout);
		});
	} else {
		console.log('Password is incorrect');
		res.status(401);
		res.send('Password is incorrect');
		return;
		};
	});
