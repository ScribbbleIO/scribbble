import immer from 'immer';
import { useRef, useState, useCallback, useEffect } from 'react';

export default function useImmerAndUpdateLocalStorageState(key, initialValue) {
	let [value, setValue] = useState(initialValue);

	let valueRef = useRef(value);
	useEffect(() => {
		valueRef.current = value;
	});

	let setImmerValue = useCallback((newValue) => {
		let storageValue;
		if (typeof newValue === 'function') {
			storageValue = immer(valueRef.current, newValue);
			setValue(storageValue);
		} else {
			storageValue = newValue;
			setValue(newValue);
		}
		window.localStorage.setItem(key, JSON.stringify(storageValue));
	}, []);

	return [value, setImmerValue];
}
