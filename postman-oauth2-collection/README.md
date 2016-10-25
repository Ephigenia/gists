# OAuth 2.0 collection for Postman
This collection can be imported into the [Postman app](http://www.getpostman.com/).

## Provided requests
### Authorization Code Grant
- Access token request

### Client Credentials Grant
- Access token request

### Refresh Token
- Refresh access token request

## Used variables
This request needs an environment containing the following variables:

- **{{url}}** The base url for the OAuth endpoints (e.g. https://www.example.com)
- **{{tokenEndpoint}}** The path to the token endpoint (e.g. /oauth/token)
- **{{scope}}** The requested scope
- **{{clientId}}** The client id
- **{{clientSecret}}** The client secret
- **{{authorizationCode}}** The authorization code retrieved using an authorization request for the Authorization Code Grant
- **{{redirectUri}}** The redirect uri to use (should be registered with the client)

The following variables will be defined by running the request:

- **{{access_token}}** Will contain the retrieved access token
- **{{refresh_token}}** Will contain the retrieved refresh token (if any)
