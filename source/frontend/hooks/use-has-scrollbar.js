import { useState, useEffect } from 'react';

export default function useHasScrollbar(ref) {
	let [hasScrollbar, setHasScrollbar] = useState(false);

	useEffect(() => {
		let element = ref.current;
		let observer = new ResizeObserver(function (entries) {
			let entry = entries[entries.length - 1];
			let doesHaveScrollbar = entry.target.clientHeight < entry.target.scrollHeight;
			setHasScrollbar(doesHaveScrollbar);
		});

		observer.observe(element);

		return function () {
			observer.unobserve(element);
		};
	}, []);

	return hasScrollbar;
}
