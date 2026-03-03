// simple Worker for a static dashboard SPA
// when using a `[site]` binding in wrangler.toml, the assets are
// exposed as the `ASSETS` binding on the environment object.  This
// handler will serve files directly from that bucket and fall back to
// index.html for SPA routing.

export default {
  async fetch(request, env) {
    try {
      return await env.ASSETS.fetch(request);
    } catch (err) {
      // if the file isn't found (404) or another error occurs, serve
      // the root index.html so client-side routing can take over.
      const url = new URL(request.url);
      return await env.ASSETS.fetch(new Request(url.origin + '/index.html', request));
    }
  }
};
