const Domain = (() => {
	function Domain() {
		this._actions = {};
		this.actionData = {};
	}

	Util.extend(Domain.prototype, {
		setupButtons(func) {
			if (this._buttons) {
				console.error('setupButtons() has already been called.');
			} else {
				this._buttons = func;
			}
			return this;
		},
		setupPlayState(func) {
			if (this._playState) {
				console.error('setupPlayState() has already been called.');
			} else {
				this._playState = func;
			}
			return this;
		},
		setupInfo(func) {
			if (this._info) {
				console.error('setupInfo() has already been called.');
			} else {
				this._info = func;
			}
			return this;
		},
		setupAction(type, func) {
			if (type in this._actions) {
				console.error('Action:', type, 'already exists.');
			} else {
				this._actions[type] = func;
			}
			return this;
		},
		async go(setup) {
			if (setup) {
				setup.then(() => this.go());
				return;
			}

			const buttons = this._buttons();

			if (!buttons.play) {
				console.warn('No play button found.');
				return;
			}

			Messages.addListener(Const.msg.PLAY_PAUSE, () => Util.click(buttons.play));
			Messages.addListener(Const.msg.NEXT, () => Util.click(buttons.next));
			Messages.addListener(Const.msg.PREV, () => Util.click(buttons.prev));

			await Messages.send(Const.msg.REGISTER);

			window.addEventListener('unload', () => Messages.send(Const.msg.UNREGISTER));

			this._playState(Util.debounce(state => Messages.send(Const.msg.PLAY_STATE, state), 50), buttons.play);

			this._info(Util.debounce(info => Messages.send(Const.msg.INFO, info), 50));

			const sendActionUpdate = Util.debounce(() => Messages.send(Const.msg.ACTIONS, this.actionData), 50);

			Util.asyncMap(this._actions, (setup, type) =>
					setup(data => {
						this.actionData[type] = data;
						sendActionUpdate();
					})
			);

			Messages.addListener(Const.msg.DO_ACTION, type => this._actions[type]());
		}
	});

	return Domain;
})();
