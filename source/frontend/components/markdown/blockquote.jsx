import React from 'react';

export default function Blockquote({ children }) {
	return (
		<blockquote className="py-1 pl-6 italic border-l-4 border-blue-300 bg-blue-50 dark:border-blue-400 dark:bg-gray-800">
			{children}
		</blockquote>
	);
}
