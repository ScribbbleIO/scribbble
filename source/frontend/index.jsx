import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
const Admin = React.lazy(() => import('./admin'));
const Application = React.lazy(() => import('./application'));

const regex = /(admin)\.(localhost|scribbble\.io)/;
let hostname = window.location.hostname;
let match = hostname.match(regex);

let render;
if (match) {
	render = <Admin />;
} else {
	render = <Application />;
}

ReactDOM.render(<Suspense fallback={null}>{render}</Suspense>, document.getElementById('root'));
