import Path from 'path';
import React from 'react';
import ReactDom from 'react-dom/server.js';
import Filesystem from 'fs-extra';

import Home from '../source/backend/frontend/pages/home.mjs';
import Login from '../source/backend/frontend/pages/login.mjs';
import NotFound from '../source/backend/frontend/pages/not-found.mjs';

let targetPath = Path.resolve('static');
let templatesPath = Path.resolve('source', 'backend', 'static');

let locations = [
	{ url: '/', template: 'index.html', element: Home },
	{ url: 'login', template: 'login.html', element: Login },
	{ url: '404', template: '404.html', element: NotFound },
];

for (let location of locations) {
	let fileName = location.template;

	let locationPath = Path.join(targetPath, fileName);
	let locationContent = ReactDom.renderToStaticMarkup(React.createElement(location.element));

	let templateFilePath = Path.join(templatesPath, fileName);
	let templateFile = await Filesystem.readFile(templateFilePath, 'utf-8');

	let document = templateFile;
	if (locationContent.length !== 0) {
		document = document.replace('<!-- content -->', locationContent);
	}

	await Filesystem.ensureFile(locationPath);
	await Filesystem.writeFile(locationPath, document, { flag: 'w' });
}
