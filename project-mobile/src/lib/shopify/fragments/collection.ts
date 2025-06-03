// lib/shopify/fragments/collection.ts

export const COLLECTION_FRAGMENT = /* GraphQL */ `
  fragment CollectionFragment on Collection {
    id
    handle
    title
    image {
      url
      altText
    }
  }
`;
