(function(exports) {
	var listeners = {};

	function addListener(names, callback) {
		[].concat(names).forEach(function(commandName) {
			if (commandName in listeners) {
				console.error('Listener for Command:', commandName, 'already exists.');
			} else {
				listeners[commandName] = callback;
			}
		});
	}

	chrome.commands.onCommand.addListener(function(commandName) {
		if (!(commandName in listeners)) {
			console.error('Unrecognised command:', commandName);
		} else {
			listeners[commandName]();
		}
	});

	exports.addListener = addListener;

})(/* jshint -W020 */ Commands = {});
