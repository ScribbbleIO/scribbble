import React from 'react';

export default function FooterSmall() {
	return (
		<div className="w-full font-sans dark:bg-dark">
			<div className="max-w-xs mx-auto">
				<p className="pt-4 pb-12 text-xs leading-6 text-center text-gray-300 border-t border-gray-100 dark:text-gray-700 dark:border-gray-800">
					&copy;{' '}
					<a href="/" className="hover:underline">
						scribbble.io
					</a>
				</p>
			</div>
		</div>
	);
}
