// src/lib/shopify/queries/product.ts

import { ImageFragment, PriceFragment } from './fragments';

export const GET_PRODUCT_BY_HANDLE = /* GraphQL */ `
  ${ImageFragment}
  ${PriceFragment}

  query GetProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id
      handle
      title
      descriptionHtml

      images(first: 10) {
        edges {
          node {
            ...ImageFragment
          }
        }
      }

      variants(first: 10) {
        edges {
          node {
            id
            title
            price {
              ...PriceFragment
            }
          }
        }
      }
    }
  }
`;
