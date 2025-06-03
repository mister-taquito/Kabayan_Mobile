// lib/shopify/fragments/product.ts

import { IMAGE_FRAGMENT } from './image';
import { PRICE_FRAGMENT } from './price';

export const PRODUCT_CARD_FRAGMENT = /* GraphQL */ `
  ${IMAGE_FRAGMENT}
  ${PRICE_FRAGMENT}

  fragment ProductCardFragment on Product {
    id
    handle
    title
    featuredImage {
      ...ImageFragment
    }
    variants(first: 1) {
      edges {
        node {
          id
          price {
            ...PriceFragment
          }
        }
      }
    }
  }
`;
