// Leading and trailing edge debounce.
//
// For example:
//   Inputs:  |-----|-|-|--|--|----
//   Outputs: |-----|-------------|
//            ^~~~^           ^~~~^
//            delay           delay
export function debounce(callback, delay) {
	let timeout = 0;
	return (...args) => {
		if (timeout === 0) {
			// not currently bouncing, set timer...
			timeout = setTimeout(() => {
				timeout = 0;
			}, delay);
			// ...and fire immediately (leading edge)
			callback(...args);
		} else {
			// currently bouncing, reset timer...
			clearTimeout(timeout);
			// ...and fire when it expires (trailing edge)
			timeout = setTimeout(() => {
				timeout = 0;
				callback(...args);
			}, delay);
		}
	};
}
