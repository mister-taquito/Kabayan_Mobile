// lib/shopify/fragments/price.ts
export const PRICE_FRAGMENT = /* GraphQL */ `
  fragment PriceFragment on MoneyV2 {
    amount
    currencyCode
  }
`;
