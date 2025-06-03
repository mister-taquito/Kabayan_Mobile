// lib/shopify/queries/cart.ts

import { CART_LINE_ITEM_FRAGMENT } from '../fragments/cart';

export const GET_CART = /* GraphQL */ `
  ${CART_LINE_ITEM_FRAGMENT}

  query GetCart($cartId: ID!) {
    cart(id: $cartId) {
      id
      createdAt
      updatedAt
      lines(first: 50) {
        edges {
          node {
            ...CartLineItemFragment
          }
        }
      }
      checkoutUrl
    }
  }
`;
