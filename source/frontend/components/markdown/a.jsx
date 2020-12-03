import React from 'react';

export default function A({ children, ...other }) {
	return (
		<a className="text-blue-500 hover:underline" {...other}>
			{children}
		</a>
	);
}
