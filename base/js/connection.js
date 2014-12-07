var	socket = io.connect();


// on connection to server, ask for user's name with an anonymous callback
socket.on('connect', function() {});


socket.on('contract', function (contract) {
	generateDataTable(contract);
	socket.emit('contractAccepted');
})

socket.on('newdata', function (timestamp, data) {
	updateValues(data);
});