import React from 'react';

export default function PreviewIcon() {
	return (
		<svg className="w-5 h-5" viewBox="0 0 20 20">
			<path
				className="text-gray-300"
				d="M2 4a1 1 0 011-1h5a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1z"
				fill="currentColor"
			/>
			<path
				className="text-blue-500"
				d="M11 3a1 1 0 00-1 1v12a1 1 0 001 1h5a1 1 0 001-1V4a1 1 0 00-1-1z"
				fill="currentColor"
			/>
		</svg>
	);
}
