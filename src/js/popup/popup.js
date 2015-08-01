(() => {
	function updateInfo({ image, title, subtitle } = {}) {
		document.body.style.backgroundImage = image;
		document.getElementById('title').textContent = title;
		document.getElementById('subtitle').textContent = subtitle;
	}

	function updateActions(actions = {}) {
		var container = document.getElementById('actions-container');
		Util.empty(container);
		Util.each(actions, (action, type) => {
			var ele = Templates.populate('action-button', action);
			var button = ele.firstElementChild;
			button.addEventListener('click', () => Messages.send(Const.msg.DO_ACTION, type));
			button.classList.toggle('isInactive', !action.state);
			container.appendChild(ele);
		});
	}

	function updatePlayState(state = false) {
		document.body.classList.toggle('isPlaying', state);
	}

	function fetchInfo() {
		Messages.send(Const.msg.INFO)
			.then(updateInfo);
	}

	function fetchActions() {
		Messages.send(Const.msg.ACTIONS)
			.then(updateActions);
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

	Messages.addListener(Const.msg.INFO, updateInfo);

	Messages.addListener(Const.msg.ACTIONS, updateActions);

	// Not using the state from this message as it may be a background tab (e.g. if we pressed stop)
	Messages.addListener(Const.msg.PLAY_STATE, fetchPlayState);

	fetchInfo();
	fetchActions();
	fetchPlayState();
})();
