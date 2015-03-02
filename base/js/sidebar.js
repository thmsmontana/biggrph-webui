// Returns an HTML list from a JSON hierarchy tree
function jsonToHtml(jsonTree, prefix) {
	var object, list = document.createElement('ul'), li;

	for (object in jsonTree) {
		(function (o) {
			var node = document.createTextNode(o);
			li = list.appendChild(document.createElement('li'));
			li.appendChild(node);
			$(li).click(function(event) {
				event.stopPropagation();
				selectObject(prefix + o.toString());
			});
			if (typeof jsonTree[o] === "object") {
				li.appendChild(jsonToHtml(jsonTree[o], prefix + o.toString() + '/'));
			} else {
				li.firstChild.nodeValue += jsonTree[o];
			}  
		})(object);

	}
	return list;
} 

function displayBigObjects() {
	var bigObjectsArray = [];

	$('#list-objects').empty();

	$.each(bigObjects, function(key, object) {
		bigObjectsArray.push(object.id);

		/*
		if (key == 'type') {
			switch (value) {
				case 'dataset':
					break;
				case 'other':
					break;
				default:
					break;
			}
		}*/
	});

	// Create JSON hierarchy tree of distributed objects
	var bigObjectsHierarchy = bigObjectsArray.reduce(function(hierarchy, path) {
		var x = hierarchy;
		path.split('/').forEach(function(item) {
			if (!x[item]) {
				x[item] = {};
			}
			x = x[item];
		});
		return hierarchy;
	}, {});

	//console.log(bigObjectsHierarchy);
	
	$('#list-objects').append(jsonToHtml(bigObjectsHierarchy, ""));
}

