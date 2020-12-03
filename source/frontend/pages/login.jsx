import React from 'react';
import Footer from '../components/footer/footer.jsx';
import Scribbble from '../components/logo/scribbble.jsx';

export default function Login() {
	return (
		<div>
			<section
				className="relative grid min-h-screen font-sans bg-white items-x-center"
				style={{ gridTemplate: '2fr auto 3fr / 100%' }}
			>
				<div className="p-8" style={{ gridRow: 2 }}>
					<div className="flex flex-col items-stretch w-full max-w-sm">
						<div className="mx-auto text-6xl text-gray-700">
							<Scribbble />
						</div>
						<p className="mt-4 text-center text-gray-400">
							We will send you a mail with a login link to get you started. No prior registration is
							needed to log in.
						</p>
						<form className="flex flex-col items-stretch mt-6" action="/login" method="post">
							<input name="type" type="hidden" value="email" />
							<input
								name="email"
								type="email"
								required={true}
								autoFocus={true}
								className="p-4 border border-gray-300 rounded-md focus:ring focus:border-blue-300 focus:ring-blue-300 focus:ring-opacity-50"
								placeholder="hello@example.com"
							/>
							<button className="p-4 mt-4 font-semibold tracking-wide text-white bg-blue-500 rounded-md focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-50">
								Log in
							</button>
						</form>
					</div>
				</div>
			</section>
			<Footer />
		</div>
	);
}
