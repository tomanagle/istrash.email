# istrash.email

A fast, free API to check if an email address or domain is from a disposable email provider. Use it to block trash emails at signup without bundling a massive domain list into your own app.

Hosted on Cloudflare Workers for low latency worldwide.

**Website & docs:** [istrash.email](https://istrash.email)

## Why

Disposable email services like Mailinator and Guerrilla Mail let users create throwaway addresses in seconds. If you're running a SaaS, newsletter, or any product with signups, these addresses lead to fake accounts, wasted resources, and skewed metrics.

The disposable domain list has 70,000+ entries and grows regularly. Instead of bundling and maintaining that list in your own build, call this API and get an answer in milliseconds.

## Usage

### Check a domain

```
GET https://istrash.email/check/mailinator.com
```

```json
{ "domain": "mailinator.com", "trash": true }
```

### Check an email

```
GET https://istrash.email/check/user@mailinator.com
```

```json
{ "email": "user@mailinator.com", "domain": "mailinator.com", "trash": true }
```

### Query parameter

```
GET https://istrash.email/check?email=user@mailinator.com
```

Same response format.

## Examples

### cURL

```sh
curl https://istrash.email/check/mailinator.com
```

### JavaScript

```js
const res = await fetch("https://istrash.email/check/mailinator.com");
const data = await res.json();

if (data.trash) {
  // block signup
}
```

### Python

```python
import requests

res = requests.get("https://istrash.email/check/mailinator.com")
data = res.json()

if data["trash"]:
    # block signup
```

### Go

```go
resp, _ := http.Get("https://istrash.email/check/mailinator.com")
defer resp.Body.Close()

var result struct {
    Domain string `json:"domain"`
    Trash  bool   `json:"trash"`
}
json.NewDecoder(resp.Body).Decode(&result)

if result.Trash {
    // block signup
}
```

## Response

| Field    | Type    | Description                                      |
| -------- | ------- | ------------------------------------------------ |
| `email`  | string  | The full email address (omitted if only a domain) |
| `domain` | string  | The domain that was checked                      |
| `trash`  | boolean | `true` if the domain is disposable               |

Returns `400` for invalid input, `405` for non-GET methods. CORS is enabled.

## Self-hosting

```sh
git clone https://github.com/tomanagle/istrash.email.git
cd istrash.email
npm install
npm run dev
```

The domain list is fetched at build time from [disposable/disposable-email-domains](https://github.com/disposable/disposable-email-domains) and bundled into the worker. Run `npm run deploy` to deploy to your own Cloudflare account.

## Support

If you find this useful, [buy me a coffee](https://buymeacoffee.com/tomn).
