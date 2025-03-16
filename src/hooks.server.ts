// import { paraglideMiddleware } from '$lib/paraglide/server';
import { customParaglideMiddleware } from "$lib/custom-paraglide-middleware";

export const handle = ({ event, resolve }) => {
    return customParaglideMiddleware(event.request, ({ request, locale }) =>
		resolve(
			{ ...event, request },
			{ transformPageChunk: ({ html }) => html.replace('%lang%', locale) },
		),
	);
}
