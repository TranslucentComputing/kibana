import Boom from 'boom';
import Promise from 'bluebird';
import { contains, get, has } from 'lodash';

const API_TAG = 'api';

/**
 * Creates a hapi authenticate function that conditionally
 * redirects on auth failure
 *
 * Kibana requires a `kbn-xsrf` header or a `kbn-version` for xhr requests, so
 * it is probably the safest measure we have for determining whether a request
 * should return a 401 or a 302 when authentication fails.
 *
 * @param {object}
 *    onError:     Transform function that error is passed to before deferring
 *                 to standard error handler
 *    redirectUrl: Transform function that request path is passed to before
 *                 redirecting
 *    strategy:    The name of the auth strategy to use for test, or an array of auth strategy names
 *    testRequest: Function to test authentication for a request
 * @return {Function}
 */
export default function factory({ onError, redirectUrl, strategies, testRequest }) {
  const testRequestAsync = Promise.promisify(testRequest);
  return function authenticate(request, reply) {
    return Promise.any(strategies.map((strategy) => testRequestAsync(strategy, request)))
    .then((credentials) => reply.continue({ credentials }))
    .catch(() => {
      if (shouldRedirect(request)) {
        reply.redirect(redirectUrl(request.url.path));
      } else {
        reply(Boom.unauthorized());
      }
    });
  };
};

export function shouldRedirect(request) {
  const hasVersionHeader = has(request.raw.req.headers, 'kbn-version');
  const hasXsrfHeader = has(request.raw.req.headers, 'kbn-xsrf');

  const isApiRoute = contains(get(request, 'route.settings.tags'), API_TAG);
  const isAjaxRequest = hasVersionHeader || hasXsrfHeader;

  return !isApiRoute && !isAjaxRequest;
};
