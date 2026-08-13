import { PADDLE_CONFIG, getPaddlePriceId } from '../config/paddle';

declare global {
  interface window {
    Paddle?: any;
  }
}

let paddleInitPromise: Promise<any> | null = null;
let isPaddleInitialized = false;

/**
 * Dynamically loads official Paddle.js Billing (v2) from CDN and initializes it once.
 */
export const initializePaddle = (): Promise<any> => {
  if (paddleInitPromise) {
    return paddleInitPromise;
  }

  paddleInitPromise = new Promise((resolve, reject) => {
    const clientToken = PADDLE_CONFIG.clientToken;

    if (!clientToken) {
      const err = new Error('VITE_PADDLE_CLIENT_TOKEN environment variable is missing.');
      console.error('[PADDLE DEBUG] Initialization Failed:', err.message);
      paddleInitPromise = null;
      reject(err);
      return;
    }

    const setupPaddleInstance = (PaddleInstance: any) => {
      try {
        if (!isPaddleInitialized) {
          // Set Sandbox Environment if configured
          if (PADDLE_CONFIG.environment === 'sandbox') {
            if (typeof PaddleInstance.Environment?.set === 'function') {
              PaddleInstance.Environment.set('sandbox');
            } else {
              console.warn('[PADDLE DEBUG] Warning: Paddle.Environment.set is not a function on window.Paddle');
            }
          }

          // Initialize Paddle v2
          if (typeof PaddleInstance.Initialize === 'function') {
            PaddleInstance.Initialize({
              token: clientToken,
              eventCallback: (event: any) => {
                const eventName = event?.name || event?.type || 'event';
                console.log(`[PADDLE DEBUG] Paddle Event: ${eventName}`, event);
                if (eventName === 'checkout.error' || eventName === 'error') {
                  console.error('[PADDLE DEBUG] Paddle Checkout Error Event:', event);
                }
              },
            });
            isPaddleInitialized = true;
            console.log('[PADDLE DEBUG] Paddle.js v2 successfully initialized.', {
              environment: PADDLE_CONFIG.environment,
              tokenPrefix: clientToken ? clientToken.slice(0, 5) : 'none',
            });
          } else {
            throw new Error('Paddle.Initialize is not available on loaded Paddle SDK.');
          }
        }
        resolve(PaddleInstance);
      } catch (initErr) {
        console.error('[PADDLE DEBUG] Setup Error:', initErr);
        paddleInitPromise = null;
        reject(initErr);
      }
    };

    if ((window as any).Paddle) {
      setupPaddleInstance((window as any).Paddle);
      return;
    }

    // Load Paddle Billing v2 CDN Script
    const script = document.createElement('script');
    script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
    script.async = true;
    script.onload = () => {
      if ((window as any).Paddle) {
        setupPaddleInstance((window as any).Paddle);
      } else {
        paddleInitPromise = null;
        const err = new Error('Paddle SDK loaded from CDN but window.Paddle is undefined.');
        console.error('[PADDLE DEBUG] CDN Load Error:', err);
        reject(err);
      }
    };
    script.onerror = (e) => {
      paddleInitPromise = null;
      const err = new Error('Failed to load Paddle.js CDN script (https://cdn.paddle.com/paddle/v2/paddle.js).');
      console.error('[PADDLE DEBUG] Script Network Error:', e);
      reject(err);
    };

    document.head.appendChild(script);
  });

  return paddleInitPromise;
};

export interface OpenCheckoutOptions {
  plan: 'Pro' | 'Business' | 'Premium';
  billingCycle: 'monthly' | 'yearly';
  userId: string;
  userEmail: string;
  brandName?: string;
  onSuccess?: (data: any) => void;
  onClose?: () => void;
  onError?: (err: any) => void;
}

/**
 * Pre-flight validation and launch for Paddle Checkout overlay
 */
export const openPaddleCheckout = async (options: OpenCheckoutOptions): Promise<void> => {
  const priceId = getPaddlePriceId(options.plan, options.billingCycle);

  // --- Pre-flight Diagnostics & Debug Logging ---
  const tokenPresent = Boolean(PADDLE_CONFIG.clientToken);
  const tokenPrefix = PADDLE_CONFIG.clientToken ? PADDLE_CONFIG.clientToken.slice(0, 5) : 'none';
  const isSandbox = PADDLE_CONFIG.environment === 'sandbox';
  const isPriceIdValid = Boolean(priceId && priceId.startsWith('pri_'));
  const isUserAuthenticated = Boolean(options.userId && options.userEmail);

  console.log('[PADDLE DEBUG]', {
    environment: PADDLE_CONFIG.environment,
    tokenPresent,
    tokenPrefix,
    selectedPriceId: priceId,
    paddleInitialized: isPaddleInitialized,
    checkoutAttempt: {
      plan: options.plan,
      billingCycle: options.billingCycle,
      userId: options.userId,
      userEmail: options.userEmail,
      origin: window.location.origin,
      hostname: window.location.hostname,
    },
  });

  if (!tokenPresent) {
    const err = new Error('VITE_PADDLE_CLIENT_TOKEN environment variable is missing.');
    console.error('[PADDLE DEBUG] checkoutError:', err.message);
    throw err;
  }

  if (isSandbox && !tokenPrefix.startsWith('test_')) {
    console.warn(
      '[PADDLE DEBUG] Environment Mismatch Warning: Environment is "sandbox" but clientToken prefix is not "test_".'
    );
  } else if (!isSandbox && !tokenPrefix.startsWith('live_')) {
    console.warn(
      '[PADDLE DEBUG] Environment Mismatch Warning: Environment is "production" but clientToken prefix is not "live_".'
    );
  }

  if (!isPriceIdValid) {
    const err = new Error(`Invalid Price ID "${priceId}". Price IDs must start with "pri_".`);
    console.error('[PADDLE DEBUG] checkoutError:', err.message);
    throw err;
  }

  if (!isUserAuthenticated) {
    const err = new Error('User is not authenticated. Cannot attach custom user data to checkout.');
    console.error('[PADDLE DEBUG] checkoutError:', err.message);
    throw err;
  }

  try {
    const Paddle = await initializePaddle();

    if (!Paddle || typeof Paddle.Checkout?.open !== 'function') {
      throw new Error('Paddle.Checkout.open method is unavailable on window.Paddle SDK.');
    }

    const targetPlan = options.plan === 'Business' ? 'Premium' : options.plan;

    const checkoutConfig: any = {
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
      },
    };

    console.log('[PADDLE DEBUG] Opening Paddle Checkout with config:', checkoutConfig);

    Paddle.Checkout.open(checkoutConfig);
    console.log('[PADDLE DEBUG] Paddle.Checkout.open invoked.');
  } catch (checkoutErr: any) {
    const actualErrorMsg = checkoutErr?.message || String(checkoutErr);
    console.error('[PADDLE DEBUG] checkoutError:', checkoutErr);
    // Display the actual technical error to caller and console rather than replacing it with generic text
    throw new Error(actualErrorMsg);
  }
};

