import React from 'react';

import useRendered from '../../hooks/use-rendered.js';

export default function AnimatedSuccessIcon(props) {
	let { onAnimationEnd } = props;

	let didRender = useRendered();

	return (
		<svg
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			className="w-5 h-5 text-white transition-all duration-700 ease-in-out"
			strokeDasharray={24}
			strokeDashoffset={!didRender ? 24 : 0}
			onTransitionEnd={onAnimationEnd}
		>
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
		</svg>
	);
}
