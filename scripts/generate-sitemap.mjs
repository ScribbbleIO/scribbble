import Path from 'path';
import Sqlite3 from 'sqlite3';
import Filesystem from 'fs-extra';
import * as Sqlite from 'sqlite';

const scribbble = 'https://scribbble.io';
const production = process.env.NODE_ENV === 'production';
const targetFilePath = Path.resolve('content', 'sitemap.xml');
const databaseFileName = production ? 'production.sqlite' : 'development.sqlite';
const databaseFilePath = Path.resolve('database', databaseFileName);

console.log(`🚧 Generating sitemap from database ${databaseFilePath}`); // eslint-disable-line no-console

let db = await Sqlite.open({ filename: databaseFilePath, driver: Sqlite3.Database });
let locations = [];

let articles = await db.all(
	'SELECT slug, username, MAX(users.updatedAt, articles.updatedAt) AS updatedAt FROM articles JOIN users ON articles.userId = users.id WHERE published = 1',
);

for (let { slug, username, updatedAt } of articles) {
	let url = `${scribbble}/${username}/${slug}/`;
	let frequency = 'monthly';

	locations.push({ url, frequency, updatedAt });
}

// Create the sitemap for the profiles
let profiles = await db.all(
	'SELECT username, MAX(MAX(users.updatedAt, articles.updatedAt)) AS updatedAt FROM users JOIN articles ON articles.userId = users.id GROUP BY users.id HAVING SUM(published) > 0',
);

for (let { username, updatedAt } of profiles) {
	let url = `${scribbble}/${username}/`;
	let frequency = 'daily';

	locations.push({ url, frequency, updatedAt });
}

let xml = locationsToSitemap(locations);

await Filesystem.writeFile(targetFilePath, xml);

function locationsToSitemap(locations) {
	let xml = '<?xml version="1.0" encoding="UTF-8"?>\n\n';

	xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
	xml += '\txmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n';
	xml += '\txsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9\n';
	xml += '\thttp://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n\n';

	for (let location of locations) {
		xml += '\t<url>\n';
		xml += `\t\t<loc>${location.url}</loc>\n`;

		if (location.updatedAt) {
			xml += `\t\t<lastmod>${new Date(location.updatedAt).toISOString()}</lastmod>\n`;
		}

		if (location.frequency) {
			xml += `\t\t<changefreq>${location.frequency}</changefreq>\n`;
		}

		if (location.priority) {
			xml += `\t\t<priority>${location.priority}</priority>\n`;
		}

		xml += '\t</url>\n';
	}

	xml += '</urlset>';

	return xml;
}
