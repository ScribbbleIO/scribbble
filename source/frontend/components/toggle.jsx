import React, { useState, useLayoutEffect } from 'react';

export default function Toggle() {
	let [isDarkMode, setIsDarkMode] = useState();

	useLayoutEffect(() => {
		let darkMode = window.localStorage.getItem('dark-mode');
		if (darkMode == undefined) {
			darkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
		} else {
			darkMode = JSON.parse(darkMode);
		}

		setIsDarkMode(darkMode);
	}, []);

	function handleKeyDown(event) {
		if (event.key === ' ') {
			event.preventDefault();
			handleToggleClick();
		}
	}

	function handleToggleClick() {
		let darkMode = !isDarkMode;
		if (darkMode) {
			document.documentElement.classList.add('mode-dark');
		} else {
			document.documentElement.classList.remove('mode-dark');
		}

		// Update localstorage theme
		window.localStorage.setItem('dark-mode', darkMode);
		setIsDarkMode(darkMode);
	}

	return (
		<button
			hidden={isDarkMode == undefined}
			id="toggle"
			role="checkbox"
			tabIndex="0"
			onKeyDown={handleKeyDown}
			aria-checked={isDarkMode}
			aria-label="Toggle dark mode"
			className="relative inline-flex flex-shrink-0 h-6 transition-colors duration-200 ease-in-out bg-gray-200 border-2 border-transparent rounded-full cursor-pointer w-11 focus:outline-none dark:border-blue-600 focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50 dark:bg-blue-600"
			onClick={handleToggleClick}
		>
			<span className="sr-only">Use dark theme</span>
			<span
				aria-hidden="true"
				className="relative inline-block w-5 h-5 transition duration-200 ease-in-out transform translate-x-0 bg-white rounded-full shadow dark:translate-x-5"
			></span>
		</button>
	);
}
