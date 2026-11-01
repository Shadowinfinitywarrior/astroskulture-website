// src/lib/analytics.ts
// Unified tracking helper for Google Analytics 4 and Meta Pixel

declare global {
  interface Window {
    gtag?: (...a: any[]) => void;
    fbq?: (...a: any[]) => void;
    dataLayer?: any[];
  }
}

export interface TrackItem {
  id: string; // variant id: `${productId}_${size}`
  groupId: string; // product _id, used as item_group_id
  name: string;
  price: number; // final selling price in INR
  quantity?: number;
  category?: string;
  variant?: string; // size
}

const CURRENCY = 'INR';
const newId = () => crypto.randomUUID();

const toGa = (i: TrackItem) => ({
  item_id: i.id,
  item_name: i.name,
  price: i.price,
  quantity: i.quantity ?? 1,
  item_brand: 'ASTROS KULTURE',
  item_category: i.category,
  item_variant: i.variant,
});

const META_MAP: Record<string, string> = {
  view_item: 'ViewContent',
  add_to_cart: 'AddToCart',
  add_to_wishlist: 'AddToWishlist',
  begin_checkout: 'InitiateCheckout',
  add_payment_info: 'AddPaymentInfo',
  purchase: 'Purchase',
  search: 'Search',
  sign_up: 'CompleteRegistration',
};

/**
 * Send SPA PageView event to GA4 and Meta Pixel
 */
export function pageView(path: string) {
  if (typeof window === 'undefined') return;
  const url = window.location.origin + path;
  window.gtag?.('event', 'page_view', {
    page_path: path,
    page_location: url,
    page_title: document.title,
  });
  window.fbq?.('track', 'PageView', {}, { eventID: newId() });
}

/**
 * Track e-commerce events across GA4 and Meta Pixel with deduplication eventId
 */
export function trackEcommerce(
  name: keyof typeof META_MAP,
  items: TrackItem[],
  opts: {
    value?: number;
    transactionId?: string;
    eventId?: string;
    searchTerm?: string;
    contentType?: 'product' | 'product_group';
  } = {}
) {
  if (typeof window === 'undefined') return '';
  const eventId = opts.eventId ?? newId();
  const value = opts.value ?? items.reduce((s, i) => s + i.price * (i.quantity ?? 1), 0);
  const contentType = opts.contentType ?? (name === 'view_item' ? 'product_group' : 'product');

  // 1. Google Analytics 4
  window.gtag?.('event', name, {
    currency: CURRENCY,
    value,
    items: items.map(toGa),
    ...(opts.transactionId && { transaction_id: opts.transactionId }),
    ...(opts.searchTerm && { search_term: opts.searchTerm }),
  });

  // 2. Meta Pixel
  const metaEvent = META_MAP[name];
  if (metaEvent) {
    window.fbq?.('track', metaEvent, {
      currency: CURRENCY,
      value,
      content_type: contentType,
      content_ids: items.map(i => i.id),
      contents: items.map(i => ({
        id: i.id,
        quantity: i.quantity ?? 1,
        item_price: i.price,
      })),
      num_items: items.reduce((s, i) => s + (i.quantity ?? 1), 0),
      ...(opts.searchTerm && { search_string: opts.searchTerm }),
    }, { eventID: eventId });
  }

  return eventId; // returned so backend CAPI can use the exact same eventId
}

/**
 * Consent management for GDPR / India DPDP Act
 */
export function getConsent(): 'granted' | 'denied' | 'unset' {
  if (typeof window === 'undefined') return 'unset';
  const val = localStorage.getItem('astros_cookie_consent');
  if (val === 'granted' || val === 'denied') return val;
  return 'unset';
}

export function updateConsent(granted: boolean) {
  if (typeof window === 'undefined') return;
  const status = granted ? 'granted' : 'denied';
  localStorage.setItem('astros_cookie_consent', status);

  if (granted) {
    window.gtag?.('consent', 'update', {
      analytics_storage: 'granted',
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
    });
    window.fbq?.('consent', 'grant');
  } else {
    window.gtag?.('consent', 'update', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
    window.fbq?.('consent', 'revoke');
  }
}

// Helper to get cookie by name (_fbp, _fbc)
export function getCookie(name: string): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : '';
}
