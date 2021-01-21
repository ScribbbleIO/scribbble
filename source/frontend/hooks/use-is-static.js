import { useContext } from 'react';

import StaticContext from '../contexts/is-static.js';

export function useIsStatic() {
	return useContext(StaticContext);
}
