import React, { useRef, useState, useLayoutEffect } from 'react';

export default function Spinner({ size, color, strokeWidth = 3 }) {
	let ref = useRef();
	let [width, setWidth] = useState(16);
	let [height, setHeight] = useState(16);

	useLayoutEffect(() => {
		setWidth(ref.current.clientWidth);
		setHeight(ref.current.clientHeight);
	}, []);

	let boxSize = Math.min(width, height);

	let radius = (boxSize - strokeWidth) / 2;
	let startX = boxSize / 2;
	let startY = strokeWidth / 2;
	let finishX = boxSize - strokeWidth / 2;
	let finishY = boxSize / 2;

	return (
		<div ref={ref} className={`overflow-hidden animate-spin w-${size} h-${size}`}>
			<svg className={`spinner ${color}`} viewBox={`0 0 ${boxSize} ${boxSize}`} style={{ width, height }}>
				<circle
					cx="50%"
					cy="50%"
					r={radius}
					fill="transparent"
					className="opacity-25"
					stroke="currentColor"
					strokeWidth={strokeWidth}
				/>
				<path
					d={`M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${finishX} ${finishY}`}
					fill="transparent"
					stroke="currentColor"
					strokeWidth={strokeWidth}
				/>
			</svg>
		</div>
	);
}
