import domainsArray from "./domains.json";

const trashDomains: Set<string> = new Set(domainsArray);

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

  const trash = trashDomains.has(parsed.domain);
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

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>istrash.email - Disposable Email Checker</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #0a0a0a;
      color: #e0e0e0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    main {
      max-width: 640px;
      width: 100%;
      padding: 60px 20px 40px;
    }

    h1 {
      font-size: 2.5rem;
      font-weight: 700;
      text-align: center;
      margin-bottom: 8px;
    }

    h1 span { color: #f87171; }

    .tagline {
      text-align: center;
      color: #888;
      margin-bottom: 40px;
      font-size: 1.1rem;
    }

    .checker {
      display: flex;
      gap: 8px;
      margin-bottom: 24px;
    }

    input {
      flex: 1;
      padding: 14px 16px;
      border-radius: 8px;
      border: 1px solid #333;
      background: #141414;
      color: #e0e0e0;
      font-size: 1rem;
      outline: none;
      transition: border-color 0.2s;
    }

    input:focus { border-color: #555; }
    input::placeholder { color: #555; }

    button {
      padding: 14px 24px;
      border-radius: 8px;
      border: none;
      background: #e0e0e0;
      color: #0a0a0a;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
      white-space: nowrap;
    }

    button:hover { background: #fff; }

    #result {
      text-align: center;
      padding: 20px;
      border-radius: 8px;
      font-size: 1.2rem;
      font-weight: 600;
      display: none;
      margin-bottom: 40px;
    }

    #result.trash {
      display: block;
      background: #1c0a0a;
      border: 1px solid #f87171;
      color: #f87171;
    }

    #result.clean {
      display: block;
      background: #0a1c0a;
      border: 1px solid #4ade80;
      color: #4ade80;
    }

    #result.error {
      display: block;
      background: #1c1a0a;
      border: 1px solid #facc15;
      color: #facc15;
    }

    #response {
      display: none;
      margin-bottom: 40px;
    }

    #response.visible {
      display: block;
    }

    h2 {
      font-size: 1.3rem;
      font-weight: 600;
      margin-bottom: 16px;
      padding-top: 32px;
      border-top: 1px solid #1a1a1a;
    }

    p, li { line-height: 1.6; color: #aaa; }
    p { margin-bottom: 12px; }

    code {
      background: #1a1a1a;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.9em;
      color: #e0e0e0;
    }

    pre {
      background: #141414;
      border: 1px solid #222;
      border-radius: 8px;
      padding: 16px;
      overflow-x: auto;
      margin: 12px 0 24px;
      font-size: 0.85rem;
      line-height: 1.5;
      color: #ccc;
    }

    .endpoint {
      margin-bottom: 20px;
    }

    .method {
      display: inline-block;
      background: #166534;
      color: #4ade80;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 700;
      margin-right: 8px;
    }

    footer {
      text-align: center;
      color: #444;
      font-size: 0.85rem;
      padding: 20px;
    }

    footer a { color: #888; }
  </style>
</head>
<body>
  <main>
    <h1>is<span>trash</span>.email</h1>
    <p class="tagline">Check if an email address or domain is disposable</p>

    <div class="checker">
      <input type="text" id="email" placeholder="user@example.com or example.com" autofocus>
      <button id="btn" onclick="check()">Check</button>
    </div>

    <div id="result"></div>
    <pre id="response"></pre>

    <h2>API</h2>
    <p>Free, no auth required. Returns JSON with CORS enabled.</p>

    <div class="endpoint">
      <p><span class="method">GET</span> <code>/check/:email_or_domain</code></p>
      <pre>curl https://istrash.email/check/mailinator.com</pre>
    </div>

    <div class="endpoint">
      <p><span class="method">GET</span> <code>/check?email=:email_or_domain</code></p>
      <pre>curl "https://istrash.email/check?email=user@mailinator.com"</pre>
    </div>

    <p>Response:</p>
    <pre>{
  "email": "user@mailinator.com",
  "domain": "mailinator.com",
  "trash": true
}</pre>

    <p>If only a domain is provided, the <code>email</code> field is omitted.</p>
    <p>Returns <code>400</code> for invalid input, <code>405</code> for non-GET methods.</p>
  </main>

  <footer>
    Disposable domain list sourced from
    <a href="https://github.com/disposable/disposable-email-domains" target="_blank" rel="noopener">disposable/disposable-email-domains</a>
  </footer>

  <script>
    const input = document.getElementById("email");
    const result = document.getElementById("result");
    const response = document.getElementById("response");
    const btn = document.getElementById("btn");

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") check();
    });

    async function check() {
      const val = input.value.trim();
      if (!val) return;

      btn.disabled = true;
      btn.textContent = "...";
      result.style.display = "none";
      result.className = "";
      response.className = "";

      try {
        const res = await fetch("/check/" + encodeURIComponent(val));
        const data = await res.json();

        response.textContent = JSON.stringify(data, null, 2);
        response.className = "visible";

        if (!res.ok) {
          result.textContent = data.error || "Something went wrong";
          result.className = "error";
        } else if (data.trash) {
          result.textContent = (data.email || data.domain) + " is trash";
          result.className = "trash";
        } else {
          result.textContent = (data.email || data.domain) + " is not trash";
          result.className = "clean";
        }
      } catch {
        result.textContent = "Request failed";
        result.className = "error";
        response.className = "";
      }

      btn.disabled = false;
      btn.textContent = "Check";
    }
  </script>
</body>
</html>`;
