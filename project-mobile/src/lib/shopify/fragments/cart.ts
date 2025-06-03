// lib/shopify/fragments/cart.ts

import { PRICE_FRAGMENT } from './price';
import { PRODUCT_CARD_FRAGMENT } from './product';

export const CART_LINE_ITEM_FRAGMENT = /* GraphQL */ `
  ${PRICE_FRAGMENT}
  ${PRODUCT_CARD_FRAGMENT}

  fragment CartLineItemFragment on CartLineItem {
    id
    quantity
    merchandise {
      ... on ProductVariant {
        id
        title
        product {
          ...ProductCardFragment
        }
        price {
          ...PriceFragment
        }
      }
    }
  }
`;
