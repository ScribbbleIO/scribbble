import { useRef, useEffect, useCallback } from 'react';

import useMountedState from './use-mounted-state';

export default function (func, options = {}) {
	let idRef = useRef(0);
	let funcRef = useRef(func);
	let optionsRef = useRef(options);
	let [running, setRunning] = useMountedState(false);
	let [pending, setPending] = useMountedState(false);

	let callback = useCallback(
		async function (...args) {
			let func = funcRef.current;
			let count = ++idRef.current;
			let options = optionsRef.current;

			let { delayMs = 200, minBusyMs = 500 } = options;

			let minBusyPromise;
			setTimeout(function () {
				if (count === idRef.current) {
					minBusyPromise = new Promise(function (resolve) {
						setTimeout(resolve, minBusyMs);
					});

					setPending(true);
				}
			}, delayMs);

			try {
				setRunning(true);
				let result = await func(...args);
				if (count === idRef.current) {
					setRunning(false);
				}
				return result;
			} finally {
				if (minBusyPromise) await minBusyPromise;
				if (count === idRef.current) {
					idRef.current = -1;
					setRunning(false);
					setPending(false);
				}
			}
		},
		[setPending, setRunning],
	);

	useEffect(function () {
		funcRef.current = func;
		optionsRef.current = options;
	});

	return [callback, running, pending];
}
