var JSON_TO_PRETTY_NAMES = {
	'id'       : '#',
	'dns'      : 'DNS',
	'loadAvg'  : 'Load Average',
	'ram'      : 'RAM',
	'cpu'      : 'CPU',
	'ramSpeed' : 'RAM Speed'
};

var LABEL_COLORS = {
	1: 'purple',
	2: 'blue',
	3: 'green',
	4: 'orange',
	5: 'pink'
};


/*
 * TODO
 */
 var checkedCells = {};

/*
 * TODO
 */
 var cellMapping = {};

 function generateDataTable (contract) {
 	var table = $('<table id="table"></table>');
	/*
	 *	First row
	 */
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
	 	}

	 	checkedCells[column] = {};

	 	cellMapping[column] = {};

	 	firstRow.append(headerCell);
	 });

	 table.append(firstRow);

	/*
	 *	Value rows
	 */
	var i = 1;	// just to ensure we iterate through every color independently of the machine ID.
	$.each(contract['machines'], function(machineID) {

		var machineRow = $('<tr></tr>');
		machineRow.addClass(LABEL_COLORS[i]);
		// color disk
		var colorCell = $('<td><div id="circle-'+ LABEL_COLORS[i++] +'" class="circle"></div></td>');
		machineRow.append(colorCell);

		// value cells
		$.each(contract['columns'], function(i) {
			var columnName = contract['columns'][i];
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
			}

			machineRow.append(valueCell);

			checkedCells[columnName][machineID] = false;
			cellMapping[columnName][machineID] = valueCell;
		});

		table.append(machineRow);
	});

	/*
	 *	Add table to DOM
	 */
	 $('#data-table').append(table);
	}


	function updateValues (jsonValues) {
		$.each(jsonValues, function(machineID, columns) {
			$.each(columns, function(columnName, value) {
				if (columnName == 'id') return true;
				cellMapping[columnName][machineID].text(value);
			});
		});
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
		checkedCells[columnName][machineID] = checked;
		if (checked) {
			cellMapping[columnName][machineID].addClass('checked');
		} else {
			cellMapping[columnName][machineID].removeClass('checked');
		}
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



