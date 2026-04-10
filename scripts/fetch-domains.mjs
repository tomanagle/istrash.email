import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";

const DOMAINS_URL =
	"https://rawcdn.githack.com/disposable/disposable-email-domains/master/domains.json";

const response = await fetch(DOMAINS_URL);
if (!response.ok) {
	console.error(`Failed to fetch domains: ${response.status} ${response.statusText}`);
	process.exit(1);
}

const domains = await response.json();
const outPath = resolve(dirname(fileURLToPath(import.meta.url)), "../src/domains.json");
writeFileSync(outPath, JSON.stringify(domains));
console.log(`Fetched ${domains.length} disposable domains`);
