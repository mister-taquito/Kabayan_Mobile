// src/lib/shopify/types.ts

export interface Image {
  id: string;
  url: string;
  altText: string | null;
}

export interface Price {
  amount: string;
  currencyCode: string;
}

export interface ProductVariant {
  id: string;
  price: Price;
}

export interface ShopifyProduct {
  id: string;
  handle: string;
  title: string;

  // ← Add these two:
  descriptionHtml: string;
  images: {
    edges: Array<{
      node: {
        id: string;
        url: string;
        altText: string | null;
      };
    }>;
  };

  featuredImage: { url: string; altText: string | null } | null;
  variants: {
    edges: Array<{
      node: {
        id: string;
        title: string;       // ← added
        price: Price;
      };
    }>;
  };
}
export interface Collection {
  id: string;
  handle: string;
  title: string;
  image: Image | null;
}

export interface CartLineItem {
  id: string;
  quantity: number;
  merchandise: {
    __typename: 'ProductVariant';
    id: string;
    title: string;
    product: ShopifyProduct;
    price: Price;
  };
}
