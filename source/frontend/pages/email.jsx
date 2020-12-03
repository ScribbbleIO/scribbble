import React from 'react';

import Footer from '../components/footer/footer.jsx';
import Scribbble from '../components/logo/scribbble.jsx';

export default function Email(props) {
	let { to } = props;

	return (
		<div>
			<section
				className="relative grid min-h-screen font-sans bg-white items-x-center"
				style={{ gridTemplate: '2fr auto 3fr / 100%' }}
			>
				<div className="p-8" style={{ gridRow: 2 }}>
					<div className="flex flex-col items-center w-full max-w-sm">
						<h1 className="mx-auto text-6xl text-gray-700">
							<Scribbble />
						</h1>

						<p className="inline-flex items-baseline mt-4 text-gray-400">
							<span className="text-center">A mail with a login link is sent to {to}</span>
						</p>
					</div>
				</div>
			</section>
			<Footer />
		</div>
	);
}
