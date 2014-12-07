/*
 *	TOGGLE CONSOLE
 */
$('#toggle-console').click(function() {
	if ($('#console').hasClass('collapsed')) {
		showConsole();
	} else {
		hideConsole();
	}
});



/*
 *	CONSOLE FILTERS
 */

$('#console-showall').click(function() {
	var c = $('#console-messages');
	c.removeClass('log-warning');
	c.removeClass('log-error');
	showConsole();
});

$('#console-level-info').click(function() {
	var c = $('#console-messages');
	c.removeClass('log-warning');
	c.removeClass('log-error');
	showConsole();
});

$('#console-level-warning').click(function() {
	var c = $('#console-messages');
	console.log(c);
	if (!c.hasClass('log-warning')) {
		c.addClass('log-warning');
	}
	c.removeClass('log-error');
	showConsole();
});

$('#console-level-error').click(function() {
	var c = $('#console-messages');
	c.removeClass('log-warning');
	if (!c.hasClass('log-error')) {
		c.addClass('log-error');
	}
	showConsole();
});



/*
 *	ADD MESSAGES
 */

$('#add-info').click(function() {
	addMessage(0, "messageString");
});

$('#add-warning').click(function() {
	addMessage(1, "messageString");
});

$('#add-error').click(function() {
	addMessage(2, "messageString");
});





/*
 * STYLE BUISNESS
 */

function showConsole() {
	$('#console').removeClass('collapsed')
}

function hideConsole() {
	$('#console').addClass('collapsed');
}

function buildMessage(messageType, messageString) {
	var typeString;
	switch (messageType) {
		case 0:
			typeString = "info";
			break;
		case 1:
			typeString = "warning";
			break;
		case 2:
			typeString = "error";
			break;
	}
	var message = '<div class="console-message message-'+ typeString+  '">				<div class="console-message-meta">					<a class="timestamp" href="#">25/12/2014 15:30:03</a>					<span class="tag tag-' + typeString + '">' + typeString + '</span>				</div>				<p class="console-message-string">' + messageString + '</p>			</div>'
	return message;
}

function addMessage(messageType, messageString) {
	var jsDiv = document.getElementById('console-messages');
	var scroll = $('#console-messages').scrollTop() + $('#console-messages').innerHeight() >= jsDiv.scrollHeight;
	$(buildMessage(messageType, messageString)).appendTo('#console-messages');
	if (scroll) {
		$("#console-messages").animate({scrollTop:$("#console-messages")[0].scrollHeight}, 300);
	}
}











