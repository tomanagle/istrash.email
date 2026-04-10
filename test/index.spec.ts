import {
	env,
	createExecutionContext,
	waitOnExecutionContext,
	SELF,
} from "cloudflare:test";
import { describe, it, expect } from "vitest";
import worker from "../src/index";

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe("istrash.email worker", () => {
	describe("static frontend", () => {
		it("serves HTML at /", async () => {
			const response = await SELF.fetch("https://istrash.email/");
			expect(response.status).toBe(200);
			expect(response.headers.get("Content-Type")).toContain("text/html");
			const body = await response.text();
			expect(body).toContain("istrash");
		});
	});

	describe("GET /check/:input", () => {
		it("identifies a trash domain", async () => {
			const response = await SELF.fetch("https://istrash.email/check/mailinator.com");
			expect(response.status).toBe(200);
			const data = await response.json() as any;
			expect(data.domain).toBe("mailinator.com");
			expect(data.trash).toBe(true);
			expect(data.email).toBeUndefined();
		});

		it("identifies a trash email", async () => {
			const response = await SELF.fetch("https://istrash.email/check/user@mailinator.com");
			expect(response.status).toBe(200);
			const data = await response.json() as any;
			expect(data.email).toBe("user@mailinator.com");
			expect(data.domain).toBe("mailinator.com");
			expect(data.trash).toBe(true);
		});

		it("identifies a clean domain", async () => {
			const response = await SELF.fetch("https://istrash.email/check/gmail.com");
			expect(response.status).toBe(200);
			const data = await response.json() as any;
			expect(data.domain).toBe("gmail.com");
			expect(data.trash).toBe(false);
		});

		it("identifies a clean email", async () => {
			const response = await SELF.fetch("https://istrash.email/check/user@gmail.com");
			expect(response.status).toBe(200);
			const data = await response.json() as any;
			expect(data.email).toBe("user@gmail.com");
			expect(data.domain).toBe("gmail.com");
			expect(data.trash).toBe(false);
		});

		it("returns 400 for invalid input", async () => {
			const response = await SELF.fetch("https://istrash.email/check/notadomain");
			expect(response.status).toBe(400);
		});

		it("handles CORS headers", async () => {
			const response = await SELF.fetch("https://istrash.email/check/mailinator.com");
			expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
		});
	});

	describe("GET /check?email=", () => {
		it("identifies a trash email via query param", async () => {
			const response = await SELF.fetch("https://istrash.email/check?email=user@mailinator.com");
			expect(response.status).toBe(200);
			const data = await response.json() as any;
			expect(data.trash).toBe(true);
		});

		it("identifies a trash domain via query param", async () => {
			const response = await SELF.fetch("https://istrash.email/check?email=mailinator.com");
			expect(response.status).toBe(200);
			const data = await response.json() as any;
			expect(data.trash).toBe(true);
		});

		it("returns 400 when email param is missing", async () => {
			const response = await SELF.fetch("https://istrash.email/check");
			expect(response.status).toBe(400);
		});
	});

	describe("OPTIONS (CORS preflight)", () => {
		it("returns CORS headers", async () => {
			const response = await SELF.fetch("https://istrash.email/check/test.com", {
				method: "OPTIONS",
			});
			expect(response.status).toBe(200);
			expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
			expect(response.headers.get("Access-Control-Allow-Methods")).toContain("GET");
		});
	});

	describe("error handling", () => {
		it("returns 404 for unknown routes", async () => {
			const response = await SELF.fetch("https://istrash.email/unknown");
			expect(response.status).toBe(404);
		});

		it("returns 405 for non-GET methods", async () => {
			const response = await SELF.fetch("https://istrash.email/check/test.com", {
				method: "POST",
			});
			expect(response.status).toBe(405);
		});
	});
});
