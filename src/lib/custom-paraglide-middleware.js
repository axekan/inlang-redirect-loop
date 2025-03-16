// Custom implementation of paraglideMiddleware with URL normalization to fix redirect loops
// when SvelteKit's trailingSlash is set to 'never'

import * as runtime from "./paraglide/runtime.js";

/**
 * Custom server middleware that handles locale-based routing with improved URL normalization.
 * This version fixes the infinite redirect loop issue when SvelteKit's trailingSlash is set to 'never'.
 *
 * @template T - The return type of the resolve function
 * @param {Request} request - The incoming request object
 * @param {(args: { request: Request, locale: import("./paraglide/runtime.js").Locale }) => T | Promise<T>} resolve - Function to handle the request
 * @returns {Promise<Response>}
 */
export async function customParaglideMiddleware(request, resolve) {
  if (!runtime.disableAsyncLocalStorage && !runtime.serverAsyncLocalStorage) {
    const { AsyncLocalStorage } = await import("async_hooks");
    runtime.overwriteServerAsyncLocalStorage(new AsyncLocalStorage());
  } else if (!runtime.serverAsyncLocalStorage) {
    runtime.overwriteServerAsyncLocalStorage(createMockAsyncLocalStorage());
  }

  const locale = runtime.extractLocaleFromRequest(request);
  const origin = new URL(request.url).origin;

  // if the client makes a request to a URL that doesn't match
  // the localizedUrl, redirect the client to the localized URL
  if (
    request.headers.get("Sec-Fetch-Dest") === "document" &&
    runtime.strategy.includes("url")
  ) {
    const localizedUrl = runtime.localizeUrl(request.url, { locale });
    // Only redirect if the normalized URLs don't match
    if (normalizeURL(localizedUrl.href) !== normalizeURL(request.url)) {
      return Response.redirect(localizedUrl, 307);
    }
  }

  // If the strategy includes "url", we need to de-localize the URL
  // before passing it to the server middleware.
  //
  // The middleware is responsible for mapping a localized URL to the
  // de-localized URL e.g. `/en/about` to `/about`. Otherwise,
  // the server can't render the correct page.
  const newRequest = runtime.strategy.includes("url")
    ? new Request(runtime.deLocalizeUrl(request.url), request)
    : // need to create a new request object because some metaframeworks (nextjs!) throw otherwise
      // https://github.com/opral/inlang-paraglide-js/issues/411
      new Request(request);

  // the message functions that have been called in this request
  /** @type {Set<string>} */
  const messageCalls = new Set();
  const response = await runtime.serverAsyncLocalStorage?.run(
    { locale, origin, messageCalls },
    () => resolve({ locale, request: newRequest })
  );

  // Only modify HTML responses
  if (
    runtime.experimentalMiddlewareLocaleSplitting &&
    response.headers.get("Content-Type")?.includes("html")
  ) {
    const body = await response.text();
    const messages = [];
    // using .values() to avoid polyfilling in older projects. else the following error is thrown
    // Type 'Set<string>' can only be iterated through when using the '--downlevelIteration' flag or with a '--target' of 'es2015' or higher.
    for (const messageCall of Array.from(messageCalls)) {
      const [id, locale] =
        /** @type {[string, import("./paraglide/runtime.js").Locale]} */ (
          messageCall.split(":")
        );
      messages.push(`${id}: ${compiledBundles[id]?.[locale]}`);
    }
    const script = `<script>globalThis.__paraglide_ssr = { ${messages.join(
      ","
    )} }</script>`;
    // Insert the script before the closing head tag
    const newBody = body.replace("</head>", `${script}</head>`);
    // Create a new response with the modified body
    // Clone all headers except Content-Length which will be set automatically
    const newHeaders = new Headers(response.headers);
    newHeaders.delete("Content-Length"); // Let the browser calculate the correct length
    return new Response(newBody, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  }
  return response;
}

/**
 * Normalize url for comparison
 * @param {string} url
 * @returns {string} normalized url string
 */
function normalizeURL(url) {
  const urlObj = new URL(url);
  urlObj.pathname.replace(/\/$/, "");
  return urlObj.toString();
}

/**
 * Creates a mock AsyncLocalStorage implementation for environments where
 * native AsyncLocalStorage is not available or disabled.
 *
 * @returns {import("./paraglide/runtime.js").ParaglideAsyncLocalStorage}
 */
function createMockAsyncLocalStorage() {
  /** @type {any} */
  let currentStore = undefined;
  return {
    getStore() {
      return currentStore;
    },
    async run(store, callback) {
      currentStore = store;
      try {
        return await callback();
      } finally {
        currentStore = undefined;
      }
    },
  };
}

/**
 * The compiled messages for the server middleware.
 *
 * Only populated if `enableMiddlewareOptimizations` is set to `true`.
 *
 * @type {Record<string, Record<import("./paraglide/runtime.js").Locale, string>>}
 */
const compiledBundles = {};
