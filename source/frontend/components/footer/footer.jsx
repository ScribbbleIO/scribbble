import React from 'react';

export default function Footer() {
	return (
		<footer className="bg-coolGray-800">
			<div className="max-w-screen-xl px-4 py-12 mx-auto overflow-hidden sm:px-6 lg:px-8">
				<nav className="flex flex-wrap justify-center -mx-5 -my-2">
					<div className="px-5 py-2">
						<a
							target="_blank"
							rel="noreferrer"
							href="/scribbble/"
							className="text-base leading-6 text-gray-400 focus:outline-none focus:text-gray-50 hover:text-gray-200"
						>
							Blog
						</a>
					</div>
					<div className="px-5 py-2">
						<a
							href="mailto:contact@scribbble.io"
							className="text-base leading-6 text-gray-400 focus:outline-none focus:text-gray-50 hover:text-gray-200"
						>
							Contact us
						</a>
					</div>
				</nav>

				<div className="flex justify-center mt-8 space-x-6">
					<a
						href="https://twitter.com/ScribbbleIO"
						target="_blank"
						rel="noreferrer"
						className="text-gray-400 hover:text-gray-200 focus:outline-none focus:text-gray-50"
					>
						<span className="sr-only">Twitter </span>
						<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
							<path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
						</svg>
					</a>
				</div>

				{/* Enable margin when socials/links are enabled */}
				<div className="mt-8">
					<p className="text-base leading-6 text-center text-gray-600">
						&copy;{' '}
						<a href="/" className="hover:underline">
							scribbble.io
						</a>
					</p>
				</div>
			</div>
		</footer>
	);
}
