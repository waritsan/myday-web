# Azure Functions API

This directory contains Azure Functions that are deployed with the Azure Static Web Apps.

## Functions

### ai_agent

**Endpoint**: `/api/ai_agent`  
**Method**: POST  
**Description**: Proxies requests to the external AI Agent API.

This function acts as a secure proxy between the client and the external AI API endpoint.

#### Configuration

The function requires the `API_ENDPOINT` environment variable to be set in Azure Static Web Apps Application Settings.

**IMPORTANT**: The API_ENDPOINT must include the full URL with the authentication code query parameter.

**Example**:
```
API_ENDPOINT=https://myday-fmdjg7hhcccedwgw.southeastasia-01.azurewebsites.net/api/ai_agent?code=YOUR_FUNCTION_KEY_HERE
```

**How to get your Function Key**:
1. Go to Azure Portal
2. Navigate to your Function App
3. Go to Functions > ai_agent
4. Click "Function Keys" in the left menu
5. Copy the default key or create a new one
6. Add it to the URL as a query parameter: `?code=YOUR_KEY`

**Setting the environment variable**:
1. Go to Azure Portal
2. Navigate to your Static Web App
3. Go to Settings > Configuration (or Environment Variables)
4. Add a new application setting:
   - Name: `API_ENDPOINT`
   - Value: `https://your-function-app.azurewebsites.net/api/ai_agent?code=YOUR_KEY`

#### Request Body

```json
{
  "message": "User message"
}
```

#### Response

Success (200):
```json
{
  "response": "AI response message"
}
```

Error (4xx/5xx):
```json
{
  "error": "Error message"
}
```

## Local Development

To test the Azure Functions locally:

1. Install Azure Functions Core Tools
2. Create a `local.settings.json` file in the `api` directory:
   ```json
   {
     "IsEncrypted": false,
     "Values": {
       "AzureWebJobsStorage": "",
       "FUNCTIONS_WORKER_RUNTIME": "node",
       "API_ENDPOINT": "https://your-function-app.azurewebsites.net/api/ai_agent?code=YOUR_KEY"
     }
   }
   ```
3. Run `func start` from the `api` directory

## Deployment

Azure Functions are automatically deployed with the Azure Static Web Apps workflow. The workflow configuration:

```yaml
api_location: "api"
```

This tells Azure Static Web Apps to deploy the functions from the `api` directory.
