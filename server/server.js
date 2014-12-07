var fs      = require('fs'),
	file    = 'test.db',
	exists  = fs.existsSync(file),
	sqlite3 = require('sqlite3').verbose(),
	db      = new sqlite3.Database(file);

db.serialize(function() {
	if(!exists) {
		db.run('CREATE TABLE Nodes ('
			+ 'id  INTEGER PRIMARY KEY,'
			+ 'dns STRING)');

		db.run('CREATE TABLE Stats ('
			+ 'timestamp  INTEGER,'
			+ 'machine_id INTEGER,'
			+ 'load_avg   INTEGER,'
			+ 'ram        INTEGER,'
			+ 'cpu        INTEGER,'
			+ 'ram_speed  INTEGER)');

		db.run('CREATE TABLE LogEntries ('
			+ 'id	  INTEGER PRIMARY KEY,'
			+ 'type   INTEGER,'
			+ 'string STRING)');
	}
});




var express = require('express');

var app    = express(),
    http   = require('http'),
    server = http.createServer(app),
    io     = require('socket.io').listen(server);

var dataIntervalId;
var MACHINE_COUNT = 5;

server.listen(8080);

app.use(express.static(__dirname + '/../base/'));

app.get('/', function (req, res) {
	res.sendfile(__dirname + 'index.html');
});

io.sockets.on('connection', function (socket) {
	socket.emit('contract', generateContract());

	socket.on('contractAccepted', function () {
		dataIntervalId = setInterval(function () {
			timestamp = new Date();
			socket.emit('newdata', timestamp, generateRandomData());
		}, 2000);
	})

	socket.on('disconnect', function () {
		clearInterval(dataIntervalId);
	});
});










function generateContract() {
	return {
		machines : [0, 1, 2, 3, 4],
		columns  : ['id', 'dns', 'loadAvg', 'ram', 'cpu', 'ramSpeed']
	};
}

function generateRandomData() {
	var query = db.prepare("INSERT INTO Stats VALUES (?, ?, ?, ?, ?, ?)");
	var jsonArray = [];
	for (var i = 0; i < 5; ++i) {
		var dns 	  = 'machine' + i + '.inria.net',
			load_avg  = 2 * i + Math.floor(Math.random() * 10),
			ram 	  = i + Math.floor(Math.random() * 10),
			cpu 	  = i + Math.floor(Math.random() * 10),
			ram_speed = 4 + i + Math.floor(Math.random() * 10);

		query.run(dns, load_avg, ram, cpu, ram_speed);

		jsonArray.push({id:       i,
						dns:      dns,
						loadAvg:  load_avg,
						ram:      ram,
						cpu:      cpu,
						ramSpeed: ram_speed})
	}
	return jsonArray;
}