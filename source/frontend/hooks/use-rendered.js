import { useState, useEffect } from 'react';

// When using useMounted the mount state change to true could occure before a frame was renderer.
// This would cause to fail animations based on mount state
// Difficult to spot bug, as it would only occur if rendering was sufficiently fast
// for the state change to occur between animation frames.

export default function useRendered() {
	let [rendered, setRendered] = useState(false);

	useEffect(() => {
		let id = requestAnimationFrame(() => {
			id = undefined;
			setRendered(true);
		});

		return () => {
			if (id != undefined) cancelAnimationFrame(id);
		};
	}, []);

	return rendered;
}
