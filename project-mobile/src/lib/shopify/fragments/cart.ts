// src/lib/shopify/fragments/cart.ts

/** Cart-only money fragment name (won’t collide with product queries). */
export const CART_MONEY_FRAGMENT = /* GraphQL */ `
  fragment CartMoneyFragment on MoneyV2 {
    amount
    currencyCode
  }
`;

/** Minimal product fields (no money fields here). */
export const CART_PRODUCT_MIN_FRAGMENT = /* GraphQL */ `
  fragment CartProductMinFragment on Product {
    id
    handle
    title
  }
`;

/** Cart line (no PriceFragment anywhere). */
export const CART_LINE_FRAGMENT = /* GraphQL */ `
  fragment CartLineFragment on CartLine {
    id
    quantity
    attributes { key value }
    cost {
      amountPerQuantity { ...CartMoneyFragment }
      subtotalAmount   { ...CartMoneyFragment }
      totalAmount      { ...CartMoneyFragment }
    }
    merchandise {
      ... on ProductVariant {
        id
        title
        availableForSale
        selectedOptions { name value }
        price          { ...CartMoneyFragment }
        compareAtPrice { ...CartMoneyFragment }
        product { ...CartProductMinFragment }
        image { url altText width height }
      }
    }
  }
`;

/** Full cart payload. */
export const CART_FRAGMENT = /* GraphQL */ `
  ${CART_MONEY_FRAGMENT}
  ${CART_PRODUCT_MIN_FRAGMENT}
  ${CART_LINE_FRAGMENT}

  fragment CartFragment on Cart {
    id
    createdAt
    updatedAt
    checkoutUrl
    note
    attributes { key value }
    buyerIdentity {
      email
      phone
      countryCode
      customer { id }
    }
    discountCodes { code applicable }
    cost {
      subtotalAmount  { ...CartMoneyFragment }
      totalAmount     { ...CartMoneyFragment }
      totalTaxAmount  { ...CartMoneyFragment }
      totalDutyAmount { ...CartMoneyFragment }
    }
    lines(first: 100) {
      edges { node { ...CartLineFragment } }
    }
  }
`;
