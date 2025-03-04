# inlang-redirect-loop

https://inlang-redirect-loop.pages.dev/en/

Reproduces when deployed to Cloudflare pages. Does not happen locally.

Steps to reproduce yourself:

1. Clone this repository
2. Deploy to to Cloudflare pages
3. Visit deployed page to see `ERR_TOO_MANY_REDIRECTS`

<hr>

### Note

This issue seems to be caused by the `trailingSlash` option (see `/src/routes/+page.ts`), but the behavior is different between paraglide-js versions.

`trailingSlash` set to the default value of `never` will always cause the redirect bug.

On the latest version `2.0.0-beta.26` with `trailingSlash = 'ignore'`, all routes redirect to `/en`. 

https://00bdd610.inlang-redirect-loop.pages.dev/sv/

On verion `2.0.0-beta.24` with `trailingSlash = 'ignore'` everything seems to work correctly.

https://72aaffa0.inlang-redirect-loop.pages.dev/