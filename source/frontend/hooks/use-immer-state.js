import immer from 'immer';
import { useState, useCallback } from 'react';

export default function useImmerState(initialValue) {
	let [value, setValue] = useState(initialValue);

	let setImmerValue = useCallback((newValue) => {
		if (typeof newValue === 'function') {
			setValue(immer(newValue));
		} else {
			setValue(newValue);
		}
	}, []);

	return [value, setImmerValue];
}
