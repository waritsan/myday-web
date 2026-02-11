import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			out: 'build',
			precompress: false,
			strict: false
		}),
		prerender: {
			entries: ['/chat']
		}
	}
};

export default config;
