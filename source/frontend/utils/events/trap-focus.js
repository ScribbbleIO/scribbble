const TAB = 9;
const FOCUSABLES =
	'a[href], area[href], input:not([disabled]):not([hidden]):not(.hidden), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex]:not(*[tabindex="-1"]), *[contenteditable]';

export default function trapFocus(event) {
	if (event.keyCode !== TAB) return;

	let element;
	let focusables = Array.from(event.currentTarget.querySelectorAll(FOCUSABLES));
	focusables.sort((f1, f2) => {
		return (f1.tabIndex ?? 0) - (f2.tabIndex ?? 0);
	});

	if (focusables.length === 0) {
		element = event.currentTarget;
	} else {
		let index = focusables.indexOf(document.activeElement);
		if (event.shiftKey) {
			if (index === -1 || index === 0) {
				element = focusables[focusables.length - 1];
			} else {
				element = focusables[index - 1];
			}
		} else {
			if (index === focusables.length - 1) {
				element = focusables[0];
			} else {
				element = focusables[index + 1];
			}
		}
	}

	if (element) {
		event.persist();
		event.preventDefault();
		event.stopPropagation();
		element.focus();
	}
}
