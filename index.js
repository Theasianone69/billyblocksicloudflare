export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let targetUrl = url.searchParams.get("proxy");

    // Default landing page if no proxy is requested
    if (!targetUrl) {
      return new Response(landingPage, { headers: { "Content-Type": "text/html" } });
    }

    // Ensure the target URL has a protocol
    if (!targetUrl.startsWith("http")) {
      targetUrl = "https://" + targetUrl;
    }

    try {
      const response = await fetch(targetUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36",
        },
      });

      const contentType = response.headers.get("Content-Type") || "";

      // If it's not HTML, pass it through (Images, JS, CSS)
      if (!contentType.includes("text/html")) {
        return response;
      }

      // BILLY BLOCKSI HTML REWRITER
      // This forces all links on the page to stay inside the proxy
      const rewriter = new HTMLRewriter()
        .on("a", {
          element(el) {
            const href = el.getAttribute("href");
            if (href && !href.startsWith("javascript:")) {
              el.setAttribute("href", `${url.origin}/?proxy=${new URL(href, targetUrl).href}`);
            }
          },
        })
        .on("body", {
          element(el) {
            el.append(`
              <div id="billy-banner" style="position:fixed; top:0; left:0; width:100%; background:red; color:white; text-align:center; z-index:9999; font-family:sans-serif; font-size:12px; padding:2px;">
                BILLY BLOCKSI ACTIVE: Monitoring ${targetUrl}
              </div>
              <script>
                console.log("Billy Blocksi logic loaded.");
                // Simple DPI Simulation: Block canvas if 'game' is in title
                if (document.title.toLowerCase().includes("game")) {
                  document.body.innerHTML = "<h1>Billy Blocksi: Game Detected</h1>";
                }
              </script>
            `, { html: true });
          },
        });

      return rewriter.transform(response);
    } catch (e) {
      return new Response("Billy Blocksi Error: " + e.message, { status: 500 });
    }
  },
};

const landingPage = `
<!DOCTYPE html>
<html>
<head><title>Billy Blocksi Dev Portal</title></head>
<body style="font-family:sans-serif; text-align:center; padding-top:100px; background:#111; color:white;">
  <h1>Billy Blocksi v1.0</h1>
  <p>Enter a URL to test the Filter Proxy:</p>
  <input type="text" id="target" placeholder="https://example.com" style="padding:10px; width:300px;">
  <button onclick="location.href='/?proxy=' + document.getElementById('target').value">Launch</button>
</body>
</html>
`;
const FORBIDDEN_WORDS = ['proxy', 'unblocked', 'emulator', 'torrent','games'];

async function handleRequest(request) {
  const url = new URL(request.url);
  
  // DPI check on the URL path and query
  if (FORBIDDEN_WORDS.some(word => url.href.toLowerCase().includes(word))) {
    return new Response("Blocked by Billy Blocksi DPI", { status: 403 });
  }

  const response = await fetch(request);
  return response;
}
