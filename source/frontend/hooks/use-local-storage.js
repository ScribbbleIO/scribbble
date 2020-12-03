import { useRef, useEffect, useState, useCallback } from 'react';

const initialState = (initialValue) => {
	if (typeof initialValue === 'function') {
		return initialValue();
	} else {
		return initialValue;
	}
};

const useEventCallback = (fn, dependencies) => {
	const ref = useRef(() => {
		throw new Error('Cannot call an event handler while rendering.');
	});

	useEffect(() => {
		ref.current = fn;
	}, [fn, ...dependencies]);

	return useCallback(
		(...args) => {
			return ref.current(...args);
		},
		[ref],
	);
};

const useLocalStorage = (key, initialValue) => {
	let [data, setData] = useState(() => {
		try {
			let localData = window.localStorage.getItem(key);
			if (localData) {
				return JSON.parse(window.localStorage.getItem(key));
			} else {
				return initialState(initialValue);
			}
		} catch (error) {
			return initialState(initialValue);
		}
	});

	let setDataWithLocalStorage = useEventCallback(
		(value) => {
			window.localStorage.setItem(key, JSON.stringify(value));
			setData(value);
		},
		[key, setData],
	);

	return [data, setDataWithLocalStorage];
};

export default useLocalStorage;
