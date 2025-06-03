// lib/shopify/queries/collection.ts

import { COLLECTION_FRAGMENT } from '../fragments/collection';

export const GET_COLLECTION_LIST = /* GraphQL */ `
  ${COLLECTION_FRAGMENT}

  query GetCollectionList($first: Int!) {
    collections(first: $first) {
      edges {
        node {
          ...CollectionFragment
        }
      }
    }
  }
`;
