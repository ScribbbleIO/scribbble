import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import StaticContext from './contexts/is-static';
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

ReactDOM.unstable_createRoot(document.getElementById('root')).render(
	<Suspense fallback={null}>
		<StaticContext.Provider value={false}>{render}</StaticContext.Provider>
	</Suspense>,
);

// ReactDOM.render(
// 	<Suspense fallback={null}>
// 		<StaticContext.Provider value={false}>{render}</StaticContext.Provider>
// 	</Suspense>,
// 	document.getElementById('root'),
// );
