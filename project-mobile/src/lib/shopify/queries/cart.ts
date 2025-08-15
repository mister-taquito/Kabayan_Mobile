// lib/shopify/queries/cart.ts
import { CART_FRAGMENT } from '../fragments/cart';

export const GET_CART = /* GraphQL */ `
  ${CART_FRAGMENT}
  query GetCart($cartId: ID!) {
    cart(id: $cartId) {
      ...CartFragment
    }
  }
`;
