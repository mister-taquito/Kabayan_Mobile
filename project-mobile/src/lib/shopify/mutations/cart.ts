// lib/shopify/mutations/cart.ts

import { CART_LINE_ITEM_FRAGMENT } from '../fragments/cart';

export const CREATE_CART = /* GraphQL */ `
  mutation CreateCart {
    cartCreate(input: {}) {
      cart {
        id
        createdAt
        lines(first: 50) {
          edges {
            node {
              ...CartLineItemFragment
            }
          }
        }
      }
    }
  }
`;

export const ADD_LINE_ITEMS = /* GraphQL */ `
  ${CART_LINE_ITEM_FRAGMENT}

  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        lines(first: 50) {
          edges {
            node { ...CartLineItemFragment }
          }
        }
      }
    }
  }
`;

export const UPDATE_LINE_ITEMS = /* GraphQL */ `
  ${CART_LINE_ITEM_FRAGMENT}

  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        lines(first: 50) {
          edges {
            node { ...CartLineItemFragment }
          }
        }
      }
    }
  }
`;

export const REMOVE_LINE_ITEMS = /* GraphQL */ `
  ${CART_LINE_ITEM_FRAGMENT}

  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        lines(first: 50) {
          edges {
            node { ...CartLineItemFragment }
          }
        }
      }
    }
  }
`;
