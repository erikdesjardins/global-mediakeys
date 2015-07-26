window.Domain = (function() {
	var exports = function() {
		this._actions = {};
	};

	exports.prototype.setupButtons = function(func) {
		if (this._buttons) {
			console.error('setupButtons() has already been called.');
		} else {
			this._buttons = func;
		}
		return this;
	};

	exports.prototype.setupPlayState = function(func) {
		if (this._playState) {
			console.error('setupPlayState() has already been called.');
		} else {
			this._playState = func;
		}
		return this;
	};

	exports.prototype.setupInfo = function(func) {
		if (this._info) {
			console.error('setupInfo() has already been called.');
		} else {
			this._info = func;
		}
		return this;
	};

	exports.prototype.setupAction = function(type, func) {
		if (type in this._actions) {
			console.error('Action:', type, 'already exists.');
		} else {
			this._actions[type] = func;
		}
		return this;
	};

	exports.prototype.go = async function(setup) {
		if (this.setupComplete) {
			return;
		}

		if (setup) {
			setup.then(() => this.go());
		}

		var buttons = this._buttons();

		if (!buttons.play) {
			console.warn('No play button found.');
			return;
		} else {
			this.setupComplete = true;
		}

		await Messages.send(Const.msg.REGISTER);

		Messages.addListener(Const.msg.PLAY_PAUSE, () => Util.click(buttons.play));
		Messages.addListener(Const.msg.NEXT, () => Util.click(buttons.next));
		Messages.addListener(Const.msg.PREV, () => Util.click(buttons.prev));

		window.addEventListener('unload', () => Messages.send(Const.msg.UNREGISTER));

		this._playState(Util.debounce(state => Messages.send(Const.msg.PLAY_STATE, state), 50), buttons.play);

		this._info(Util.debounce(info => Messages.send(Const.msg.INFO, info), 50));

		var actionData = {};
		var sendActionUpdate = Util.debounce(() => Messages.send(Const.msg.ACTIONS, actionData), 50);

		Util.asyncMap(this._actions, (setup, type) =>
				setup(data => {
					actionData[type] = data;
					sendActionUpdate();
				})
		);

		Messages.addListener(Const.msg.DO_ACTION, type => this._actions[type]());
	};

	return exports;
})();
