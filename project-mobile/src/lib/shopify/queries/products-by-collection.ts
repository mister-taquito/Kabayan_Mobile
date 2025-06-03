// lib/shopify/queries/products-by-collection.ts

import { PRICE_FRAGMENT } from '../fragments/price';
import { IMAGE_FRAGMENT } from '../fragments/image';

export const GET_PRODUCTS_BY_COLLECTION = /* GraphQL */ `
  ${IMAGE_FRAGMENT}
  ${PRICE_FRAGMENT}

  query GetProductsByCollection($id: ID!) {
    collection(id: $id) {
      id
      handle
      title
      products(first: 20) {
        edges {
          node {
            id
            title
            handle
            featuredImage { ...ImageFragment }
            variants(first: 1) {
              edges {
                node { price { ...PriceFragment } }
              }
            }
          }
        }
      }
    }
  }
`;
