import { useRef, useEffect } from 'react';

export default function useFirstRenderRef() {
	let firstRender = useRef(true);

	useEffect(() => {
		// We wrap this in a setTimeout because the value
		// needs to change after all the other useEffects
		setTimeout(() => {
			firstRender.current = false;
		}, 0);
	}, []);

	return firstRender;
}
