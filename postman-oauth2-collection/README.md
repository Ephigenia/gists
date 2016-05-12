# OAuth 2.0 collection for Postman
This collection can be imported into the [Postman app](http://www.getpostman.com/).

## Provided requests
Currently only the Client Credentials Grant Access Token Request is provided, other requests might be added later.

## Used variables
This request needs an environment containing the following variables:

- **{{url}}** The base url for the OAuth endpoints (e.g. https://www.example.com)
- **{{tokenEndpoint}}** The path to the token endpoint (e.g. /oauth/token)
- **{{scope}}** The requested scope
- **{{clientId}}** The client id
- **{{clientSecret}}** The client secret

The following variables will be defined by running the request:

- **{{access_token}}** Will contain the retrieved access token
