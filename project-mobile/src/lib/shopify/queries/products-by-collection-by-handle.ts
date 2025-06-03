// src/lib/shopify/queries/products-by-collection-by-handle.ts

import { ImageFragment, PriceFragment } from './fragments';

export const GET_PRODUCTS_BY_COLLECTION_BY_HANDLE = /* GraphQL */ `
  ${ImageFragment}
  ${PriceFragment}

  query GetProductsByCollectionByHandle($handle: String!) {
    collectionByHandle(handle: $handle) {
      id
      title
      products(first: 20) {
        edges {
          node {
            id
            title
            handle
            featuredImage {
              ...ImageFragment
            }
            variants(first: 1) {
              edges {
                node {
                  price {
                    ...PriceFragment
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;
