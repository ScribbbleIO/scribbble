import Path from 'path';
import Sqlite3 from 'sqlite3';
import Filesystem from 'fs-extra';

import * as Sqlite from 'sqlite';

const production = process.env.NODE_ENV === 'production';
const development = process.env.NODE_ENV === 'development' || process.env.NODE_ENV == undefined;

let databasePath;
let fixturesPath = Path.resolve('source', 'backend', 'fixtures');
let migrationsPath = Path.resolve('source', 'backend', 'migrations');
let productionDatabasePath = Path.resolve('database', 'production.sqlite');
let developmentDatabasePath = Path.resolve('database', 'development.sqlite');

await Filesystem.ensureFile(productionDatabasePath);
await Filesystem.ensureFile(developmentDatabasePath);
await Filesystem.copyFile(productionDatabasePath, developmentDatabasePath);

if (production) {
	databasePath = productionDatabasePath;
} else if (development) {
	databasePath = developmentDatabasePath;
}

let db = await Sqlite.open({ filename: databasePath, driver: Sqlite3.Database });
await db.run('PRAGMA foreign_keys = ON');
await db.run('CREATE TABLE IF NOT EXISTS migrations ("filename" TEXT PRIMARY KEY UNIQUE NOT NULL)');

let entries = await Filesystem.readdir(migrationsPath, { withFileTypes: true });
if (entries.length > 0) {
	console.log('🦩 Start migration'); // eslint-disable-line no-console
	for (let entry of entries) {
		let migration = await db.get('SELECT * FROM migrations WHERE "filename" = ?', entry.name);
		if (migration) {
			console.log(`     \x1b[2m${entry.name}\x1b[0m`); // eslint-disable-line no-console
		} else {
			console.log(`     ${entry.name}`); // eslint-disable-line no-console
			let filename = Path.join(migrationsPath, entry.name);
			let extension = Path.extname(entry.name);
			if (extension === '.sql') {
				let sql = await Filesystem.readFile(filename, 'utf-8');
				await db.exec(sql);
			} else if (extension === '.js' || extension === '.mjs') {
				let module = await import(filename);
				let migration = module.default;
				await migration(db);
			}
			await db.run('INSERT INTO migrations ("filename") VALUES (?)', entry.name);
		}
	}
}

let args = process.argv.slice(2);

for (let arg of args) {
	let fixtureName = arg.match(/^fixtures?=([a-zA-Z0-9.]+)$/)?.[1];
	let fixtureNames = fixtureName.split(',');
	for (let fixtureName of fixtureNames) {
		let filename = Path.join(fixturesPath, fixtureName);
		try {
			let sql = await Filesystem.readFile(filename, 'utf-8');
			console.log(`🧪 Running fixture ${fixtureName}`); // eslint-disable-line no-console
			await db.exec(sql);
		} catch (error) {
			console.log(`🧨 Could not find fixture ${fixtureName}`); // eslint-disable-line no-console
		}
	}
}

export default db;
