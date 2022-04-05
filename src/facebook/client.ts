import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { request } from 'undici';

type FacebookGraphClientOptions = {
  pageAccessToken: string;
  pageId: string;
  appId: string;
  appSecret?: string;
  appAccessToken: string;
};

type FacebookAPIResult<T> = T & {
  error?: {
    message: string;
    type: string;
    code: number;
    fbtrace_id: string;
  };
};

type IdForAppEntry = {
  id: string;
  app: { link: string; name: string; id: string };
};

type IdForPageEntry = {
  id: string;
  page: {
    name: string;
    id: string;
  };
};

const GRAPH_API_ENDPOINT = 'https://graph.facebook.com';
const GRAPH_API_VERSION = 'v13.0';

export enum RequestScope {
  Page,
  App,
}

export class FacebookGraphClient {
  private appId: string;
  private appSecret: string | undefined;
  private appAccessToken: string;
  private pageId: string;
  private pageAccessToken: string;
  constructor(opt: FacebookGraphClientOptions) {
    // App
    this.appId = opt.appId;
    this.appSecret = opt.appSecret;
    this.appAccessToken = opt.appAccessToken;

    // Page
    this.pageId = opt.pageId;
    this.pageAccessToken = opt.pageAccessToken;
  }

  get authenticationQuery() {
    if (this.appAccessToken) {
      return `access_token=${this.appAccessToken}`;
    } else {
      return `access_token=${this.appId}|${this.appSecret}`;
    }
  }

  computeRequestUrl(urlString: string, scope: RequestScope) {
    const url = new URL(urlString);
    if (scope === RequestScope.Page) {
      url.searchParams.set('access_token', this.pageAccessToken);
    } else {
      if (this.appAccessToken) {
        url.searchParams.set('access_token', this.appAccessToken);
      } else {
        url.searchParams.set('access_token', `${this.appId}|${this.appSecret}`);
      }
    }

    console.log(url.toString());

    return url.toString();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async get<T = any>(
    path: string,
    type: RequestScope
  ): Promise<FacebookAPIResult<T>> {
    const { body } = await request(
      this.computeRequestUrl(
        `${GRAPH_API_ENDPOINT}/${GRAPH_API_VERSION}${path}`,
        type
      )
    );

    return body.json();
  }

  async getUserAppScopeByPsId(
    psId: string
  ): Promise<IdForAppEntry | undefined> {
    const result = await this.get<{ data: IdForAppEntry[] }>(
      `/${psId}/ids_for_apps?app=${this.appId}`,
      RequestScope.Page
    );

    if (result.error) {
      console.error(result.error);
      throw new Error(result.error.message);
    }

    const foundApp = result.data.find((entry) => entry.app.id === this.appId);
    return foundApp;
  }

  async getUserPageScopeByAppId(userId: string) {
    const result = await this.get<{ data: IdForPageEntry[] }>(
      `/${userId}/ids_for_pages?page=${this.pageId}`,
      RequestScope.App
    );

    if (result.error) {
      console.error(result.error);
      throw new Error(result.error.message);
    }

    const foundPage = result.data.find(
      (entry) => entry.page.id === this.pageId
    );
    return foundPage;
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    fbClient: FacebookGraphClient;
  }
}

const fbClientPlugin: FastifyPluginAsync<FacebookGraphClientOptions> = fp(
  async (fastify, options) => {
    const client = new FacebookGraphClient(options);
    // Make Prisma Client available through the fastify server instance: server.prisma
    fastify.decorate('fbClient', client);
  }
);

export default fbClientPlugin;
