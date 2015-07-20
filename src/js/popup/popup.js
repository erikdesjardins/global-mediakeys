(function() {
	function updateInfo(info = {}) {
		document.body.style.backgroundImage = info.image;
		document.getElementById('title').textContent = info.title;
		document.getElementById('subtitle').textContent = info.subtitle;
	}

	function updatePlayState(state = false) {
		document.body.classList.toggle('playing', state);
	}

	function fetchInfo() {
		Messages.send(Const.msg.INFO)
			.then(updateInfo);
	}

	function fetchPlayState() {
		Messages.send(Const.msg.PLAY_STATE)
			.then(updatePlayState);
	}

	document.getElementById('prev')
		.addEventListener('click', () => Messages.send(Const.msg.PREV));

	document.getElementById('play-pause')
		.addEventListener('click', () => Messages.send(Const.msg.PLAY_PAUSE));

	document.getElementById('next')
		.addEventListener('click', () => Messages.send(Const.msg.NEXT));

	// Not responding since the background page handles these
	Messages.addListener(Const.msg.INFO, (info) => {
		updateInfo(info);
		return Const.status.NO_RESPONSE;
	});

	Messages.addListener(Const.msg.PLAY_STATE, () => {
		// Not using the state from this message as it may be a background tab
		// e.g. if we pressed stop
		fetchPlayState();
		return Const.status.NO_RESPONSE;
	});

	fetchInfo();
	fetchPlayState();
})();
