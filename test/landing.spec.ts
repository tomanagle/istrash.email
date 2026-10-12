import { SELF } from "cloudflare:test";
import { describe, it, expect } from "vitest";
import trashDomains from "../src/domains.json";

describe("landing page domain count", () => {
	it.each(["/", "/index.html"])("shows the bundled domain count at %s", async (path) => {
		const response = await SELF.fetch(`https://istrash.email${path}`);
		expect(response.status).toBe(200);
		const body = await response.text();
		const displayedCount = body.match(/id="blocked-domain-count">([^<]+)<\/strong>/)?.[1];
		expect(displayedCount).toBe(Object.keys(trashDomains).length.toLocaleString("en-US"));
		expect(body).toContain("disposable domains blocked");
		expect(body).not.toContain("{{BLOCKED_DOMAIN_COUNT}}");
	});
});
