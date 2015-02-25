var	socket = io.connect();


// on connection to server, ask for user's name with an anonymous callback
socket.on('connect', function() {});


socket.on('contract', function (contract) {
	generateDataTable(contract);
});

socket.on('newdata', function (timestamp, data) {
	updateValues(timestamp, data);
});

socket.on('log', function(timestamp, type, message) {
	addMessage(timestamp, type, message);
});