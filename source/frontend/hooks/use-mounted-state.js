import { useState, useCallback } from 'react';

import useMountedRef from './use-mounted-ref';

export default function () {
	let mountedRef = useMountedRef();
	let [state, setState] = useState();

	let setMountedState = useCallback(
		(newState) => {
			if (mountedRef.current) {
				setState(newState);
			}
		},
		[mountedRef],
	);

	return [state, setMountedState];
}
