
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
<div class="row">\
<div class="panel eight columns">\
<h2>Information</h2>\
<ul id="objectInformation">\
</ul>\
</div>\
\
</div>';



var populateObjectDetailPanel = function () {
    objectPanel.empty();
	objectPanel.append(emptyObjectViewString);
	$('#objectName').append(selectedObject.id);
	$('#objectName').append(' <span class="tag-type">'+selectedObject.type+'</span>');

	if (selectedObject.infos === undefined) {
		var li = $('<li>Not available</li>');
        $('#objectInformation').append(li);
	} else {
		$.each(selectedObject.infos, function (property, value) {
			var li = $('<li>' + value + " " + property + '</li>');
	        $('#objectInformation').append(li);
		});	
	}

	$.each(selectedObject.allocation, function (index, node) {
		var li = $('<li><div id="circle-'+node+'" class="circle"></div> ' + node + '<i class="fa fa-eye"></i></li>');
		li.click(function() {
			setSelectedObject(null);
			showDetailForNode(node);
		});
		$('#objectAllocation').append(li);
	});

	if (bigObjectChildren[selectedObject.id] !== undefined) {
		$.each(bigObjectChildren[selectedObject.id], function (index, childName) {
	        var li = $('<li>' + childName + '</li>');
	        li.click(function() {
	            setSelectedObject(selectedObject.id + '/' + childName);
	        });
	        $('#subObjects').append(li);
	    });
	} else {
		var li = $('<li>None</li>');
        $('#subObjects').append(li);
	}
   
}
