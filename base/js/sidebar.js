// Returns an HTML list from a JSON hierarchy tree
function jsonToHtml(jsonTree, prefix) {
	var object, list = document.createElement('ul'), li;

	for (object in jsonTree) {
		(function (o) {
			liContent = document.createElement('span');
			if (o !== "path") {
				var node = document.createTextNode(o);

				liContent.setAttribute('id', 'span-'+o);
				liContent.setAttribute('class', 'spanObject');
				liContent.appendChild(node);
				li = list.appendChild(document.createElement('li'));
				
				li.appendChild(liContent);
				$(li).click(function(event) {
					event.stopPropagation();
					selectObject(prefix + o.toString());
				});

				$(liContent).click(function(event) {
					$('.spanObject').removeClass('spanObjectSelected');
					$(document.getElementById('span-'+o)).addClass('spanObjectSelected');			
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
			x.path = path;
		});
		return hierarchy;
	}, {});

	//console.log(bigObjectsHierarchy);
	
	$('#list-objects').append(jsonToHtml(bigObjectsHierarchy, ""));

}

