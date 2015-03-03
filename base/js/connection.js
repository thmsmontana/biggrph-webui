var	socket = io.connect();
var bigObjects;

// on connection to server, ask for user's name with an anonymous callback
socket.on('connect', function() {});

socket.on('message', function (content) {
	switch (content.msg) {
		case 'nMachines':
			var nMachinesArray = [];

			for (var i = 0; i < content.data; i++){
				nMachinesArray.push(i);
			}

			contract = {
				machines : nMachinesArray,
				columns  : ['id', 'dns', 'absLoadAvg', 'relLoadAvg', 'ram', 'ramSpeed']
			};
			updateView();
			generateDataTable();

			resetClock();
			break;

		case 'newdata':
			if (contract) {
				updateValues(content.data.timestamp, content.data.values);
			}
			break;

		case 'log':
			addMessage(content.data);
			break;

		case 'bigobjects':
			bigObjects = content.data;
			displayBigObjects();
			break;

		default:
			break;
	}
});
