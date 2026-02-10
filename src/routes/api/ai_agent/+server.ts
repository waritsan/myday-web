import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();

		const apiEndpoint =
			process.env.VITE_API_ENDPOINT || 'http://localhost:7071/api/ai_agent';

		const response = await fetch(apiEndpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(body)
		});

		if (!response.ok) {
			return new Response(
				JSON.stringify({
					error: `API returned ${response.status}: ${response.statusText}`
				}),
				{
					status: response.status,
					headers: {
						'Content-Type': 'application/json'
					}
				}
			);
		}

		const data = await response.json();

		return new Response(JSON.stringify(data), {
			status: 200,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	} catch (error) {
		console.error('API Error:', error);
		return new Response(
			JSON.stringify({
				error: error instanceof Error ? error.message : 'Unknown error occurred'
			}),
			{
				status: 500,
				headers: {
					'Content-Type': 'application/json'
				}
			}
		);
	}
};
