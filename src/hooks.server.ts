import { paraglideMiddleware } from '$lib/paraglide/server';

export const handle = ({ event, resolve }) => {
    return paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;
		return resolve(event, {
			transformPageChunk: ({ html }) => {
				return html.replace('%lang%', locale);
			}
		});
	});
}
