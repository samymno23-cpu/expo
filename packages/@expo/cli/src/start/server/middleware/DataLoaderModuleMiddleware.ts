import { getConfig } from '@expo/config';
import { type RouteInfo } from 'expo-server/private';

import { ExpoMiddleware } from './ExpoMiddleware';
import { ServerNext, ServerRequest, ServerResponse } from './server.types';
import { fetchManifest } from '../metro/fetchRouterManifest';

const LOADER_MODULE_ENDPOINT = '/_expo/loaders';

/**
 * Middleware for serving loader data modules dynamically during development. This allows
 * client-side navigation to fetch loader data on-demand.
 *
 * In production, these modules are pre-generated as static files.
 */
export class DataLoaderModuleMiddleware extends ExpoMiddleware {
  constructor(
    protected projectRoot: string,
    protected appDir: string,
    private executeServerDataLoaderAsync: (
      url: URL,
      route: RouteInfo<RegExp>
    ) => Promise<Response | undefined>,
    private getDevServerUrl: () => string
  ) {
    super(projectRoot, [LOADER_MODULE_ENDPOINT]);
  }

  /**
   * Only handles a request if `req.pathname` begins with `/_expo/loaders/` and if the request
   * headers include `Accept: application/json`.
   */
  override shouldHandleRequest(req: ServerRequest): boolean {
    if (!req.url) return false;
    const { pathname } = new URL(req.url, 'http://localhost');

    if (!pathname.startsWith(`${LOADER_MODULE_ENDPOINT}/`)) {
      return false;
    }

    if (req.headers.accept !== 'application/json') {
      return false;
    }

    const { exp } = getConfig(this.projectRoot);
    return !!exp.extra?.router?.unstable_useServerDataLoaders;
  }

  async handleRequestAsync(
    req: ServerRequest,
    res: ServerResponse,
    next: ServerNext
  ): Promise<void> {
    if (!['GET', 'HEAD'].includes(req.method ?? '')) {
      return next();
    }

    const manifest = await fetchManifest(this.projectRoot, {
      appDir: this.appDir,
    });

    const { pathname } = new URL(req.url!, 'http://localhost');

    try {
      const routePath = pathname.replace('/_expo/loaders', '').replace('/index', '/') || '/';

      const matchingRoute = manifest?.htmlRoutes.find((route) => {
        return route.namedRegex.test(routePath);
      });

      if (!matchingRoute) {
        throw new Error(`No matching route for ${routePath}`);
      }

      const response = await this.executeServerDataLoaderAsync(
        new URL(routePath, this.getDevServerUrl()),
        matchingRoute
      );

      if (!response) {
        res.statusCode = 404;
        res.end('{}');
        return;
      }

      res.statusCode = response.status;
      // In development, we don't want to cache loader data so that changes to the loader function
      // will be immediately reflected. However, users can override this behavior by setting the
      // `Cache-Control` header in their loader's `Response` object.
      res.setHeader('Cache-Control', 'no-cache');
      for (const [name, value] of response.headers.entries()) {
        res.setHeader(name, value);
      }
      const body = await response.text();
      res.end(body);
    } catch (error) {
      console.error(`Failed to generate loader module for ${pathname}:`, error);
      res.statusCode = 500;
      res.end(`{}`);
    }
  }
}
