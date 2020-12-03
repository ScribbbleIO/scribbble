// We need the backend to generate the profile + article pages which we derive from the frontend code
// The frontend uses jsx which we can not import from node, so we transpile the necessary files from the frontend
// and save them under backend

import Path from 'path';
import Babel from '@babel/core';
import Filesystem from 'fs-extra';

const files = [
	'pages/profile.jsx',
	'pages/article.jsx',
	'pages/home.jsx',
	'pages/login.jsx',
	'pages/email.jsx',
	'pages/error.jsx',
	'pages/not-found.jsx',
	'components/header.jsx',
	'components/logo/scribbble.jsx',
	'components/toggle.jsx',
	'components/footer/footer.jsx',
	'components/footer/footer-small.jsx',
	'icons/rss.jsx',
	'icons/star.jsx',
	'icons/chevron-up.jsx',
	'icons/chevron-down.jsx',
	'utils/rest.js',
	'utils/sort.js',
	'utils/date/parse.js',
	'errors/http.js',
];
const sourceDirectory = Path.resolve('source', 'frontend');
const targetDirectory = Path.resolve('source', 'backend', 'frontend');

for (let file of files) {
	let filePath = Path.resolve(sourceDirectory, file);
	let targetPath = Path.resolve(targetDirectory, file);

	let fileExtension = Path.extname(targetPath);
	if (fileExtension === '.js') {
		targetPath = Path.join(Path.dirname(targetPath), Path.basename(targetPath, '.js')) + '.mjs';
	}
	if (fileExtension === '.jsx') {
		targetPath = Path.join(Path.dirname(targetPath), Path.basename(targetPath, '.jsx')) + '.mjs';
	}

	// We need to set modules to false to keep them as ES modules as we use import.meta somewhere
	// and import.meta can not be used in commonJS files
	let result = await Babel.transformFileAsync(filePath, {
		presets: [['@babel/preset-env', { modules: false }], '@babel/preset-react'],
		plugins: [babelPluginTransformImportJsxExtension],
	});

	// console.log(targetPath);
	await Filesystem.outputFile(targetPath, result.code, {});
}

function babelPluginTransformImportJsxExtension({ types }) {
	function traverseExpression(type, arg) {
		if (type.isStringLiteral(arg)) {
			return arg;
		}

		if (type.isBinaryExpression(arg)) {
			return traverseExpression(type, arg.left);
		}

		return null;
	}

	const visitor = {
		CallExpression(path) {
			if (path.node.callee.name === 'require' || path.node.callee.type === 'Import') {
				const args = path.node.arguments;
				if (!args.length) {
					return;
				}

				const firstArg = traverseExpression(types, args[0]);
				if (firstArg) {
					firstArg.value = firstArg.value.replace(/\.js$/, '.mjs');
					firstArg.value = firstArg.value.replace(/\.jsx$/, '.mjs');
				}
			}
		},
		ImportDeclaration(path) {
			path.node.source.value = path.node.source.value.replace(/\.js$/, '.mjs');
			path.node.source.value = path.node.source.value.replace(/\.jsx$/, '.mjs');
		},
		ExportNamedDeclaration(path) {
			if (path.node.source) {
				path.node.source.value = path.node.source.value.replace(/\.js$/, '.mjs');
				path.node.source.value = path.node.source.value.replace(/\.jsx$/, '.mjs');
			}
		},
		ExportAllDeclaration(path) {
			if (path.node.source) {
				path.node.source.value = path.node.source.value.replace(/\.js$/, '.mjs');
				path.node.source.value = path.node.source.value.replace(/\.jsx$/, '.mjs');
			}
		},
	};
	return {
		visitor: {
			Program(path) {
				path.traverse(visitor);
			},
		},
	};
}
