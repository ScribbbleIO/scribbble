const production = process.env.NODE_ENV === 'production';
const development = process.env.NODE_ENV === 'development' || process.env.NODE_ENV == undefined;

let mount;
if (production) {
	mount = {
		'source/frontend': '/',
	};
} else if (development) {
	mount = {
		'content': { url: '/', static: true, resolve: false },
		'source/frontend': '/',
	};
}

module.exports = {
	mount,
	proxy: {
		'/api': 'http://localhost:4000/api',
		'/login': {
			target: 'http://localhost:4000',
		},
		'/export': {
			target: 'http://localhost:4000',
		},
	},
	plugins: [
		['@snowpack/plugin-build-script', { cmd: 'postcss', input: ['.css'], output: ['.css'] }],
		// ['@snowpack/plugin-optimize', {}], // can not enable this as in combination with the webpack plugin errors __SNOWPACK__ENV
		// ['@snowpack/plugin-webpack', {}],
	],
	devOptions: {
		out: 'build/frontend',
		fallback: 'index.html',
		hmrErrorOverlay: false,
	},
	buildOptions: {
		clean: true,
		metaDir: '__meta__',
		webModulesUrl: '__modules__',
	},
};
