var clusterView = $('#clusterView');





var generateDataTable = function () {

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

		if (!HEX_COLORS[machineID]) {	
			HEX_COLORS[machineID] = { 
				color : getRandomColor() 
			};
			//console.log('HEX_COLORS : ',HEX_COLORS);		
		}

		var machineRow = $('<tr></tr>');
		machineRow.addClass('machineRow' + machineID );

		// color disk
		var colorCell = $('<td><div id="circle-'+ machineID +'" class="circle"></div></td>');
		
		machineRow.append(colorCell);

		// value cells
		$.each(contract['columns'], function(j, columnName) {
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

				seriesMapping[columnName][machineID] = charts[columnName].addSeries({name:machineID, color: HEX_COLORS[machineID].color, data:[]});
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


	//	Add table to clusterView
	clusterView.find('#data-table').empty();
	clusterView.find('#data-table').append(table);
};


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

function toggleRow (machineID, active) {
	if (active) {
		allChecked = false;
	} else {
		var allChecked = true;

		$.each(checkedCells, function(columnName, checkedMachines) {
			var checked = checkedMachines[machineID];
			if (!checked) {
				allChecked = false;
				return false;
			}
		});
	}

	$.each(checkedCells, function(columnName, checkedMachines) {
		checkCell(columnName, machineID, !allChecked);
	});
}

function activateRow (node) {
	$.each(cellMapping.dns, function(i, val) {
		if (val.html() === node) {
			toggleRow(i, true);
			selectObject(null);
			return false;
		}
	});
}

function toggleCell (machineID, columnName) {
	var checked = checkedCells[columnName][machineID];
	checkCell(columnName, machineID, !checked);
}

function checkCell(columnName, machineID, checked) {
	if (columnName === 'id') return;
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
