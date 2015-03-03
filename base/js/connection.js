var	socket = io.connect();


socket.on('message', function (content) {
	switch (content.msg) {
		case 'nMachines':
			var machinesArray = [];

			for (var i = 0; i < content.data; i++){
				machinesArray.push(i);
			}

			contract = {
				machines : machinesArray,
				columns  : ['id', 'dns', 'absLoadAvg', 'relLoadAvg', 'ram', 'ramSpeed']
			};
			refreshMainView();

			initializeClusterInfo();

			resetClock();
			break;

		case 'newdata':
			if (contract) {
				onNewNodeStats(content.data.timestamp, content.data.values);
			}
			break;

		case 'log':
			onNewLogMessage(content.data);
			break;

		case 'bigobjects':
            onUpdatedBigObjects(content.data);

			break;

		default:
			break;
	}
});
