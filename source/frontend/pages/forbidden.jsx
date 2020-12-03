import React, { useEffect } from 'react';
import Error from './error.jsx';

export default function Forbidden() {
	useEffect(() => {
		document.title = 'Forbidden - Scribbble';

		return () => {
			document.title = 'Scribbble';
		};
	}, []);

	return <Error title="403" description="No Permissions" />;
}
