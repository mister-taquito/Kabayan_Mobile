export const ImageFragment = `
  fragment ImageFragment on Image {
    id
    url
    altText
  }
`;

export const PriceFragment = `
  fragment PriceFragment on MoneyV2 {
    amount
    currencyCode
  }
`;