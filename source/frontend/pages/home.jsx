import React from 'react';
import Footer from '../components/footer/footer.jsx';
import Scribbble from '../components/logo/scribbble.jsx';
import ChevronUp from '../icons/chevron-up.jsx';
import ChevronDown from '../icons/chevron-down.jsx';

export default function Home() {
	// Removed h-full overflow-y-auto, and scrollBehavior:smooth of outer div
	// Chrome 87 is bugging and showing 2 scrollbars when added

	return (
		<div className="w-full">
			<section
				id="home"
				className="grid min-h-screen grid-cols-1 grid-rows-2 bg-white row-2-auto col-1-full items-x-center items-y-center"
			>
				<div className="flex flex-col items-center">
					<h1 className="text-5xl text-gray-700 md:text-6xl xl:text-8xl">
						<Scribbble />
					</h1>
					<h2 className="w-full max-w-lg mt-4 font-serif text-lg font-medium text-center text-gray-400 xl:mt-6">
						Write down your idea. Tell your story.
						<br />
						Share your knowledge.
					</h2>
					<a
						href="login"
						className="px-16 py-4 mt-16 font-sans font-semibold tracking-wide text-center text-white bg-blue-500 rounded-md xl:mt-24 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-50"
					>
						Start writing
					</a>
				</div>
				<a
					href="#writing"
					className="w-8 h-8 mx-8 mt-0 mb-24 text-gray-300 cursor-pointer sm:mb-8 animate-bounce"
				>
					<span className="sr-only">Next</span>
					<ChevronDown />
				</a>
			</section>
			<section
				id="writing"
				className="grid min-h-screen grid-cols-1 grid-rows-2 border-t border-b border-gray-200 bg-gray-50 row-2-auto col-1-full items-x-center items-y-center"
			>
				<div className="grid grid-cols-1 gap-8 p-8 xl:p-16 items-y-center items-x-center col-1-full xl:grid-flow-col xl:grid-cols-none xl:grid-rows-1 xl:row-1-full">
					<div className="max-w-sm m-8 text-center">
						<h3 className="font-serif text-2xl font-medium text-gray-700">Writing</h3>
						<p className="font-sans text-gray-400">
							Scribbble is intended as a simple writing tool. It gets out of your way, and lets you focus
							on writing. Use markdown for markup, images, and codeblocks. Keep an eye on the preview with
							live updates.
						</p>
					</div>
					<div>
						<img
							className="border-gray-200 shadow-md sm:max-w-md md:shadow-xl md:border md:rounded xl:max-w-50vmin xl:max-h-50vmin"
							src="../banner-1.png"
							alt="Writing"
						/>
					</div>
				</div>
				<a href="#reading" className="w-8 h-8 m-8 mt-0 text-gray-300 cursor-pointer">
					<span className="sr-only">Next</span>
					<ChevronDown />
				</a>
			</section>
			<section
				id="reading"
				className="grid min-h-screen grid-cols-1 grid-rows-2 bg-white row-2-auto col-1-full items-x-center items-y-center"
			>
				<div className="grid grid-cols-1 gap-8 p-8 xl:p-16 items-y-center items-x-center col-1-full xl:grid-flow-col xl:grid-cols-none xl:grid-rows-1 xl:row-1-full">
					<div className="max-w-sm m-8 text-center xl:col-start-2">
						<h3 className="font-serif text-2xl font-medium text-gray-700">Reading</h3>
						<p className="font-sans text-gray-400">
							Share the links of your posts with other people for them to enjoy. All your content is also
							available in dark mode, and statically generated web pages make it super fast.
						</p>
					</div>
					<div className="relative">
						<img
							className="border-gray-200 shadow-md sm:max-w-md md:shadow-xl md:border md:rounded xl:max-w-50vmin xl:max-h-50vmin"
							style={{ transform: 'translate(-15%, -15%) scale(0.7) ' }}
							src="../banner-2.png"
							alt="Reading light theme"
						/>
						<img
							className="absolute inset-0 border-gray-200 shadow-md sm:max-w-md md:shadow-xl md:border md:rounded xl:max-w-50vmin xl:max-h-50vmin"
							style={{ transform: 'translate(15%, 15%) scale(0.7) ' }}
							src="../banner-3.png"
							alt="Reading dark theme"
						/>
					</div>
				</div>
				<a href="#profile" className="w-8 h-8 m-8 mt-0 text-gray-300 cursor-pointer">
					<span className="sr-only">Next</span>
					<ChevronDown />
				</a>
			</section>
			<section
				id="profile"
				className="grid min-h-screen grid-cols-1 grid-rows-2 border-t border-b border-gray-200 bg-gray-50 row-2-auto col-1-full items-x-center items-y-center"
			>
				<div className="grid grid-cols-1 gap-8 p-8 xl:p-16 items-y-center items-x-center col-1-full xl:grid-flow-col xl:grid-cols-none xl:grid-rows-1 xl:row-1-full">
					<div className="max-w-sm m-8 text-center">
						<h3 className="font-serif text-2xl font-medium text-gray-700">Profile</h3>
						<p className="font-sans text-gray-400">
							Share the link of your profile so others can read all your stories. A profile feed is
							available for everyone who likes reading every new story you write.
						</p>
					</div>
					<div>
						<img
							className="border-gray-200 shadow-md sm:max-w-md md:shadow-xl md:border md:rounded xl:max-w-50vmin xl:max-h-50vmin"
							src="../banner-4.png"
							alt="Profile"
						/>
					</div>
				</div>
				<a href="#dashboard" className="w-8 h-8 m-8 mt-0 text-gray-300 cursor-pointer">
					<span className="sr-only">Next</span>
					<ChevronDown />
				</a>
			</section>
			<section
				id="dashboard"
				className="grid min-h-screen grid-cols-1 grid-rows-2 bg-white row-2-auto col-1-full items-x-center items-y-center"
			>
				<div className="grid grid-cols-1 gap-8 p-8 xl:p-16 items-y-center items-x-center col-1-full xl:grid-flow-col xl:grid-cols-none xl:grid-rows-1 xl:row-1-full">
					<div className="max-w-sm m-8 text-center xl:col-start-2">
						<h3 className="font-serif text-2xl font-medium text-gray-700">Dashboard</h3>
						<p className="font-sans text-gray-400">
							Publish or unpublish your posts. Add a personal touch with a custom profile picture. And if
							you ever decide to leave Scribbble behind, you can export all your data and take everything
							with you.
						</p>
					</div>
					<div>
						<img
							className="border-gray-200 shadow-md sm:max-w-md md:shadow-xl md:border md:rounded xl:max-w-50vmin xl:max-h-50vmin"
							src="../banner-5.png"
							alt="Dashboard"
						/>
					</div>
				</div>
				<a href="#home" className="w-8 h-8 m-8 mt-0 text-gray-300 cursor-pointer">
					<span className="sr-only">Go to top</span>
					<ChevronUp />
				</a>
			</section>

			<Footer />
		</div>
	);
}
