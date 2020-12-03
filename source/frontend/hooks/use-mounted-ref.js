import { useRef, useEffect } from 'react';

export default function () {
	let mounted = useRef(false);

	useEffect(() => {
		mounted.current = true;

		return function () {
			mounted.current = false;
		};
	}, []);

	return mounted;
}
