// src/context/CartContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import {
  CREATE_CHECKOUT,
  ADD_LINE_ITEMS,
  UPDATE_LINE_ITEMS,
  REMOVE_LINE_ITEMS,
} from '../api/mutations';
import { shopifyRequest } from '../api/shopify';

interface LineItemNode {
  id: string;
  title: string;
  quantity: number;
  variant: {
    price: { amount: string; currencyCode: string };
  };
}

interface CheckoutCreateResponse {
  checkoutCreate: { checkout: { id: string; webUrl: string } };
}

interface LineItemsResponse {
  checkoutLineItemsAdd?: {
    checkout: { lineItems: { edges: { node: LineItemNode }[] } };
  };
  checkoutLineItemsUpdate?: {
    checkout: { lineItems: { edges: { node: LineItemNode }[] } };
  };
  checkoutLineItemsRemove?: {
    checkout: { lineItems: { edges: { node: LineItemNode }[] } };
  };
}

export interface CartItem {
  id: string;
  title: string;
  quantity: number;
  price: { amount: string; currencyCode: string };
}

interface CartContextType {
  items: CartItem[];
  addToCart: (variantId: string, quantity: number) => Promise<void>;
  updateItem: (lineItemId: string, quantity: number) => Promise<void>;
  removeItem: (lineItemId: string) => Promise<void>;
  checkoutUrl: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  useEffect(() => {
    shopifyRequest<CheckoutCreateResponse>(CREATE_CHECKOUT)
      .then(data => {
        setCheckoutId(data.checkoutCreate.checkout.id);
        setCheckoutUrl(data.checkoutCreate.checkout.webUrl);
      })
      .catch(console.error);
  }, []);

  const normalize = (nodes: LineItemNode[]): CartItem[] =>
    nodes.map(n => ({
      id: n.id,
      title: n.title,
      quantity: n.quantity,
      price: {
        amount: n.variant.price.amount,
        currencyCode: n.variant.price.currencyCode,
      },
    }));

  const addToCart = async (variantId: string, quantity: number) => {
    if (!checkoutId) return;
    const data = await shopifyRequest<LineItemsResponse>(ADD_LINE_ITEMS, {
      checkoutId,
      lineItems: [{ variantId, quantity }],
    });
    const edges = data.checkoutLineItemsAdd!.checkout.lineItems.edges;
    setItems(normalize(edges.map(e => e.node)));
  };

  const updateItem = async (lineItemId: string, quantity: number) => {
    if (!checkoutId) return;
    const data = await shopifyRequest<LineItemsResponse>(UPDATE_LINE_ITEMS, {
      checkoutId,
      lineItems: [{ id: lineItemId, quantity }],
    });
    const edges = data.checkoutLineItemsUpdate!.checkout.lineItems.edges;
    setItems(normalize(edges.map(e => e.node)));
  };

  const removeItem = async (lineItemId: string) => {
    if (!checkoutId) return;
    const data = await shopifyRequest<LineItemsResponse>(REMOVE_LINE_ITEMS, {
      checkoutId,
      lineItemIds: [lineItemId],
    });
    const edges = data.checkoutLineItemsRemove!.checkout.lineItems.edges;
    setItems(normalize(edges.map(e => e.node)));
  };

  return (
    <CartContext.Provider
      value={{ items, addToCart, updateItem, removeItem, checkoutUrl }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
