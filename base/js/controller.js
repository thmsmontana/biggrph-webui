var JSON_TO_PRETTY_NAMES = {
	'id'       : '#',
	'dns'      : 'DNS',
	'absLoadAvg'  : 'Abs Load Average',
	'relLoadAvg'  : 'Rel Load Average',
	'ram'      : 'RAM',
	'ramSpeed' : 'RAM Speed'
};

var HEX_COLORS = [];

var checkedCells = {};

var charts = {};

var seriesMapping = {};

var cellMapping = {};

var chart;

var contract;

var selectedObject;


var firstUpdateValue = true;

var logMessages = [];
var logCounts = {
	0: 0,
	1: 0,
	2: 0
}



var objectPanel = $('#objectView');
var consoleMessages = $('#console-messages');

function getRandomColor() {
    return "#" + (Math.round(Math.random() * 0XFFFFFF)).toString(16);
}


function updateValues (timestamp, jsonValues) {	
	$.each(jsonValues, function(machineID, columns) {
		if (firstUpdateValue) {
			var listNodes = document.createElement('ul'), li;
			var node = document.createTextNode(columns.dns);
			li = listNodes.appendChild(document.createElement('li'));
			li.setAttribute('id', columns.dns);
			li.appendChild(node);
			$(li).click(function(event) {
				selectObject(null);
				activateRow(columns.dns);
			});
			$('#list-nodes').append(listNodes);

			document.styleSheets[0].addRule('#circle-'+ columns.dns +'::before','background-color:'+ HEX_COLORS[machineID].color +';');
			document.styleSheets[0].addRule('#circle-'+ machineID +'::before','background-color:'+ HEX_COLORS[machineID].color +';');
			document.styleSheets[0].addRule('.machineRow'+ machineID + ' td.checked','background-color:'+ HEX_COLORS[machineID].color +';');

			firstUpdateValue = false;
		}
				
		$.each(columns, function(columnName, value) {
			if (columnName == 'id') return true;
			cellMapping[columnName][machineID].text(value);
			if (columnName != 'dns') {
				seriesMapping[columnName][machineID].addPoint([timestamp, value], true, false);		
			} 
		});
	});
}



var objectPanel = $('#objectView');


var selectObject = function (ID) {
	console.log("ID", ID?true:false, ID);
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
		fillObjectPanel();
		objectPanel.show();
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
            shape : 'url(../images/' + MESSAGE_TYPE[message.level] + '.png)',
            events: {
            	click: function () {
            		(function (timestamp) {
            			scrollToLogMessage(timestamp);
            		})(message.timestamp);
            	}
            }
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
