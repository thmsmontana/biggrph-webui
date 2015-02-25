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
			+ 'abs_load_avg   INTEGER,'
			+ 'rel_load_avg   INTEGER,'
			+ 'ram        INTEGER,'
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
	socket.on('nMachines', function (n) {
		socket.broadcast.emit('contract', generateContract(n));
	});

	socket.on('statusReport', function(timestamp, data) {
		console.log(timestamp);
		socket.broadcast.emit('newdata', timestamp, data);
		//saveStatsToDatabase(data);
	});	

	socket.on('disconnect', function () {
		clearInterval(dataIntervalId);
	});

	socket.on('log', function(timestamp, type, message){
		socket.broadcast.emit('log', timestamp, type, message);
	});
});




function generateContract(n) {
	var nMachinesArray = [];

	for (var i = 0; i < n; i++){
		nMachinesArray.push(i);
	}

	return {
		machines : nMachinesArray,
		columns  : ['id', 'dns', 'absLoadAvg', 'relLoadAvg', 'ram', 'ramSpeed']
	};
}

/*
function saveStatsToDatabase(data) {
	var query = db.prepare("INSERT INTO Stats VALUES (?, ?, ?, ?, ?, ?)");
	
	var dns 	  = 'machine' + i + '.inria.net',
		abs_load_avg  = 2 * i + Math.floor(Math.random() * 10),
		rel_load_avg  = 2 * i + Math.floor(Math.random() * 10),
		ram 	  = i + Math.floor(Math.random() * 10),
		ram_speed = 4 + i + Math.floor(Math.random() * 10);

	query.run(dns, abs_load_avg, rel_load_avg, ram, ram_speed);

}*/
