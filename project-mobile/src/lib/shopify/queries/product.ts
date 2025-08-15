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
        edges { node { ...ImageFragment } }
      }

      # Helpful if you add a variant picker later
      options { id name values }

      variants(first: 50) {
        edges {
          node {
            id                      # variantId (merchandiseId for Cart API)
            title
            availableForSale        # used if you want to gray out OOS, optional
            selectedOptions { name value }
            price { ...PriceFragment }
            compareAtPrice { ...PriceFragment }
            image { ...ImageFragment }
          }
        }
      }
    }
  }
`;
