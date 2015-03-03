// Returns an HTML list from a JSON hierarchy tree
function jsonToHtml(jsonTree, prefix) {
	var object, list = document.createElement('ul'), li;

	var keys = Object.keys(jsonTree);
	// If the tree has more than one child (path), there are subobjects
	if (keys.length > 1) {
		// Make sure to remove the path from the children before sending the subobjects
		var indexOfPath = keys.indexOf("path");
		if (indexOfPath !== -1) {
			keys.splice(indexOfPath, 1);
		}
		if(jsonTree.path !== undefined) {
            bigObjectChildren[jsonTree.path] = keys;
		}
	}

	for (object in jsonTree) {
		(function (o) {
			liContent = document.createElement('span');
			if (o !== "path") {
				var node = document.createTextNode(o);

				liContent.setAttribute('id', 'span-'+ prefix + o.toString());
				liContent.setAttribute('class', 'spanObject');
				liContent.appendChild(node);
				li = list.appendChild(document.createElement('li'));
				
				li.appendChild(liContent);
				$(li).click(function(event) {
					event.stopPropagation();
					setSelectedObject(prefix + o.toString());
				});

				$(liContent).click(function(event) {
					setSelectedObject(prefix + o.toString());
				});
			}					
			
			if (typeof jsonTree[o] === "object") {
				li.appendChild(jsonToHtml(jsonTree[o], prefix + o.toString() + '/'));
			}
		})(object);
	}
	return list;
} 


function displayBigObjects() {
	var bigObjectsArray = [];

	$('#list-objects').empty();

    console.log(bigObjects);
	$.each(bigObjects, function(key, object) {
		bigObjectsArray.push(object.id);
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
		x.path = path;
		return hierarchy;
	}, {});

	$('#list-objects').append(jsonToHtml(bigObjectsHierarchy, ""));

}

