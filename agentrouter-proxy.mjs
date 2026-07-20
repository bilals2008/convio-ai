import http from "node:http";
import https from "node:https";

const AGENTROUTER = "agentrouter.org";
const PORT = 20129;

http.createServer((req, res) => {
  const body = [];
  req.on("data", (c) => body.push(c));
  req.on("end", () => {
    const opts = {
      hostname: AGENTROUTER,
      port: 443,
      path: req.url,
      method: req.method,
      headers: {
        ...req.headers,
        host: AGENTROUTER,
        "user-agent": "opencode/1.18.3",
        "accept-encoding": "identity",
      },
    };
    delete opts.headers["x-forwarded-for"];
    delete opts.headers["x-forwarded-host"];
    delete opts.headers["proxy-connection"];

    const proxyReq = https.request(opts, (proxyRes) => {
      const resHeaders = { ...proxyRes.headers };
      delete resHeaders["content-encoding"];
      delete resHeaders["transfer-encoding"];
      res.writeHead(proxyRes.statusCode, resHeaders);

      if (proxyRes.headers["content-type"]?.includes("text/event-stream")) {
        let buf = "";
        proxyRes.on("data", (chunk) => {
          buf += chunk.toString();
          const parts = buf.split("\n");
          buf = parts.pop() || "";
          for (const line of parts) {
            const t = line.trim();
            if (t.startsWith("data: ")) {
              const json = t.slice(6);
              if (json === "[DONE]") { res.write(line + "\n"); continue; }
              try { const p = JSON.parse(json); if (p.object === "billing.summary") continue; } catch {}
            }
            res.write(line + "\n");
          }
        });
        proxyRes.on("end", () => {
          if (buf.trim()) res.write(buf + "\n");
          res.end();
        });
      } else {
        proxyRes.pipe(res);
      }
    });
    proxyReq.on("error", (e) => { res.writeHead(502); res.end(e.message); });
    proxyReq.write(Buffer.concat(body));
    proxyReq.end();
  });
}).listen(PORT, "127.0.0.1", () => {
  console.log(`Proxy on http://127.0.0.1:${PORT}`);
});
