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

var _contract;

function generateDataTable (contract) {
	_contract = contract;

	var table = $('<table id="table"></table>');
	
	// First row
	
	var firstRow = $('<tr><td></td></tr>');

	$.each(contract['columns'], function(i) {
		var column = contract.columns[i];
		var headerCell = $('<td class="col"></td>');
		headerCell.text(JSON_TO_PRETTY_NAMES[column]);

		if (column == 'id' || column == 'dns') {
			headerCell.click(toggleAllCells);
			headerCell.mouseover(function() {
				highlightAllCells(true);
			});
			headerCell.mouseout(function() {
				highlightAllCells(false);
			});
		} else {
			headerCell.click(function() {
				toggleColumn(column);
			});
			headerCell.mouseover(function() {
				highlightColumn(column, true);
			});
			headerCell.mouseout(function() {
				highlightColumn(column, false);
			});

			charts[column] = generateChart(column);
		}

		checkedCells[column] = {};

		cellMapping[column] = {};

		firstRow.append(headerCell);
	});

	table.append(firstRow);

	
	//	Value rows
	
	var i = 1;	// just to ensure we iterate through every color independently of the machine ID.
	$.each(contract['machines'], function(machineID) {

		var machineRow = $('<tr></tr>');
		machineRow.addClass(LABEL_COLORS[i]);
		// color disk
		var colorCell = $('<td><div id="circle-'+ LABEL_COLORS[i] +'" class="circle"></div></td>');
		machineRow.append(colorCell);

		// value cells
		$.each(contract['columns'], function(j) {
			var columnName = contract['columns'][j];
			var valueCell = $('<td></td>');
			valueCell.text(JSON_TO_PRETTY_NAMES[columnName] + ' for #' + machineID);

			if (columnName == 'id' || columnName == 'dns') {
				valueCell.click(function() {
					toggleRow(machineID);
				});
				valueCell.mouseover(function() {
					highlightRow(machineID, true);
				});
				valueCell.mouseout(function() {
					highlightRow(machineID, false);
				});
			} else {
				valueCell.click(function() {
					toggleCell(machineID, columnName);
				});

				seriesMapping[columnName][machineID] = charts[columnName].addSeries({name:machineID, color: HEX_COLORS[i], data:[]});
							charts[columnName].addSeries({
				type: 'flags',
				id: 'events',
				data: [],
				width: 16,
            	height: 16
			}, true, false);
				seriesMapping[columnName][machineID].hide();
			}

			machineRow.append(valueCell);

			checkedCells[columnName][machineID] = false;
			cellMapping[columnName][machineID] = valueCell;
		});

		table.append(machineRow);

		i++;
	});


	//	Add table to DOM
	
	$('#data-table').append(table);
}


function toggleAllCells () {
	var allChecked = true;

	$.each(checkedCells, function(columnName, checkedMachines) {
		$.each(checkedMachines, function(machineID, checked) {
			if (!checked) {
				allChecked = false;
				return false;
			}
		});
		if (!allChecked) return false;
	});

	$.each(checkedCells, function(columnName, checkedMachines) {
		$.each(checkedMachines, function(machineID, checked) {
			checkCell(columnName, machineID, !allChecked);
		});
	});
}

function toggleColumn (columnName) {
	var allChecked = true;

	$.each(checkedCells[columnName], function(machineID, checked) {
		if (!checked) {
			allChecked = false;
			return false;
		}
	});

	$.each(checkedCells[columnName], function(machineID, checked) {
		checkCell(columnName, machineID, !allChecked);
	});
}

function toggleRow (machineID) {
	var allChecked = true;

	$.each(checkedCells, function(columnName, checkedMachines) {
		var checked = checkedMachines[machineID];
		if (!checked) {
			allChecked = false;
			return false;
		}
	});

	$.each(checkedCells, function(columnName, checkedMachines) {
		checkCell(columnName, machineID, !allChecked);
	});
}

function toggleCell (machineID, columnName) {
	var checked = checkedCells[columnName][machineID];
	checkCell(columnName, machineID, !checked);
}

function checkCell(columnName, machineID, checked) {
	if (checked) {
		if (columnName != 'dns' && columnName != 'id') {
			seriesMapping[columnName][machineID].show();
			if (columnIsFalse(columnName)) {
				$('#chart-' + columnName).show();
				charts[columnName].reflow();
			}
		}
		checkedCells[columnName][machineID] = checked;
		cellMapping[columnName][machineID].addClass('checked');
	} else {
		checkedCells[columnName][machineID] = checked;
		if (columnName != 'dns' && columnName != 'id') {
			seriesMapping[columnName][machineID].hide();
			if (columnIsFalse(columnName)) {
				$('#chart-' + columnName).hide();
			}
		}
		cellMapping[columnName][machineID].removeClass('checked');
	}
}

function columnIsFalse(columnName) {
	var isFalse = true;
	$.each(checkedCells[columnName], function(machineID, checked) {
		if (checked) {
			isFalse = false;
			return false;
		}
	});
	return isFalse;
}


function highlightAllCells (hover) {
	$.each(cellMapping, function(columnName, machines) {
		$.each(machines, function(machineID, td) {
			highlightCell(columnName, machineID, hover);
		});
	});
}

function highlightColumn (columnName, hover) {
	$.each(cellMapping[columnName], function(machineID, td) {
		highlightCell(columnName, machineID, hover);
	});
}

function highlightRow (machineID, hover) {
	$.each(cellMapping, function(columnName, machines) {
		highlightCell(columnName, machineID, hover);
	});
}

function highlightCell(columnName, machineID, hover) {
	if (hover) {
		cellMapping[columnName][machineID].addClass('cell-grey');
	} else {
		cellMapping[columnName][machineID].removeClass('cell-grey');
	}
}



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


function generateChart(columnName) {
	seriesMapping[columnName] = {};
	var id = 'chart-' + columnName;
	var div = $('<div id="' + id + '"></div>');
	div.hide();
	$('#charts').append(div);
	return new Highcharts.StockChart({
		chart: {
			type: 'areaspline',
			renderTo: id
		},
		animation: {
			duration: 100,
			ease: 'linear'
		},
		legend: {
			enabled: false
		},
		tooltip: {
			style: {
                    width: '200px'
                },
                valueDecimals: 4
		},
		plotOptions: {
			areaspline: {
				marker: {
					enabled: false
				},
				fillOpacity: .45
			}
		},
		title: { text: JSON_TO_PRETTY_NAMES[columnName] },
		series: [],
		rangeSelector: {
			enabled: false
		}
	});
}
