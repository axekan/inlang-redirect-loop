import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { paraglideVitePlugin } from '@inlang/paraglide-js';

export default defineConfig({
	plugins: [
        sveltekit(),
        paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide',
			strategy: ['url', 'cookie', 'baseLocale'],
			urlPatterns: [
				{
					pattern: ':protocol://:domain(.*)::port?/:locale(sv|en)?:path(.*)?',
					localized: [
					  ["en", ':protocol://:domain(.*)::port?/en:path(.*)?'],
					  ["sv", ':protocol://:domain(.*)::port?:path(.*)?'],
					]
				  }
			],
		}),
    ]
});
