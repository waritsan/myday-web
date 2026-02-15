module.exports = async function (context, req) {
    context.log('AI Agent proxy function triggered');

    if (req.method !== 'POST') {
        context.res = {
            status: 405,
            body: { error: 'Method not allowed' }
        };
        return;
    }

    try {
        const body = req.body;
        const apiEndpoint = process.env.API_ENDPOINT || 'http://localhost:7071/api/ai_agent';

        context.log('Calling external API:', apiEndpoint);

        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            context.log('API error:', response.status, errorText);
            context.res = {
                status: response.status,
                body: {
                    error: `API returned ${response.status}: ${response.statusText}`
                }
            };
            return;
        }

        const data = await response.json();
        context.res = {
            status: 200,
            body: data
        };
    } catch (error) {
        context.log('Error:', error);
        context.res = {
            status: 500,
            body: {
                error: error.message || 'Unknown error occurred'
            }
        };
    }
};
