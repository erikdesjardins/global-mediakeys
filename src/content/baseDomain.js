(function(exports) {
	exports.prototype.defButtons = function(func) {
		this._buttons = func;
		return this;
	};

	exports.prototype.defPlayState = function(func) {
		this._getPlayState = func;
		return this;
	};

	exports.prototype.go = function(eventName, eventTarget) {
		if (eventName) {
			this._event = eventName;
			this._eventTarget = eventTarget ? document.querySelector(eventTarget) : window;
			this._eventTarget.addEventListener(this._event, this.go.bind(this));
		}

		this.buttons = this._buttons();

		if (!this.buttons.play) {
			console.warn('No play button found.');
			return;
		}

		if (this._event && this._eventTarget) {
			this._eventTarget.removeEventListener(this._event, this.go.bind(this));
		}

		this.getPlayState = this._getPlayState.bind(this, this.buttons.play);

		Messages.send(Const.msg.REGISTER, {
			canSkip: !!(this.buttons.next || this.buttons.prev),
			playState: this.getPlayState()
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

		Util.dom.observeClasses(this.buttons.play, function(/* classList */) {
			Messages.send(Const.msg.PLAY_STATE, this.getPlayState());
		}.bind(this));

		window.addEventListener('unload', function() {
			Messages.send(Const.msg.UNREGISTER);
		});
	};
})(/* jshint -W020 */ Domain = function() {});
