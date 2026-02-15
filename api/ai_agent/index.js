const https = require('https');
const http = require('http');
const { URL } = require('url');

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
        
        // API_ENDPOINT should be configured in Azure Static Web Apps environment variables
        // It must include the full URL with authentication code query parameter
        // Example: https://myday-fmdjg7hhcccedwgw.southeastasia-01.azurewebsites.net/api/ai_agent?code=YOUR_KEY
        const apiEndpoint = process.env.API_ENDPOINT;
        
        if (!apiEndpoint) {
            context.log.error('API_ENDPOINT environment variable is not set');
            context.res = {
                status: 500,
                body: {
                    error: 'API endpoint is not configured. Please set the API_ENDPOINT environment variable.'
                }
            };
            return;
        }

        context.log('Calling external API:', apiEndpoint);

        // Parse the URL
        const parsedUrl = new URL(apiEndpoint);
        const protocol = parsedUrl.protocol === 'https:' ? https : http;
        
        // Log sanitized URL (without exposing full query parameters)
        const sanitizedUrl = `${parsedUrl.protocol}//${parsedUrl.hostname}${parsedUrl.pathname}${parsedUrl.search ? '?...' : ''}`;
        context.log('Parsed URL:', sanitizedUrl);
        
        // Prepare request data
        const postData = JSON.stringify(body);
        
        const options = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
            path: parsedUrl.pathname + parsedUrl.search,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        // Make the request using native Node.js modules
        const responseData = await new Promise((resolve, reject) => {
            const request = protocol.request(options, (response) => {
                let data = '';
                
                response.on('data', (chunk) => {
                    data += chunk;
                });
                
                response.on('end', () => {
                    resolve({
                        statusCode: response.statusCode,
                        statusMessage: response.statusMessage,
                        data: data
                    });
                });
            });
            
            request.on('error', (error) => {
                reject(error);
            });
            
            request.write(postData);
            request.end();
        });

        if (responseData.statusCode < 200 || responseData.statusCode >= 300) {
            context.log('API error:', responseData.statusCode, responseData.data);
            
            // Check for common authentication errors
            let errorMessage = `API returned ${responseData.statusCode}: ${responseData.statusMessage}`;
            if (responseData.statusCode === 401) {
                errorMessage += ' (Authentication failed - check if API_ENDPOINT includes the correct authentication code)';
            } else if (responseData.statusCode === 403) {
                errorMessage += ' (Access forbidden - verify the authentication code is valid)';
            }
            
            context.res = {
                status: responseData.statusCode,
                body: {
                    error: errorMessage
                }
            };
            return;
        }

        let data;
        try {
            data = JSON.parse(responseData.data);
        } catch (parseError) {
            context.log('Error parsing JSON response:', parseError);
            context.res = {
                status: 500,
                body: {
                    error: 'Invalid JSON response from API'
                }
            };
            return;
        }
        
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
