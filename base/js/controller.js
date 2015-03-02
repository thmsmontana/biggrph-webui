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





var objectPanel = $('#objectView');




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

