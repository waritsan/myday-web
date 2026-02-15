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

**Example**:
```
API_ENDPOINT=https://myday-fmdjg7hhcccedwgw.southeastasia-01.azurewebsites.net/api/ai_agent
```

#### Request Body

```json
{
  "message": "User message",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Previous message"
    },
    {
      "role": "assistant",
      "content": "Previous response"
    }
  ]
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
2. Set the `API_ENDPOINT` environment variable in `local.settings.json`
3. Run `func start` from the `api` directory

## Deployment

Azure Functions are automatically deployed with the Azure Static Web Apps workflow. The workflow configuration:

```yaml
api_location: "api"
```

This tells Azure Static Web Apps to deploy the functions from the `api` directory.
