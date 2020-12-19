import React from 'react';

export default function Scribbble() {
	return (
		<span
			className="relative inline-flex items-baseline font-serif select-none"
			aria-label="scribbble"
			style={{ lineHeight: 0.85 }}
		>
			<svg
				className="relative flex-none text-blue-500"
				viewBox="0 0 8.364 13.476"
				style={{ width: '0.8em', top: '0.15em' }}
			>
				<path
					fill="currentColor"
					d="M2.586 13.431q-1.107-.18-1.938-.804-.828-.634-.598-2.05.036-.223.193-.56.17-.348.38-.587.21-.25.399-.22.022.005.092.13.071.125.123.292.226.707.445 1.038.232.322.531.44.3.116.942.22.653.106 1.438-.039.786-.156 1.35-.474.573-.316.63-.67.057-.343-.223-.65t-.75-.565q-.469-.258-1.293-.642Q3.04 7.7 2.243 7.216q-.796-.48-1.312-1.224-.504-.74-.341-1.738.244-1.505 1.136-2.52Q2.63.712 3.845.296 5.062-.13 6.225.057q.73.12 1.249.566.52.437.736 1.063.227.628.12 1.292-.137.842-.384 1.381-.236.541-.69.468-.31-.05-.357-.32-.034-.278.049-.787.118-.73-.243-1.097-.35-.363-1.125-.49-.553-.089-1.38.174-.816.265-1.459.797-.641.521-.746 1.163-.068.42.217.763.299.332.78.592.481.25 1.362.63 1.264.547 2.031 1 .78.446 1.272 1.196.491.75.319 1.813-.214 1.318-1.21 2.065-.997.747-2.196.995-1.198.237-1.984.11z"
				/>
			</svg>
			<span>cr</span>
			<span className="grid col-start-1 row-start-1 items-y-start items-x-center">
				<span className="col-start-1 row-start-1">i</span>
				<svg
					className="relative col-start-1 row-start-1 text-blue-500 bg-transparent"
					style={{ width: '0.2em', paddingBottom: '0.07em' }}
					viewBox="0 0 1.954 1.799"
				>
					<path
						fill="currentColor"
						d="M1.516 1.483c-.55.417-.978.421-1.288.013A1.127 1.127 0 010 .87C-.011.635.115.42.378.22.51.12.67.052.86.02c.193-.03.373-.025.54.014.172.043.294.113.368.21a.87.87 0 01.184.597c-.014.218-.16.432-.436.643z"
					/>
				</svg>
			</span>
			<span>bbble</span>
		</span>
	);
}
