var JSON_TO_PRETTY_NAMES = {
	'id'       : '#',
	'dns'      : 'DNS',
	'absLoadAvg'  : 'Abs Load Average',
	'relLoadAvg'  : 'Rel Load Average',
	'ram'      : 'RAM',
	'ramSpeed' : 'RAM Speed'
};

var HEX_COLORS = [];

/**
 * To access the state of a table cell, tableCellStates[columnID][machineID]
 * where machineID is the numericalID of the machine.
 * @type {{}}
 */
var tableCellStates = {};

/**
 * To access a chart, chart[columnName] where columnName is the column
 * represented on the graph.
 */
var charts = {};

/**
 * To access a chartSeries, chartSeries[columnName][machineID] where
 * columnName is the column represented on the series' graph and
 * the machineID is the numerical ID of the machine.
 */
var chartSeries = {};

var tableCells = {};

var contract;

var selectedObject;

var synchronizeCharts = true;

var bigObjects;

var bigObjectChildren = {};

var firstUpdateValue = true;

var logMessages = [];
var logCounts = {
	0: 0,
	1: 0,
	2: 0
}



var consoleMessages = $('#console-messages');

function hsvToRgb(h, s, v) {
	var r, g, b;
	var i;
	var f, p, q, t;
 
	// Make sure our arguments stay in-range
	h = Math.max(0, Math.min(360, h));
	s = Math.max(0, Math.min(100, s));
	v = Math.max(0, Math.min(100, v));
 
	// We accept saturation and value arguments from 0 to 100 because that's
	// how Photoshop represents those values. Internally, however, the
	// saturation and value are calculated from a range of 0 to 1. We make
	// That conversion here.
	s /= 100;
	v /= 100;
 
	if(s == 0) {
		// Achromatic (grey)
		r = g = b = v;
		return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
	}
 
	h /= 60; // sector 0 to 5
	i = Math.floor(h);
	f = h - i; // factorial part of h
	p = v * (1 - s);
	q = v * (1 - s * f);
	t = v * (1 - s * (1 - f));
 
	switch(i) {
		case 0:
			r = v;
			g = t;
			b = p;
			break;
 		case 1:
			r = q;
			g = v;
			b = p;
			break;
 		case 2:
			r = p;
			g = v;
			b = t;
			break;
 		case 3:
			r = p;
			g = q;
			b = v;
			break;
 		case 4:
			r = t;
			g = p;
			b = v;
			break;
		default: // case 5:
			r = v;
			g = p;
			b = q;
	}
	return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function randomColor() {
	var color = ~~(Math.random() * 360);
    return "rgb("+hsvToRgb(color, 40, 70)+")";
}


function onNewNodeStats (timestamp, jsonValues) {
	$.each(jsonValues, function(machineID, columns) {
		if (firstUpdateValue) {
			var listNodes = document.createElement('ul'), li;
			var node = document.createTextNode(columns.dns);
			li = listNodes.appendChild(document.createElement('li'));
			li.setAttribute('id', columns.dns);
			li.appendChild(node);
			$(li).click(function(event) {
				setSelectedObject(null);
				showDetailForNode(columns.dns);
			});
			$('#list-nodes').append(listNodes);

			document.styleSheets[0].addRule('#circle-'+ columns.dns +'::before','background-color:'+ HEX_COLORS[machineID].color +';');
			document.styleSheets[0].addRule('#circle-'+ machineID +'::before','background-color:'+ HEX_COLORS[machineID].color +';');
			document.styleSheets[0].addRule('.machineRow'+ machineID + ' td.checked','background-color:'+ HEX_COLORS[machineID].color +';');

			firstUpdateValue = false;
		}
				
		$.each(columns, function(columnName, value) {
			if (columnName == 'id') return true;
			tableCells[columnName][machineID].text(value);
			if (columnName != 'dns') {
				chartSeries[columnName][machineID].addPoint([timestamp, value], true, false);
			} 
		});
	});
}



var refreshMainView = function () {
	if (selectedObject) {
		$('#main').hide();
		populateObjectDetailPanel();
		objectPanel.show();
	} else {
		$('.spanObject').removeClass('spanObjectSelected');
		objectPanel.hide();
		$('#main').show();
	}
}


var onNewLogMessage = function (message) {
    var MESSAGE_TYPE = {
        0: 'info',
        1: 'warning',
        2: 'error'
    };

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
            			scrollConsoleToTimestamp(timestamp);
            		})(message.timestamp);
            	}
            }
		}, true, false);
	});
	if (message.level >= consoleLevelFilter) {
		logCounts[message.level]++;
		refreshConsoleStatsView();
		appendLogMessageToView(message);
	}
}


var onUpdatedBigObjects = function (data) {
    bigObjects = data;
    displayBigObjects();
}








/**
 * Checks the whole row for the machine whose dns matches
 * and switches the view to cluster view
 * @param dns
 */
var showDetailForNode = function (dns) {
    $.each(tableCells.dns, function(i, val) {
        if (val.html() === dns) {
            toggleRow(i, true);
            setSelectedObject(null);
            return false;
        }
    });
}

/**
 * When ID is null, shows the cluster view. If ID corresponds to
 * the ID of a distributed big object, switch to its detail view.
 * @param ID
 */
var setSelectedObject = function (ID) {

    selectedObject = null;
    if (ID) {
        $.each(bigObjects, function(index, object) {
            if (object.id === ID) {
                selectedObject = object;
                $('.spanObject').removeClass('spanObjectSelected');
                $(document.getElementById('span-'+ID)).addClass('spanObjectSelected');
                return false; // equiv. break;
            }
        });
    }
    refreshMainView();
    return selectedObject;
}

