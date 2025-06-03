// src/api/shopify.ts
import Constants from 'expo-constants'

const {
  SHOPIFY_STORE_DOMAIN,
  SHOPIFY_STOREFRONT_TOKEN,
} = Constants.expoConfig?.extra as {
  SHOPIFY_STORE_DOMAIN: string
  SHOPIFY_STOREFRONT_TOKEN: string
}

type Variables = { [key: string]: any }

export async function shopifyRequest<T>(
  query: string,
  variables?: Variables
): Promise<T> {
  const res = await fetch(
    `https://${SHOPIFY_STORE_DOMAIN}/api/2023-07/graphql.json`,
    {
      method: 'POST',
      headers: {
        'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    }
  )
  const { data, errors } = await res.json()
  if (errors) throw new Error(errors.map((e: any) => e.message).join('\n'))
  return data
}
