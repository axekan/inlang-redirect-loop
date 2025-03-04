# inlang-redirect-loop

https://inlang-redirect-loop.pages.dev/en/

Reproduces when deployed to Cloudflare pages. Does not happen locally.

Steps to reproduce yourself:

1. Clone this repository
2. Deploy to to Cloudflare pages
3. Visit deployed page to see `ERR_TOO_MANY_REDIRECTS`

<hr>

### Note

On version `2.0.0-beta.24`, it doesn't cause the infinite redirect for the base locale.

On version `2.0.0-beta.26` it causes infinite redirect for **all** languages.

Deployed version with `2.0.0-beta.24`:

https://3be0b194.inlang-redirect-loop.pages.dev/

notice that Swedish works in this version but English doesn't