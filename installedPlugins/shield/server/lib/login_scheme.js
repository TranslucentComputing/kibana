import authenticateFactory from './auth_redirect';

/**
 * Creates a hapi auth scheme with conditional session
 * expiration handling based on each request
 *
 * @param {object}
 *    redirectUrl: Transform function that request path is passed to before
 *                 redirecting
 *    strategy:    The name of the auth strategy to use for test
 * @return {Function}
 */
export default function createScheme({ redirectUrl, strategies }) {
  return (server, options) => {
    const authenticate = authenticateFactory({
      redirectUrl,
      strategies,
      testRequest: server.auth.test
    });
    return { authenticate };
  };
}
