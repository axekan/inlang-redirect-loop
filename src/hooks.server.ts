import { paraglideMiddleware } from '$lib/paraglide/server';

export const handle = ({ event, resolve }) => {
    return paraglideMiddleware(event.request, ({ request, locale }) =>
		resolve(
			{ ...event, request },
			{ transformPageChunk: ({ html }) => html.replace('%lang%', locale) },
		),
	);
}
