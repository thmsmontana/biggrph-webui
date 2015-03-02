var bigObjects = [{"allocation":["localhost"],"id":"acc2007_2.tsv dataset","type":"other"},{"allocation":["localhost"],"id":"acc2007_2","type":"dataset"},{"id":"acc2007_2/bsp-bfs (distance only) from 153013391/distances","type":"other"},{"allocation":["localhost"],"id":"acc2007_2/bsp-bfs (distance only) from 153013391","type":"other"},{"allocation":["localhost"],"id":"acc2007_2/bsp-bfs (distance only) from 153013391/mbox","type":"other"}];

var selectedObject;
var mainPanel = $('#main');

var emptyObjectViewString = '<div class="container bigobject" id="content">\
<h1 class="sixteen columns" id="objectName"></h1>\
<div class="row">\
<div class="panel eight columns">\
<h2>Allocation</h2>\
<ul id="objectAllocation">\
</ul>\
</div>\
<div class="panel eight columns">\
<h2>Sub-objects</h2>\
<ul>\
</ul>\
</div>\
</div>\
\
</div>';

var updateView = function () {
	if (selectedObject) {
		mainPanel.empty();
		mainPanel.append(emptyObjectViewString);
		$('#objectName').append(selectedObject.id);
		if (selectedObject.type === 'dataset') {
			$('#objectName').append(' <span class="tag-type">dataset</span>');
		}
		$.each(selectedObject.allocation, function (index, node) {
			$('#objectAllocation').append('<li><div id="circle-purple" class="circle"></div> ' + node + '<i class="fa fa-eye"></i></li>')
		})
		$('#objectAllocation')

	} else {
		// display cluster view
	}
}


var selectObject = function (ID) {
	selectedObject = null;
	if (ID) {
		$.each(bigObjects, function(index, object) {
			console.log(object.id);
			if (object.id === ID) {
				selectedObject = object;
			return false; // equiv. break;
		}
	});
	}
	updateView();
	return selectedObject;
}