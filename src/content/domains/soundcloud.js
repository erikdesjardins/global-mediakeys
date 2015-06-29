(function() {
	var playButton = document.querySelector('selector');
	var nextButton = document.querySelector('selector');
	var prevButton = document.querySelector('selector');

	Messages.send(Const.msg.REGISTER, {
		canSkip: false,
		playState: false
	});

	Messages.addListener([Const.msg.PLAY, Const.msg.PAUSE], function() {
		Util.click(playButton);
	});

	Messages.addListener(Const.msg.PREV, function() {
		Util.click(prevButton);
	});

	Messages.addListener(Const.msg.NEXT, function() {
		Util.click(nextButton);
	});

	playButton.addEventListener('click', function() {
		Messages.send(Const.msg.PLAY_STATE, playButton.classList.contains('something'));
	});

	window.addEventListener('unload', function() {
		Messages.send(Const.msg.UNREGISTER);
	});
})();
