// lib/shopify/queries/home-products.ts

import { IMAGE_FRAGMENT } from '../fragments/image';
import { PRICE_FRAGMENT } from '../fragments/price';

export const GET_HOME_PRODUCTS = /* GraphQL */ `
  ${IMAGE_FRAGMENT}
  ${PRICE_FRAGMENT}

  query GetHomeProducts {
    products(first: 10) {
      edges {
        node {
          id
          title
          handle
          featuredImage { ...ImageFragment }
          variants(first: 1) {
            edges { node { price { ...PriceFragment } } }
          }
        }
      }
    }
  }
`;
