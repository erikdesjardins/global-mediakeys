import * as Util from'./modules/util';
import Domain from'./modules/content/Domain';

new Domain()
	.setupButtons(() => ({
		play: document.querySelector('.ytp-button-play, .ytp-button-pause'),
		next: document.querySelector('.ytp-button-next'),
		prev: document.querySelector('.ytp-button-prev')
	}))
	.setupPlayState((callback, playButton) => {
		Util.onMutation(
			playButton,
			{ attributes: true, attributeFilter: ['class'] },
			() => callback(playButton.classList.contains('ytp-button-pause')),
			{ initialCallback: true }
		);
	})
	.setupInfo(callback => {
		async function sendUpdate(parent) {
			const imageElem = await Util.descendant(parent, '.video-thumb img');
			const titleElem = await Util.descendant(parent, '#watch-headline-title');
			const subtitleElem = await Util.descendant(parent, '.yt-user-info');

			await Util.waitForMutation(
				imageElem,
				{ attributes: true, attributeFilter: ['src'] }
			);

			callback({
				image: `url(${imageElem.src.replace('/s88', '/s250')})`,
				title: titleElem.textContent,
				subtitle: subtitleElem.textContent
			});
		}

		Util.onDescendantMutation(
			document.getElementById('content'),
			'#watch-header',
			{ childList: true },
			sendUpdate,
			{ initialCallback: true }
		);
	})
	.setupAction('watch-later', callback => {
		const button = document.querySelector('.ytp-button-watch-later');

		function sendUpdate() {
			callback({
				icon: '\uf017',
				state: button.classList.contains('html5-async-success')
			});
		}

		Util.onMutation(
			button,
			{ attributes: true, attributeFilter: ['class'] },
			sendUpdate,
			{ initialCallback: true }
		);

		return () => Util.click(button);
	})
	.go(Util.waitForChild(document.getElementById('player-api'), '.html5-video-player'));
