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
				//
			});
			$('#list-nodes').append(listNodes);

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

