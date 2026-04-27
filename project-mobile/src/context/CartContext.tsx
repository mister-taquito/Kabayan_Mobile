import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
  useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { shopifyRequest } from '../api/shopify';

import { CREATE_CART, ADD_LINE_ITEMS, UPDATE_LINE_ITEMS, REMOVE_LINE_ITEMS } from '../lib/shopify/mutations/cart';
import { GET_CART } from '../lib/shopify/queries/cart';

/** ====== Minimal types for the Storefront Cart API ====== */
type Money = { amount: string; currencyCode: string };

type CartLineNode = {
  id: string;
  quantity: number;
  cost: {
    amountPerQuantity: Money;
    subtotalAmount: Money;
    totalAmount: Money;
  };
  merchandise: {
    // We only care about ProductVariant data used by UI
    id: string;            // variantId
    title: string;         // variant title (e.g., "Black / M")
    product: { title: string };
    price?: Money | null;      // optional convenience if your fragment includes it
    compareAtPrice?: Money | null;
    selectedOptions?: { name: string; value: string }[];
  };
};

type Cart = {
  id: string;
  checkoutUrl: string;
  lines: { edges: { node: CartLineNode }[] };
  // (other fields exist on ...CartFragment but not required here)
};

type CreateCartResponse = {
  cartCreate: {
    cart: Cart;
    userErrors?: { field?: string[]; message: string }[];
  };
};

type CartLinesAddResponse = {
  cartLinesAdd: { cart: Cart; userErrors?: { field?: string[]; message: string }[] };
};
type CartLinesUpdateResponse = {
  cartLinesUpdate: { cart: Cart; userErrors?: { field?: string[]; message: string }[] };
};
type CartLinesRemoveResponse = {
  cartLinesRemove: { cart: Cart; userErrors?: { field?: string[]; message: string }[] };
};

type GetCartResponse = { cart: Cart | null };

/** ====== Public UI model (kept close to your existing shape) ====== */
export interface CartItem {
  id: string; // CartLine.id
  title: string;
  quantity: number;
  price: Money; // unit price (from amountPerQuantity or merchandise.price)
}

/** ====== Context API ====== */
interface CartContextType {
  items: CartItem[];
  addToCart: (variantId: string, quantity?: number) => Promise<void>;
  updateItem: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  checkoutUrl: string | null;
  refresh: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const CART_ID_KEY = 'cart:v1:id';

const CartContext = createContext<CartContextType | undefined>(undefined);

/** Helpers */
function mapLinesToItems(lines: CartLineNode[]): CartItem[] {
  return lines.map((n) => ({
    id: n.id,
    // Prefer "Product title – Variant title" for clarity, but avoid "default Item"
    title: n.merchandise?.product?.title
      ? `${n.merchandise.product.title}${n.merchandise.title && n.merchandise.title !== 'Default Title' ? ` — ${n.merchandise.title}` : ''}`
      : (n.merchandise.title && n.merchandise.title !== 'Default Title' ? n.merchandise.title : 'Product'),
    quantity: n.quantity,
    // Use amountPerQuantity as the unit price; fall back to merchandise.price if your fragment includes it
    price: n.cost?.amountPerQuantity ?? (n.merchandise.price as Money),
  }));
}

async function saveCartId(id: string) {
  await AsyncStorage.setItem(CART_ID_KEY, id);
}
async function getSavedCartId() {
  return AsyncStorage.getItem(CART_ID_KEY);
}
async function clearCartId() {
  await AsyncStorage.removeItem(CART_ID_KEY);
}

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const creating = useRef(false);

  const inflate = useCallback((c: Cart) => {
    setCart(c);
    const lineNodes = c.lines?.edges?.map((e) => e.node) ?? [];
    setItems(mapLinesToItems(lineNodes));
    setCheckoutUrl(c.checkoutUrl ?? null);
  }, []);

  const fetchCart = useCallback(async (id: string) => {
    const data = await shopifyRequest<GetCartResponse>(GET_CART, { cartId: id });
    if (!data.cart) {
      // The cart ID may be stale (deleted/expired). Start fresh.
      await clearCartId();
      throw new Error('Cart not found. Creating a new cart…');
    }
    inflate(data.cart);
  }, [inflate]);

  const ensureCart = useCallback(async () => {
    if (creating.current) return;
    creating.current = true;
    try {
      const existing = await getSavedCartId();
      if (existing) {
        await fetchCart(existing);
        return;
      }
      const created = await shopifyRequest<CreateCartResponse>(CREATE_CART, { input: {} });
      const newCart = created.cartCreate.cart;
      await saveCartId(newCart.id);
      inflate(newCart);
    } finally {
      creating.current = false;
    }
  }, [fetchCart, inflate]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        await ensureCart();
      } catch (e: any) {
        setError(e?.message ?? String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [ensureCart]);

  const refresh = useCallback(async () => {
    const id = cart?.id ?? (await getSavedCartId());
    if (!id) return ensureCart();
    await fetchCart(id);
  }, [cart?.id, fetchCart, ensureCart]);

  const addToCart = useCallback(
    async (variantId: string, quantity = 1) => {
      const id = cart?.id ?? (await getSavedCartId());
      if (!id) {
        await ensureCart();
        return addToCart(variantId, quantity);
      }
      const data = await shopifyRequest<CartLinesAddResponse>(ADD_LINE_ITEMS, {
        cartId: id,
        lines: [{ merchandiseId: variantId, quantity }],
      });
      inflate(data.cartLinesAdd.cart);
    },
    [cart?.id, inflate, ensureCart]
  );

  const updateItem = useCallback(
    async (lineId: string, quantity: number) => {
      if (!cart) return;
      const data = await shopifyRequest<CartLinesUpdateResponse>(UPDATE_LINE_ITEMS, {
        cartId: cart.id,
        lines: [{ id: lineId, quantity }],
      });
      inflate(data.cartLinesUpdate.cart);
    },
    [cart, inflate]
  );

  const removeItem = useCallback(
    async (lineId: string) => {
      if (!cart) return;
      const data = await shopifyRequest<CartLinesRemoveResponse>(REMOVE_LINE_ITEMS, {
        cartId: cart.id,
        lineIds: [lineId],
      });
      inflate(data.cartLinesRemove.cart);
    },
    [cart, inflate]
  );

  const value = useMemo<CartContextType>(
    () => ({
      items,
      addToCart,
      updateItem,
      removeItem,
      checkoutUrl,
      refresh,
      loading,
      error,
    }),
    [items, addToCart, updateItem, removeItem, checkoutUrl, refresh, loading, error]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

/** Hook exports */
export const useCart = (): CartContextType => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
// Optional alias if other files imported useCartContext earlier:
export const useCartContext = useCart;
