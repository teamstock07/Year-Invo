import { PADDLE_CONFIG, getPaddlePriceId } from '../config/paddle';

declare global {
  interface Window {
    Paddle?: any;
  }
}

let isPaddleLoading = false;
let isPaddleInitialized = false;

/**
 * Dynamically loads the official Paddle.js Billing (v2) script from CDN.
 */
export const loadPaddleScript = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (window.Paddle) {
      resolve(window.Paddle);
      return;
    }

    if (isPaddleLoading) {
      const checkInterval = setInterval(() => {
        if (window.Paddle) {
          clearInterval(checkInterval);
          resolve(window.Paddle);
        }
      }, 100);
      return;
    }

    isPaddleLoading = true;
    const script = document.createElement('script');
    script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
    script.async = true;
    script.onload = () => {
      isPaddleLoading = false;
      resolve(window.Paddle);
    };
    script.onerror = () => {
      isPaddleLoading = false;
      reject(new Error('Failed to load Paddle.js checkout script. Please check your network connection.'));
    };
    document.head.appendChild(script);
  });
};

/**
 * Initializes Paddle.js with the client-side token and sets Sandbox environment.
 */
export const initializePaddle = async (): Promise<any> => {
  const Paddle = await loadPaddleScript();
  if (Paddle && !isPaddleInitialized) {
    if (PADDLE_CONFIG.environment === 'sandbox') {
      Paddle.Environment.set('sandbox');
    }
    if (PADDLE_CONFIG.clientToken) {
      Paddle.Initialize({
        token: PADDLE_CONFIG.clientToken,
      });
      isPaddleInitialized = true;
    }
  }
  return Paddle;
};

/**
 * Opens Paddle Checkout with the appropriate Price ID and associates current YearInvo user metadata.
 */
export const openPaddleCheckout = async (options: {
  plan: 'Pro' | 'Business' | 'Premium';
  billingCycle: 'monthly' | 'yearly';
  userId: string;
  userEmail: string;
  brandName?: string;
  onSuccess?: (data: any) => void;
  onClose?: () => void;
  onError?: (err: any) => void;
}) => {
  const priceId = getPaddlePriceId(options.plan, options.billingCycle);

  if (!PADDLE_CONFIG.clientToken) {
    throw new Error('Paddle Client Token is missing. Please set VITE_PADDLE_CLIENT_TOKEN in your environment variables.');
  }

  const Paddle = await initializePaddle();

  if (!Paddle || typeof Paddle.Checkout?.open !== 'function') {
    throw new Error('Paddle Checkout SDK could not be initialized. Please try refreshing the page.');
  }

  const targetPlan = options.plan === 'Business' ? 'Premium' : options.plan;

  Paddle.Checkout.open({
    items: [
      {
        priceId: priceId,
        quantity: 1,
      },
    ],
    customData: {
      userId: options.userId,
      userEmail: options.userEmail,
      requestedPlan: targetPlan,
      billingCycle: options.billingCycle,
      brandName: options.brandName || '',
    },
    customer: {
      email: options.userEmail,
    },
    settings: {
      displayMode: 'overlay',
      theme: 'dark',
      locale: 'en',
      successUrl: `${window.location.origin}/dashboard?payment=success`,
    },
  });
};
