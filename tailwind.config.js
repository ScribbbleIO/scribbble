const defaultTheme = require('tailwindcss/defaultTheme');

const darkModePlugin = require('tailwindcss-dark-mode');
const lineClampPlugin = require('@tailwindcss/line-clamp');
const gridTemplatePlugin = require('tailwindcss-grid-template');
const tailwindFormsPlugin = require('@tailwindcss/forms');
const gridPlacementPlugin = require('tailwindcss-grid-placement');

const colors = require('tailwindcss/colors');

module.exports = {
	theme: {
		colors,
		extend: {
			backgroundColor: {
				...defaultTheme.backgroundColor,
				dark: '#18191a',
			},
			boxShadow: {
				...defaultTheme.boxShadow,
				'avatar': 'inset 0 0 0 2px rgba(0, 0, 0, 0.05);',
				'avatar-dark': 'inset 0 0 0 2px rgb(255, 255, 255, 0.1);',
			},
			opacity: {
				7.5: '0.075',
				10: '0.1',
			},
			gridTemplate: {
				'2fr': '2fr',
			},
			maxHeight: {
				'50vmin': '50vmin',
			},
			maxWidth: {
				'50vmin': '50vmin',
			},
		},
		gridTemplate: {
			'fr': '1fr',
			'2fr': '2fr',
			'auto': 'auto',
			'full': '100%',
			'min': 'min-content',
			'max': 'max-content',
		},
	},
	variants: {
		extend: {
			visibility: ['group-hover'],
			textColor: ['dark-hover'],
			cursor: ['disabled'],
			backgroundColor: ['disabled'],
			translate: ['dark'],
			borderColor: ['disabled'],
		},
	},
	purge: {
		mode: 'all',
		content: ['./source/**/*.html', './source/**/*.js', './source/**/*.jsx'],
		options: {
			safelist: [/token/, /line-numbers/],
		},
	},
	plugins: [tailwindFormsPlugin, gridTemplatePlugin, gridPlacementPlugin, lineClampPlugin, darkModePlugin()],
};
