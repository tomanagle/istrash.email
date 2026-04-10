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

    #timing {
      text-align: center;
      color: #555;
      font-size: 0.85rem;
      margin-bottom: 12px;
      display: none;
    }

    #timing.visible { display: block; }

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

    .support {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin-bottom: 40px;
    }

    .support a {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 10px 18px;
      border-radius: 8px;
      border: 1px solid #333;
      background: #141414;
      color: #e0e0e0;
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      transition: border-color 0.2s, background 0.2s;
    }

    .support a:hover {
      border-color: #555;
      background: #1a1a1a;
    }

    .support svg { flex-shrink: 0; }

    .tabs {
      display: flex;
      gap: 0;
      border-bottom: 1px solid #222;
      margin-bottom: 0;
    }

    .tabs button {
      padding: 8px 16px;
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      color: #666;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      transition: color 0.2s, border-color 0.2s;
    }

    .tabs button:hover { color: #aaa; }

    .tabs button.active {
      color: #e0e0e0;
      border-bottom-color: #e0e0e0;
    }

    .tab-content pre {
      margin-top: 0;
      border-top-left-radius: 0;
      border-top-right-radius: 0;
    }

    .tab-panel { display: none; position: relative; }
    .tab-panel.active { display: block; }

    .copy-btn {
      position: absolute;
      top: 20px;
      right: 8px;
      background: #2a2a2a;
      border: 1px solid #333;
      color: #888;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 0.75rem;
      cursor: pointer;
      transition: color 0.2s, border-color 0.2s;
    }

    .copy-btn:hover { color: #e0e0e0; border-color: #555; }

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
    <div id="timing"></div>
    <pre id="response"></pre>

    <h2>API</h2>
    <p>Free, no auth required. Returns JSON with CORS enabled.</p>

    <div class="endpoint">
      <p><span class="method">GET</span> <code>/check/:email_or_domain</code></p>
    </div>
    <div class="endpoint">
      <p><span class="method">GET</span> <code>/check?email=:email_or_domain</code></p>
    </div>

    <p>Response:</p>
    <pre>{
  "email": "user@mailinator.com",
  "domain": "mailinator.com",
  "trash": true
}</pre>
    <p>If only a domain is provided, the <code>email</code> field is omitted.</p>
    <p>Returns <code>400</code> for invalid input, <code>405</code> for non-GET methods.</p>

    <h2>Examples</h2>

    <div class="tabs" id="lang-tabs">
      <button class="active" data-tab="curl">cURL</button>
      <button data-tab="js">JavaScript</button>
      <button data-tab="python">Python</button>
      <button data-tab="go">Go</button>
      <button data-tab="ruby">Ruby</button>
      <button data-tab="php">PHP</button>
    </div>

    <div id="tab-curl" class="tab-panel active">
      <button class="copy-btn">Copy</button>
      <pre>curl https://istrash.email/check/mailinator.com

curl "https://istrash.email/check?email=user@mailinator.com"</pre>
    </div>

    <div id="tab-js" class="tab-panel">
      <button class="copy-btn">Copy</button>
      <pre>const res = await fetch(
  "https://istrash.email/check/mailinator.com"
);
const data = await res.json();

console.log(data.trash); // true</pre>
    </div>

    <div id="tab-python" class="tab-panel">
      <button class="copy-btn">Copy</button>
      <pre>import requests

res = requests.get(
    "https://istrash.email/check/mailinator.com"
)
data = res.json()

print(data["trash"])  # True</pre>
    </div>

    <div id="tab-go" class="tab-panel">
      <button class="copy-btn">Copy</button>
      <pre>package main

import (
    "encoding/json"
    "fmt"
    "net/http"
)

type Result struct {
    Email  string \`json:"email,omitempty"\`
    Domain string \`json:"domain"\`
    Trash  bool   \`json:"trash"\`
}

func main() {
    resp, _ := http.Get(
        "https://istrash.email/check/mailinator.com",
    )
    defer resp.Body.Close()

    var result Result
    json.NewDecoder(resp.Body).Decode(&result)

    fmt.Println(result.Trash) // true
}</pre>
    </div>

    <div id="tab-ruby" class="tab-panel">
      <button class="copy-btn">Copy</button>
      <pre>require "net/http"
require "json"

uri = URI("https://istrash.email/check/mailinator.com")
res = Net::HTTP.get(uri)
data = JSON.parse(res)

puts data["trash"] # true</pre>
    </div>

    <div id="tab-php" class="tab-panel">
      <button class="copy-btn">Copy</button>
      <pre>$res = file_get_contents(
    "https://istrash.email/check/mailinator.com"
);
$data = json_decode($res, true);

echo $data["trash"]; // 1</pre>
    </div>

    <p style="color:#555; text-align:center; margin-top:32px;">This is a free API. If you find it useful, consider supporting the project.</p>

    <div class="support">
      <a href="https://github.com/tomanagle/istrash.email" target="_blank" rel="noopener">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
        Star on GitHub
      </a>
      <a href="https://buymeacoffee.com/tomn" target="_blank" rel="noopener">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M4.645 7.472c0-.247.105-.444.314-.591.21-.147.46-.22.754-.22.16 0 .305.017.432.05a.988.988 0 01.34.156c.103.073.182.166.238.278a.823.823 0 01.084.384c0 .18-.048.34-.144.484a1.64 1.64 0 01-.36.373 2.3 2.3 0 01-.46.263c-.166.073-.314.142-.443.207a4.268 4.268 0 00-.336.207.607.607 0 00-.193.227h1.872v.581H4.513a1.64 1.64 0 01.043-.473c.043-.156.11-.3.205-.434a2.1 2.1 0 01.353-.39c.141-.126.301-.254.48-.383.128-.092.247-.181.358-.267a2.07 2.07 0 00.296-.278.98.98 0 00.197-.306.884.884 0 00.068-.344.458.458 0 00-.155-.368.59.59 0 00-.4-.133.637.637 0 00-.46.174c-.117.116-.186.281-.207.494l-.64-.07c.036-.354.173-.63.412-.825.24-.196.544-.294.914-.294zm4.836 0c0-.247.105-.444.314-.591.21-.147.46-.22.754-.22.16 0 .305.017.432.05a.988.988 0 01.34.156c.103.073.183.166.238.278a.823.823 0 01.085.384c0 .18-.049.34-.144.484a1.64 1.64 0 01-.36.373 2.3 2.3 0 01-.46.263c-.167.073-.315.142-.444.207a4.268 4.268 0 00-.335.207.607.607 0 00-.194.227h1.873v.581H9.349a1.64 1.64 0 01.042-.473c.043-.156.111-.3.206-.434a2.1 2.1 0 01.352-.39c.142-.126.302-.254.48-.383.128-.092.248-.181.359-.267a2.07 2.07 0 00.296-.278.98.98 0 00.196-.306.884.884 0 00.069-.344.458.458 0 00-.156-.368.59.59 0 00-.399-.133.637.637 0 00-.46.174c-.117.116-.187.281-.207.494l-.641-.07c.036-.354.173-.63.412-.825.24-.196.545-.294.914-.294zM2 19.5h20v.5a2 2 0 01-2 2H4a2 2 0 01-2-2v-.5zM20.5 6H21a2 2 0 012 2v2a2 2 0 01-2 2h-.5V6zM2 6h18v12H2V6z"/></svg>
        Buy me a coffee
      </a>
    </div>
  </main>

  <footer>
    Disposable domain list sourced from
    <a href="https://github.com/disposable/disposable-email-domains" target="_blank" rel="noopener">disposable/disposable-email-domains</a>
  </footer>

  <script>
    const input = document.getElementById("email");
    const result = document.getElementById("result");
    const timing = document.getElementById("timing");
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
      timing.className = "";
      response.className = "";

      try {
        const start = performance.now();
        const res = await fetch("/check/" + encodeURIComponent(val));
        const data = await res.json();
        const ms = (performance.now() - start).toFixed(0);

        timing.textContent = ms + "ms";
        timing.className = "visible";

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

    document.querySelectorAll(".copy-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const code = btn.parentElement.querySelector("pre").textContent;
        navigator.clipboard.writeText(code).then(() => {
          btn.textContent = "Copied!";
          setTimeout(() => { btn.textContent = "Copy"; }, 1500);
        });
      });
    });

    document.getElementById("lang-tabs").addEventListener("click", (e) => {
      const tab = e.target.dataset.tab;
      if (!tab) return;
      document.querySelectorAll("#lang-tabs button").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
      e.target.classList.add("active");
      document.getElementById("tab-" + tab).classList.add("active");
    });
  </script>
</body>
</html>`;
