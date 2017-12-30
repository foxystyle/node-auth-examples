# node-jwt-auth-example

## Overview

This example represents separate service that handle auth layer of your application architecture.

Currently it supports signup, signin, email confirmation features.

Signup and signin share same route. It first checks if user exists, if so then it tries to signin. Otherwise, it creates new user and sends confirmation email, then signs in with newly created user (unverified).

When user confirms email (by clicking link within email), his property `verified` becomes `true` and `verificationToken` property is then removed. It also does signin again and provides refreshed access token.

## Auth Proxy service

To enable proxy for route within other service:

```
const proxyOptions = {
  target: 'http://localhost:4000',
  changeOrigin: true,
  onProxyReq(proxyReq, req) {
    proxyReq.setHeader('x-access-identity-email', req.decodedToken.email)
  },
}

server.use('/u', authenticate, proxy(proxyOptions))
```

then within other service access headers:

```
server.get('/u/whoami', (req, res) => {
  const email = req.headers['x-access-identity-email']
  res.status(200).json({ email })
})
```

In production environment it is expected that protected service is not available outside of private network.


## Security

- Passwords are hashed via bcrypt library.
- Tokens are JWT encrypted.


To change encryption key change `secret` property inside `config.js`
