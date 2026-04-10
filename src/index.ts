import trashDomains from "./domains.json";
import HTML from "./index.html";

function parseInput(input: string): { email?: string; domain: string } | null {
	const trimmed = input.trim().toLowerCase();
	if (!trimmed) return null;

	if (trimmed.includes("@")) {
		const parts = trimmed.split("@");
		if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
		const domain = parts[1];
		if (!domain.includes(".")) return null;
		return { email: trimmed, domain };
	}

	if (!trimmed.includes(".")) return null;
	return { domain: trimmed };
}

function jsonResponse(data: unknown, status = 200): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			"Content-Type": "application/json",
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type",
		},
	});
}

function handleCheck(input: string): Response {
	const parsed = parseInput(input);
	if (!parsed) {
		return jsonResponse({ error: "Invalid input. Provide an email address or domain." }, 400);
	}

	const trash = parsed.domain in trashDomains;
	const result: Record<string, unknown> = {};
	if (parsed.email) result.email = parsed.email;
	result.domain = parsed.domain;
	result.trash = trash;

	return jsonResponse(result);
}

export default {
	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);

		if (request.method === "OPTIONS") {
			return new Response(null, {
				headers: {
					"Access-Control-Allow-Origin": "*",
					"Access-Control-Allow-Methods": "GET, OPTIONS",
					"Access-Control-Allow-Headers": "Content-Type",
				},
			});
		}

		if (request.method !== "GET") {
			return jsonResponse({ error: "Method not allowed" }, 405);
		}

		// GET /check?email=...
		if (url.pathname === "/check") {
			const input = url.searchParams.get("email") || "";
			if (!input) {
				return jsonResponse({ error: "Missing 'email' query parameter." }, 400);
			}
			return handleCheck(input);
		}

		// GET /check/:input
		if (url.pathname.startsWith("/check/")) {
			const input = decodeURIComponent(url.pathname.slice("/check/".length));
			if (!input) {
				return jsonResponse({ error: "Missing input in path." }, 400);
			}
			return handleCheck(input);
		}

		// Static frontend
		if (url.pathname === "/" || url.pathname === "/index.html") {
			return new Response(HTML, {
				headers: { "Content-Type": "text/html; charset=utf-8" },
			});
		}

		return jsonResponse({ error: "Not found" }, 404);
	},
} satisfies ExportedHandler;
