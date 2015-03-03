
var objectPanel = $('#objectView');


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
<ul id="subObjects">\
</ul>\
</div>\
</div>\
\
</div>';



var populateObjectDetailPanel = function () {
    objectPanel.empty();
	objectPanel.append(emptyObjectViewString);
	$('#objectName').append(selectedObject.id);
	if (selectedObject.type === 'dataset') {
		$('#objectName').append(' <span class="tag-type">dataset</span>');
	}
	$.each(selectedObject.allocation, function (index, node) {
		var li = $('<li><div id="circle-'+node+'" class="circle"></div> ' + node + '<i class="fa fa-eye"></i></li>');
		li.click(function() {
			setSelectedObject(null);
			showDetailForNode(node);
		});
		$('#objectAllocation').append(li);
	});
}
