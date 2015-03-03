var clusterView = $('#clusterView');


/**
 * Creates the stats table, refreshes the node list on the sidebar, sets up the charts.
 */
var initializeClusterInfo = function () {

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

		tableCellStates[column] = {};

		tableCells[column] = {};

		firstRow.append(headerCell);
	});

	table.append(firstRow);

	
	//	Value rows
	
	var i = 1;	// just to ensure we iterate through every color independently of the machine ID.
	$.each(contract['machines'], function(machineID) {

		if (!HEX_COLORS[machineID]) {	
			HEX_COLORS[machineID] = { 
				color : randomColor()
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
					toggleRow(machineID, false);
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

				chartSeries[columnName][machineID] = charts[columnName].addSeries({name:machineID, color: HEX_COLORS[machineID].color, data:[]});
				charts[columnName].addSeries({
					type: 'flags',
					id: 'events',
					data: [],
					width: 16,
					height: 16
				}, true, false);
				chartSeries[columnName][machineID].hide();
			}

			machineRow.append(valueCell);

			tableCellStates[columnName][machineID] = false;
			tableCells[columnName][machineID] = valueCell;
		});

        table.append(machineRow);

        i++;
    });


    $('#toggle-chartSync').click(function(event) {
        synchronizeCharts = !synchronizeCharts;
        if (!synchronizeCharts) {
            $('#toggle-chartSync').find('i').removeClass('fa-check-square-o');
            $('#toggle-chartSync').find('i').addClass('fa-square-o');
        } else {
            $('#toggle-chartSync').find('i').removeClass('fa-square-o');
            $('#toggle-chartSync').find('i').addClass('fa-check-square-o');
        }
    });


    //	Add table to clusterView
	clusterView.find('#data-table').empty();
	clusterView.find('#data-table').append(table);
};


function toggleAllCells () {
	var allChecked = true;

	$.each(tableCellStates, function(columnName, checkedMachines) {
		$.each(checkedMachines, function(machineID, checked) {
			if (!checked) {
				allChecked = false;
				return false;
			}
		});
		if (!allChecked) return false;
	});

	$.each(tableCellStates, function(columnName, checkedMachines) {
		$.each(checkedMachines, function(machineID, checked) {
			checkCell(columnName, machineID, !allChecked);
		});
	});
}

function toggleColumn (columnName) {
	var allChecked = true;

	$.each(tableCellStates[columnName], function(machineID, checked) {
		if (!checked) {
			allChecked = false;
			return false;
		}
	});

	$.each(tableCellStates[columnName], function(machineID, checked) {
		checkCell(columnName, machineID, !allChecked);
	});
}

function toggleRow (machineID, active) {
	var allChecked;
	if (active) {
		allChecked = false;
	} else {
		allChecked = true;

		$.each(tableCellStates, function(columnName, checkedMachines) {
			if (columnName == 'id') return true;
			var checked = checkedMachines[machineID];
			if (!checked) {
				allChecked = false;
				return false;
			}
		});
	}

	$.each(tableCellStates, function(columnName, checkedMachines) {
		checkCell(columnName, machineID, !allChecked);
	});
}


function toggleCell (machineID, columnName) {
	var checked = tableCellStates[columnName][machineID];
	checkCell(columnName, machineID, !checked);
}

function checkCell(columnName, machineID, checked) {
	if (columnName === 'id') return;
	if (checked) {
		if (columnName != 'dns' && columnName != 'id') {
			chartSeries[columnName][machineID].show();
			if (columnIsFalse(columnName)) {
				$('#chart-' + columnName).show();
				charts[columnName].reflow();
			}
		}
		tableCellStates[columnName][machineID] = checked;
		tableCells[columnName][machineID].addClass('checked');
	} else {
		tableCellStates[columnName][machineID] = checked;
		if (columnName != 'dns' && columnName != 'id') {
			chartSeries[columnName][machineID].hide();
			if (columnIsFalse(columnName)) {
				$('#chart-' + columnName).hide();
			}
		}
		tableCells[columnName][machineID].removeClass('checked');
	}
}

function columnIsFalse(columnName) {
	var isFalse = true;
	$.each(tableCellStates[columnName], function(machineID, checked) {
		if (checked) {
			isFalse = false;
			return false;
		}
	});
	return isFalse;
}


function highlightAllCells (hover) {
	$.each(tableCells, function(columnName, machines) {
		$.each(machines, function(machineID, td) {
			highlightCell(columnName, machineID, hover);
		});
	});
}

function highlightColumn (columnName, hover) {
	$.each(tableCells[columnName], function(machineID, td) {
		highlightCell(columnName, machineID, hover);
	});
}

function highlightRow (machineID, hover) {
	$.each(tableCells, function(columnName, machines) {
		highlightCell(columnName, machineID, hover);
	});
}

function highlightCell(columnName, machineID, hover) {
	if (hover) {
		tableCells[columnName][machineID].addClass('cell-grey');
	} else {
		tableCells[columnName][machineID].removeClass('cell-grey');
	}
}




var onSetExtremes = function (min, max, originalColumn) {
	if (synchronizeCharts) {
		$.each(charts, function(column, chart) {
			if (column === originalColumn) {
			 	return true;
			}
			chart.xAxis[0].setExtremes(min, max);
		});
	}
}



function generateChart(columnName) {
	chartSeries[columnName] = {};
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
		xAxis: {
			events: {
				afterSetExtremes: function (event) {
					if (event.trigger === 'navigator') {
						onSetExtremes(event.min, event.max, columnName);
					}
				}
			}
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
