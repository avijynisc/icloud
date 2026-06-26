const DEFAULT_CENTRAL_ORIGIN = "https://icloudd.ccwu.cc";

export default {
  async fetch(request, env) {
    const centralOrigin = getEnv(env, "CENTRAL_API_ORIGIN", DEFAULT_CENTRAL_ORIGIN).replace(/\/+$/, "");
    const incoming = new URL(request.url);
    const target = new URL(`${centralOrigin}${incoming.pathname}${incoming.search}`);

    const init = {
      method: request.method,
      headers: proxyHeaders(request.headers, target.hostname),
      redirect: "manual",
    };

    if (!["GET", "HEAD"].includes(request.method)) {
      init.body = request.body;
    }

    const response = await fetch(new Request(target.toString(), init));
    return rewriteResponse(response, incoming.hostname);
  },
};

function proxyHeaders(headers, host) {
  const next = new Headers(headers);
  next.set("host", host);
  next.set("x-forwarded-host", headers.get("host") || "");
  return next;
}

function rewriteResponse(response, host) {
  const headers = new Headers(response.headers);
  const cookie = headers.get("set-cookie");
  if (cookie) {
    headers.set("set-cookie", cookie.replace(/Domain=[^;]+;?\s*/i, "").replace(/Path=\/;?/i, "Path=/;"));
  }
  headers.set("cache-control", "no-store");
  headers.set("x-proxy-backend", "mail-worker-cache");
  headers.set("x-proxy-host", host);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function getEnv(env, name, fallback = "") {
  return env && env[name] !== undefined && env[name] !== null ? String(env[name]) : fallback;
}
