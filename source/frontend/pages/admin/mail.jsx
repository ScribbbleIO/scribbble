import React, { useState } from 'react';

import Header from '../../components/admin/header';
import Button from '../../components/button';
import Spinner from '../../components/spinner';
import useLoadingState from '../../hooks/use-loading-state';

const initialMail = { from: 'contact', to: '', subject: '', content: '' };

export default function Mail(props) {
	let { user } = props;
	let [mail, setMail] = useState(initialMail);

	let [fetchMail, fetchingMail, pendingMail] = useLoadingState(fetch);

	function handleFromChange(event) {
		setMail({ ...mail, from: event.target.value });
	}

	function handleToChange(event) {
		setMail({ ...mail, to: event.target.value });
	}

	function handleSubjectChange(event) {
		setMail({ ...mail, subject: event.target.value });
	}

	function handleContentChange(event) {
		setMail({ ...mail, content: event.target.value });
	}

	async function handleSendMail(event) {
		event.preventDefault();

		if (fetchingMail) return;

		let fetchResult = await fetchMail('/api/admin/mail', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(mail),
		});

		if (fetchResult.ok) {
			setMail(initialMail);
		}
	}

	let renderSubmitButtonChildren = 'Send';
	if (pendingMail) {
		renderSubmitButtonChildren = (
			<span className="flex justify-center">
				<Spinner size={4} color="text-white" />
			</span>
		);
	}

	return (
		<div className="h-full px-6 overflow-auto font-sans bg-gray-50">
			<div className="max-w-4xl pt-6 mx-auto text-gray-700">
				<Header user={user} />

				<form className="grid gap-4 py-6" onSubmit={handleSendMail}>
					<div className="grid gap-4 sm:gap-8 sm:grid-cols-2">
						<div>
							<label htmlFor="from" className="block text-sm font-medium text-gray-700">
								From
							</label>
							<div className="relative flex items-center mt-1 rounded-md ">
								<input
									id="from"
									type="text"
									className="z-10 block w-full px-3 py-2 border border-gray-300 rounded-none focus:ring focus:border-blue-300 focus:ring-blue-300 focus:ring-opacity-50 rounded-l-md sm:text-sm sm:leading-5"
									placeholder="contact"
									required={true}
									value={mail.from}
									onChange={handleFromChange}
								></input>
								<span className="inline-flex items-center self-stretch px-3 text-gray-500 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 sm:text-sm">
									@scribbble.io
								</span>
							</div>
						</div>
						<div>
							<label htmlFor="to" className="block text-sm font-medium text-gray-700">
								To
							</label>
							<div className="mt-1">
								<input
									id="to"
									type="email"
									required={true}
									className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring focus:border-blue-300 focus:ring-blue-300 focus:ring-opacity-50 sm:text-sm"
									placeholder="mail@example.com"
									value={mail.to}
									onChange={handleToChange}
								></input>
							</div>
						</div>
					</div>
					<div>
						<label htmlFor="subject" className="block text-sm font-medium text-gray-700">
							Subject
						</label>
						<div className="mt-1">
							<input
								id="subject"
								type="text"
								required={true}
								className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring focus:border-blue-300 focus:ring-blue-300 focus:ring-opacity-50 sm:text-sm"
								value={mail.subject}
								onChange={handleSubjectChange}
							></input>
						</div>
					</div>
					<div>
						<label htmlFor="content" className="block text-sm font-medium text-gray-700">
							Content
						</label>
						<div className="mt-1">
							<textarea
								id="content"
								name="content"
								rows="12"
								required={true}
								value={mail.content}
								onChange={handleContentChange}
								className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring focus:border-blue-300 focus:ring-blue-300 focus:ring-opacity-50 sm:text-sm"
							></textarea>
						</div>
					</div>
					<div className="self-x-end">
						<Button type="submit">{renderSubmitButtonChildren}</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
