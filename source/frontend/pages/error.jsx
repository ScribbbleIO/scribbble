import React, { useLayoutEffect } from 'react';
import Scribbble from '../components/logo/scribbble.jsx';

export default function Error(props) {
	let { title = 'Oops!', description = 'Something went wrong' } = props;

	useLayoutEffect(() => {
		document.body.classList.add('dark:bg-dark');

		return () => {
			document.body.classList.remove('dark:bg-dark');
		};
	}, []);

	let letters = 'abcdefghijklmnopqrstuvwxyz';
	let characters = '!@#$%^&*()-_+=|[];:`~.,<>?/\\';
	let tokens = letters + characters;

	let fontSizes = [
		'text-3xl',
		'text-3xl',
		'text-4xl',
		'text-4xl',
		'text-5xl',
		'text-5xl',
		'text-5xl',
		'text-5xl',
		'text-6xl',
		'text-6xl',
		'text-6xl',
		'text-7xl',
	];

	let renderCharacters = [];
	for (let i = 0; i < 40; i++) {
		let index = Math.floor(Math.random() * tokens.length);
		let sizeIndex = Math.floor(Math.random() * fontSizes.length);
		let style = { top: Math.random() * 100 + '%', left: Math.random() * 100 + '%' };

		let char = tokens.substr(index, 1);
		if (Math.random() < 0.5) {
			char = char.toUpperCase();
		}

		renderCharacters.push(
			<span
				className={
					'absolute text-black dark:text-white transform -translate-x-1/2 -translate-y-1/2 opacity-7.5 dark:opacity-10 ' +
					fontSizes[sizeIndex]
				}
				key={i}
				style={style}
			>
				{char}
			</span>,
		);
	}

	return (
		<div className="relative grid h-full overflow-hidden font-serif select-none items-x-center items-y-center dark:bg-dark">
			<a href="/" className="absolute top-0 left-0 m-6 text-xl text-gray-700 dark:text-gray-200">
				<Scribbble />
			</a>
			<div className="z-10 flex flex-col items-center select-text">
				<p className="text-6xl font-semibold leading-none text-blue-500 sm:text-8xl">{title}</p>
				<p className="pt-4 text-2xl font-semibold text-gray-700 sm:text-3xl dark:text-gray-200">
					{description}
				</p>
			</div>
			{renderCharacters}
		</div>
	);
}
