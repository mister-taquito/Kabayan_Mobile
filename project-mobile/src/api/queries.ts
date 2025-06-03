// src/api/queries.ts

export const GET_HOME_PRODUCTS = /* GraphQL */ `
  query GetHomeProducts {
    products(first: 10) {
      edges {
        node {
          id
          title
          handle
          featuredImage { url altText }
          variants(first: 1) {
            edges {
              node {
                price {       # ← change here
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  }
`

export const GET_PRODUCTS_BY_COLLECTION = /* GraphQL */ `
  query GetProductsByCollection($id: ID!) {
    collection(id: $id) {
      title
      products(first: 20) {
        edges {
          node {
            id
            title
            handle
            featuredImage { url altText }
            variants(first: 1) {
              edges {
                node {
                  price {  # ← and here
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`
export const GET_PRODUCT_BY_HANDLE = /* GraphQL */ `
  query GetProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id
      title
      descriptionHtml
      featuredImage { url altText }
      images(first: 10) {
        edges { node { url altText } }
      }
      variants(first: 10) {
        edges {
          node {
            id
            price {      # matches your other queries
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;