import React, { useEffect } from 'react';
import Error from './error.jsx';

export default function NotFound() {
	useEffect(() => {
		document.title = 'Not found - Scribbble';

		return () => {
			document.title = 'Scribbble';
		};
	}, []);

	return <Error title="404" description="Page not found" />;
}
