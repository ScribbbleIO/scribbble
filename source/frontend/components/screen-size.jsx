import React from 'react';
import { useState, useEffect, useMemo } from 'react';

import ScreenSizeContext from '../contexts/screen-size';

export default function ScreenSize(props) {
	let { sizes = [640, 768, 1024, 1280], names = ['sm', 'md', 'lg', 'xl'], children } = props;
	let mediaQueries = useMemo(
		function () {
			return sizes.map((size) => window.matchMedia(`(min-width: ${size}px)`));
		},
		[...sizes],
	);
	let [screen, setScreen] = useState(function () {
		for (let index = sizes.length - 1; index >= 0; --index) {
			if (mediaQueries[index].matches) return { size: names[index], index: index };
		}
		return { size: undefined, index: -1 };
	});
	useEffect(() => {
		function mediaQueryChanged() {
			for (let index = sizes.length - 1; index >= 0; --index) {
				if (mediaQueries[index].matches) {
					setScreen({
						size: names[index],
						index: index,
					});
					return;
				}
			}
			setScreen({ size: undefined, index: -1 });
		}
		for (let mediaQuery of mediaQueries) {
			mediaQuery.addListener(mediaQueryChanged);
		}
		return function () {
			for (let mediaQuery of mediaQueries) {
				mediaQuery.removeListener(mediaQueryChanged);
			}
		};
	}, [mediaQueries, ...names]);
	return <ScreenSizeContext.Provider value={screen}>{children}</ScreenSizeContext.Provider>;
}
