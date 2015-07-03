(function(exports) {'use strict';
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

	exports.prototype.go = function(setup) {
		if (setup) {
			if (this._cleanup) {
				console.error('go() has already been called with a setup function.');
			} else {
				this._cleanup = setup(this.go.bind(this));
			}
		}

		this.buttons = this._buttons();

		if (!this.buttons.play) {
			console.warn('No play button found.');
			return;
		}

		if (this._cleanup) {
			this._cleanup();
		}

		var currentPlayState = this._playState(
			Messages.send.bind(Messages, Const.msg.PLAY_STATE),
			this.buttons
		);

		Messages.send(Const.msg.REGISTER, {
			canSkip: !!(this.buttons.next || this.buttons.prev),
			isPlaying: currentPlayState
		});

		Messages.addListener([Const.msg.PLAY, Const.msg.PAUSE], function() {
			Util.dom.click(this.buttons.play);
		}.bind(this));

		Messages.addListener(Const.msg.NEXT, function() {
			Util.dom.click(this.buttons.next);
		}.bind(this));

		Messages.addListener(Const.msg.PREV, function() {
			Util.dom.click(this.buttons.prev);
		}.bind(this));

		window.addEventListener('unload', function() {
			Messages.send(Const.msg.UNREGISTER);
		});
	};
})(/* jshint -W020 */ Domain = function() {});
