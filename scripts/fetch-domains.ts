const DOMAINS_URL =
  "https://rawcdn.githack.com/disposable/disposable-email-domains/master/domains.json";

const response = await fetch(DOMAINS_URL);
if (!response.ok) {
  console.error(`Failed to fetch domains: ${response.status} ${response.statusText}`);
  process.exit(1);
}

const domains: string[] = await response.json();
const outPath = new URL("../src/domains.json", import.meta.url);
await Bun.write(Bun.file(outPath), JSON.stringify(domains));
console.log(`Fetched ${domains.length} disposable domains`);
