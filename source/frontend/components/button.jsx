import React, { useRef, useLayoutEffect, useState } from 'react';
import { useScreenSizeIndex } from '../hooks/use-screen-size';

export default function Button(props) {
	let { children, color = Button.colors.blue, ...other } = props;
	let screenSizeIndex = useScreenSizeIndex();

	let ref = useRef();
	let [dimensions, setDimensions] = useState();

	useLayoutEffect(() => {
		setDimensions();
	}, [screenSizeIndex]);

	useLayoutEffect(() => {
		if (dimensions == undefined) {
			setDimensions({
				width: ref.current.clientWidth,
				height: ref.current.clientHeight,
			});
		} else {
			let hasWidthChanged = ref.current.clientWidth > dimensions.width;
			let hasHeightChanged = ref.current.clientHeight > dimensions.height;

			if (hasWidthChanged || hasHeightChanged) {
				setDimensions({
					width: Math.max(ref.current.clientWidth, dimensions.width),
					height: Math.max(ref.current.clientHeight, dimensions.height),
				});
			}
		}
	});

	return (
		<span ref={ref} className="inline-flex w-full rounded-md shadow-sm">
			<button
				type="submit"
				style={{ ...dimensions }}
				className={`w-full px-3 py-2 text-sm font-medium disabled:cursor-not-allowed text-white border rounded-md shadow-sm focus:outline-none ${color}`}
				{...other}
			>
				{children}
			</button>
		</span>
	);
}

Button.colors = {
	blue:
		'bg-blue-500 disabled:bg-blue-300 disabled:border-blue-300 border-blue-500 focus:ring focus:ring-blue-300 focus:ring-opacity-50',
	red:
		'bg-red-500 disabled:bg-red-300 disabled:border-red-300 border-red-500 focus:ring focus:ring-red-300 focus:ring-opacity-50',
};
