import React from 'react';

export default function PencilIcon(props) {
	return (
		<svg viewBox="0 0 20 20" fill="currentColor" {...props}>
			<path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
		</svg>
	);
}

PencilIcon.Outline = function PencilIcon(props) {
	return (
		<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
			/>
		</svg>
	);
};
