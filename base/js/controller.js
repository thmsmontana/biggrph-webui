var JSON_TO_PRETTY_NAMES = {
	'id'       : '#',
	'dns'      : 'DNS',
	'absLoadAvg'  : 'Abs Load Average',
	'relLoadAvg'  : 'Rel Load Average',
	'ram'      : 'RAM',
	'ramSpeed' : 'RAM Speed'
};

var LABEL_COLORS = {
	1: 'purple',
	2: 'blue',
	3: 'green',
	4: 'orange',
	5: 'pink'
};

var HEX_COLORS = {
	1: '#D993ED',
	2: '#60BAF9',
	3: '#82E14F',
	4: '#FDAC30',
	5: '#F84780'
};


var checkedCells = {};

var charts = {};

var seriesMapping = {};

var cellMapping = {};

var chart;

var contract;

var selectedObject;

var logMessages = [];
var logCounts = {
	0: 0,
	1: 0,
	2: 0
}



var objectPanel = $('#objectView');
var consoleMessages = $('#console-messages');


function updateValues (timestamp, jsonValues) {
	$.each(jsonValues, function(machineID, columns) {
		$.each(columns, function(columnName, value) {
			if (columnName == 'id') return true;
			cellMapping[columnName][machineID].text(value);
			if (columnName != 'dns') {
				seriesMapping[columnName][machineID].addPoint([timestamp, value], true, false);
			}
		});
	});
}









var selectObject = function (ID) {
	selectedObject = null;
	if (ID) {
		$.each(bigObjects, function(index, object) {
			if (object.id === ID) {
				selectedObject = object;
				return false; // equiv. break;
			}
		});
	}
	updateView();
	return selectedObject;
}


var updateView = function () {
	objectPanel.empty();

	if (selectedObject) {
		$('#main').hide();
		objectPanel.show();

		objectPanel.append(emptyObjectViewString);
		$('#objectName').append(selectedObject.id);
		if (selectedObject.type === 'dataset') {
			$('#objectName').append(' <span class="tag-type">dataset</span>');
		}
		$.each(selectedObject.allocation, function (index, node) {
			$('#objectAllocation').append('<li><div id="circle-purple" class="circle"></div> ' + node + '<i class="fa fa-eye"></i></li>')
		})

	} else {
		objectPanel.hide();
		$('#main').show();
	}
}


var MESSAGE_TYPE = {
	0: 'info',
	1: 'warning',
	2: 'error'
};
var addMessage = function (message) {
	logMessages.push(message);
	$.each(charts, function(key, chart){
		chart.get('events').addPoint({
			title: " ",
			text: message.message,
			x: message.timestamp,
            shape : 'url(../images/' + MESSAGE_TYPE[message.level] + '.png)'  
		}, true, false);
	});
	if (message.level >= consoleLevelFilter) {
		logCounts[message.level]++;
		updateMessageCounts();
		addMessageToView(message);
	}
}




var epoch, t;

var resetClock = function () {
	epoch = Date.now();
	clearTimeout(t);
	updateTime();
}

var updateTime = function () {
	if (!epoch) return;

    var runtime = new Date(Date.now() - epoch);
	console.log(Date.now() - epoch, runtime);
    var h=runtime.getUTCHours();
    var m=runtime.getUTCMinutes();
    var s=runtime.getUTCSeconds();
    h = checkTime(h);
    m = checkTime(m);
    s = checkTime(s);
    document.getElementById('runtime').innerHTML = 'Runtime ' + h+':'+m+':'+s;
    t = setTimeout(updateTime,500);
}

function checkTime(i) {
    if (i<10) {i = "0" + i};  // add zero in front of numbers < 10
    return i;
}
