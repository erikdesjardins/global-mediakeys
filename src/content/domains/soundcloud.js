(function() {
	var playButton = document.querySelector('selector');
	var nextButton = document.querySelector('selector');
	var prevButton = document.querySelector('selector');

	Messages.send(Global.msg.REGISTER, {
		canSkip: false,
		playState: false
	});

	Messages.addListener([Global.msg.PLAY, Global.msg.PAUSE], function() {
		Util.click(playButton);
	});

	Messages.addListener(Global.msg.PREV, function() {
		Util.click(prevButton);
	});

	Messages.addListener(Global.msg.NEXT, function() {
		Util.click(nextButton);
	});

	playButton.addEventListener('click', function() {
		Messages.send(Global.msg.PLAY_STATE, playButton.classList.contains('something'));
	});

	window.addEventListener('unload', function() {
		Messages.send(Global.msg.UNREGISTER);
	});
})();
