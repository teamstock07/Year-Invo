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
      console.error('[Paddle Initialization Failed]: Client token is missing.');
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
              console.warn('[Paddle Warning]: Paddle.Environment.set is not a function on window.Paddle');
            }
          }

          // Initialize Paddle v2
          if (typeof PaddleInstance.Initialize === 'function') {
            PaddleInstance.Initialize({
              token: clientToken,
              eventCallback: (event: any) => {
                if (process.env.NODE_ENV !== 'production') {
                  console.log('[Paddle Checkout Event]:', event?.name || event?.type || event);
                }
              },
            });
            isPaddleInitialized = true;
            console.log('[Paddle Service]: Paddle.js v2 successfully initialized in sandbox mode.');
          } else {
            throw new Error('Paddle.Initialize is not available on loaded Paddle SDK.');
          }
        }
        resolve(PaddleInstance);
      } catch (initErr) {
        console.error('[Paddle Setup Error]:', initErr);
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
        console.error('[Paddle Load Error]:', err);
        reject(err);
      }
    };
    script.onerror = (e) => {
      paddleInitPromise = null;
      const err = new Error('Failed to load Paddle.js CDN script (https://cdn.paddle.com/paddle/v2/paddle.js).');
      console.error('[Paddle Network Error]:', e);
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

  // --- Pre-flight Checks (Requirement 10) ---
  const tokenExists = Boolean(PADDLE_CONFIG.clientToken);
  const isSandbox = PADDLE_CONFIG.environment === 'sandbox';
  const priceExists = Boolean(priceId);
  const isPriceIdValid = Boolean(priceId && priceId.startsWith('pri_'));
  const isUserAuthenticated = Boolean(options.userId && options.userEmail);

  if (!tokenExists || !isPriceIdValid || !isUserAuthenticated) {
    const errorDetails = {
      tokenExists,
      isSandbox,
      priceExists,
      isPriceIdValid,
      priceId,
      isUserAuthenticated,
      environment: PADDLE_CONFIG.environment,
      currentOrigin: window.location.origin,
      hostname: window.location.hostname,
    };

    console.error('[Paddle Checkout Validation Failed]:', errorDetails);

    if (!isUserAuthenticated) {
      throw new Error('Please log in to your account before upgrading your subscription.');
    }
    if (!tokenExists) {
      throw new Error('Payment gateway token is not configured. Please contact support or try again later.');
    }
    if (!isPriceIdValid) {
      throw new Error('Invalid subscription Price ID configured. Expected prefix "pri_".');
    }
  }

  // Check token prefix vs environment consistency (Requirement 12)
  if (isSandbox && PADDLE_CONFIG.clientToken && !PADDLE_CONFIG.clientToken.startsWith('test_')) {
    console.warn(
      '[Paddle Environment Mismatch Warning]: Sandbox environment is configured, but VITE_PADDLE_CLIENT_TOKEN does not start with "test_".'
    );
  }

  try {
    const Paddle = await initializePaddle();

    if (!Paddle || typeof Paddle.Checkout?.open !== 'function') {
      throw new Error('Paddle.Checkout.open method is unavailable on Paddle SDK.');
    }

    const targetPlan = options.plan === 'Business' ? 'Premium' : options.plan;

    console.log('[Paddle Opening Checkout]:', {
      priceId,
      plan: targetPlan,
      billingCycle: options.billingCycle,
      userEmail: options.userEmail,
      origin: window.location.origin,
    });

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
      },
    });
  } catch (checkoutErr: any) {
    // Diagnostic logging (Requirement 9 & 11)
    console.error('[Paddle Checkout Diagnostic Log]:', {
      environment: PADDLE_CONFIG.environment,
      hasClientToken: Boolean(PADDLE_CONFIG.clientToken),
      clientTokenPrefix: PADDLE_CONFIG.clientToken ? PADDLE_CONFIG.clientToken.slice(0, 7) + '...' : 'none',
      selectedPriceId: priceId,
      paddleLoaded: Boolean((window as any).Paddle),
      paddleInitialized: isPaddleInitialized,
      currentHostname: window.location.hostname,
      currentOrigin: window.location.origin,
      error: checkoutErr?.message || checkoutErr,
    });

    throw new Error('Unable to open secure payment checkout. Please try again.');
  }
};
