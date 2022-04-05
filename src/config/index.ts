import * as env from 'env-var';

export const FacebookPageId = env.get('FACEBOOK_PAGE_ID').required().asString();
export const FacebookPageToken = env
  .get('FACEBOOK_PAGE_TOKEN')
  .required()
  .asString();
export const FacebookAppWebhookSecret = env
  .get('FACEBOOK_APP_WEBHOOK_SECRET')
  .required()
  .asString();
export const FacebookAppSecret = env
  .get('FACEBOOK_APP_SECRET')
  .required()
  .asString();
export const FacebookAppId: string = env
  .get('FACEBOOK_APP_ID')
  .required()
  .asString();
export const FacebookAppAccessToken = env
  .get('FACEBOOK_APP_ACCESS_TOKEN')
  .required()
  .asString();
