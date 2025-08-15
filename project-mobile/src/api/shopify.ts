// src/api/shopify
import Constants from 'expo-constants';

type Extra = {
  SHOPIFY_STORE_DOMAIN?: string;
  SHOPIFY_STOREFRONT_TOKEN?: string;
  SHOPIFY_API_VERSION?: string;
};

type Variables = Record<string, unknown>;

export type ShopifyGraphQLError = {
  message: string;
  locations?: { line: number; column: number }[];
  path?: Array<string | number>;
  extensions?: Record<string, unknown>;
};

export type GraphQLResponse<T> = {
  data?: T;
  errors?: ShopifyGraphQLError[];
};

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

const STORE_DOMAIN =
  extra.SHOPIFY_STORE_DOMAIN || process.env.EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN;

const STOREFRONT_TOKEN =
  extra.SHOPIFY_STOREFRONT_TOKEN || process.env.EXPO_PUBLIC_SHOPIFY_STOREFRONT_TOKEN;

// Keep version configurable; default matches the pack.
const API_VERSION =
  extra.SHOPIFY_API_VERSION ||
  process.env.EXPO_PUBLIC_SHOPIFY_API_VERSION ||
  '2025-04';

if (!STORE_DOMAIN || !STOREFRONT_TOKEN) {
  throw new Error(
    'Missing Shopify config. Set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_TOKEN (use Expo extra or EXPO_PUBLIC_* envs).'
  );
}

export const STOREFRONT_ENDPOINT = `https://${STORE_DOMAIN}/api/${API_VERSION}/graphql.json`;

// Optional: helpful tag to keep gql strings readable
export const gql = String.raw;

export async function shopifyRequest<T>(
  query: string,
  variables?: Variables,
  opts?: { signal?: AbortSignal }
): Promise<T> {
  const res = await fetch(STOREFRONT_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': String(STOREFRONT_TOKEN),
    },
    body: JSON.stringify({ query, variables }),
    signal: opts?.signal,
  });

  // Handle transport-level errors clearly
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Shopify HTTP ${res.status}: ${text || res.statusText}`);
  }

  const json = (await res.json()) as GraphQLResponse<T>;

  // Surface GraphQL userErrors in a readable way
  if (json.errors?.length) {
    const msg = json.errors.map((e) => e.message).join('\n');
    throw new Error(`Shopify GraphQL error(s):\n${msg}`);
  }

  if (!json.data) throw new Error('Shopify response missing `data`.');

  return json.data;
}
