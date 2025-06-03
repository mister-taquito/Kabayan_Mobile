// src/api/mutations.ts

export const CREATE_CHECKOUT = /* GraphQL */ `
mutation {
  checkoutCreate(input: {}) {
    checkout {
      id
      webUrl
    }
  }
}
`;

export const ADD_LINE_ITEMS = /* GraphQL */ `
mutation addLineItems($checkoutId: ID!, $lineItems: [CheckoutLineItemInput!]!) {
  checkoutLineItemsAdd(checkoutId: $checkoutId, lineItems: $lineItems) {
    checkout {
      lineItems(first: 50) {
        edges {
          node {
            id
            title
            quantity
            variant {
              price {
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
`;

export const UPDATE_LINE_ITEMS = /* GraphQL */ `
mutation updateLineItems($checkoutId: ID!, $lineItems: [CheckoutLineItemUpdateInput!]!) {
  checkoutLineItemsUpdate(checkoutId: $checkoutId, lineItems: $lineItems) {
    checkout {
      lineItems(first: 50) {
        edges {
          node {
            id
            title
            quantity
            variant {
              price {
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
`;

export const REMOVE_LINE_ITEMS = /* GraphQL */ `
mutation removeLineItems($checkoutId: ID!, $lineItemIds: [ID!]!) {
  checkoutLineItemsRemove(checkoutId: $checkoutId, lineItemIds: $lineItemIds) {
    checkout {
      lineItems(first: 50) {
        edges {
          node {
            id
            title
            quantity
            variant {
              price {
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
`;
