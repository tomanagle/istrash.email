import { writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const outPath = resolve(dirname(fileURLToPath(import.meta.url)), '../src/domains.json');

// Skip fetch if domains.json already exists (avoids infinite rebuild loop in dev)
if (existsSync(outPath)) {
	process.exit(0);
}

const DOMAINS_URL = 'https://rawcdn.githack.com/disposable/disposable-email-domains/master/domains.json';

const response = await fetch(DOMAINS_URL);
if (!response.ok) {
	console.error(`Failed to fetch domains: ${response.status} ${response.statusText}`);
	process.exit(1);
}

const domains = await response.json();
const lookup = Object.create(null);
for (const d of domains) lookup[d] = 1;
writeFileSync(outPath, JSON.stringify(lookup));
console.log(`Fetched ${domains.length} disposable domains`);
