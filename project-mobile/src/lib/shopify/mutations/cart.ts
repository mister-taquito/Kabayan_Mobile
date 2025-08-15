// src/lib/shopify/mutations/cart.ts
import { CART_FRAGMENT } from '../fragments/cart';

export const CREATE_CART = /* GraphQL */ `
  ${CART_FRAGMENT}
  mutation CreateCart($input: CartInput) {
    cartCreate(input: $input) {
      cart { ...CartFragment }
      userErrors { field message }
    }
  }
`;

export const ADD_LINE_ITEMS = /* GraphQL */ `
  ${CART_FRAGMENT}
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { ...CartFragment }
      userErrors { field message }
    }
  }
`;

export const UPDATE_LINE_ITEMS = /* GraphQL */ `
  ${CART_FRAGMENT}
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { ...CartFragment }
      userErrors { field message }
    }
  }
`;

export const REMOVE_LINE_ITEMS = /* GraphQL */ `
  ${CART_FRAGMENT}
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { ...CartFragment }
      userErrors { field message }
    }
  }
`;
