'use client';

import { useEffect, useRef, useState } from 'react';

interface TrustedFormProps {
  onCertificateReady?: (certUrl: string, token: string) => void;
  onCertUrlReady?: (certUrl: string) => void;
  enableSandbox?: boolean;
  provideReferrer?: boolean;
  timeout?: number;
}

declare global {
  interface Window {
    field?: string;
    provideReferrer?: boolean;
    sandbox?: boolean;
    TF_READY?: boolean;
  }
}

const TrustedForm: React.FC<TrustedFormProps> = ({
  onCertificateReady,
  onCertUrlReady,
  enableSandbox = false,
  provideReferrer = false,
  timeout = 2000
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const certUrlRef = useRef<HTMLInputElement>(null);
  const tokenRef = useRef<HTMLInputElement>(null);

    const initTrustedForm = () => {
    // Avoid loading multiple times
    if (scriptRef.current || document.querySelector('script[src*="trustedform.js"]')) {
      return;
      }
      
      // Create script element
    const tf = document.createElement('script');
    tf.type = 'text/javascript';
    tf.async = true;
    tf.src = 'https://api.trustedform.com/trustedform.js';
    
    // Set configuration variables before loading script
    window.field = 'xxTrustedFormCertUrl';
    window.provideReferrer = provideReferrer;
    
    if (enableSandbox) {
      window.sandbox = true;
    }

    // Add load event listener
    tf.onload = () => {
      setIsLoaded(true);
    };

    tf.onerror = () => {
      console.error('Failed to load TrustedForm script');
    };

      // Insert script
    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(tf, firstScript);
      scriptRef.current = tf;
    }
  };

  const getCertificateData = (): Promise<{ certUrl: string; token: string }> => {
    return new Promise((resolve) => {
      const checkForCertificate = () => {
        const certUrl = certUrlRef.current?.value || '';
        const token = tokenRef.current?.value || '';
        
        if (certUrl) {
          resolve({ certUrl, token });
          return;
        }

        // Check again after a short delay
        setTimeout(checkForCertificate, 100);
      };

      // Start checking immediately
      checkForCertificate();

      // Fallback timeout
      setTimeout(() => {
        const certUrl = certUrlRef.current?.value || '';
        const token = tokenRef.current?.value || '';
        resolve({ certUrl, token });
      }, timeout);
    });
  };

  useEffect(() => {
    initTrustedForm();

    // Optional callbacks when certificate is ready
    if (onCertificateReady || onCertUrlReady) {
      const interval = setInterval(() => {
        const certUrl = certUrlRef.current?.value;
        const token = tokenRef.current?.value;
        
        if (certUrl) {
          // Call the appropriate callback
          if (onCertificateReady && token) {
            onCertificateReady(certUrl, token);
          } else if (onCertUrlReady) {
            onCertUrlReady(certUrl);
          }
          clearInterval(interval);
        }
      }, 500);

      // Clear interval after timeout
      setTimeout(() => clearInterval(interval), timeout + 1000);

      return () => clearInterval(interval);
    }
  }, [onCertificateReady, onCertUrlReady, timeout]);

  return (
    <>
      {/* TrustedForm hidden fields */}
      <input 
        type="hidden" 
        id="xxTrustedFormCertUrl_0" 
        name="xxTrustedFormCertUrl"
        ref={certUrlRef}
      />
      <input 
        type="hidden" 
        id="xxTrustedFormToken_0" 
        name="xxTrustedFormToken"
        ref={tokenRef}
      />
    </>
  );
};

// Hook to use TrustedForm functionality
export const useTrustedForm = (timeout: number = 2000) => {
  const getCertificateData = (): Promise<{ certUrl: string; token: string }> => {
    return new Promise((resolve) => {
      const certUrlElement = document.getElementById('xxTrustedFormCertUrl_0') as HTMLInputElement;
      const tokenElement = document.getElementById('xxTrustedFormToken_0') as HTMLInputElement;
      
      const checkForCertificate = () => {
        const certUrl = certUrlElement?.value || '';
        const token = tokenElement?.value || '';
        
        if (certUrl) {
          resolve({ certUrl, token });
          return;
        }

        // Check again after a short delay
        setTimeout(checkForCertificate, 100);
      };

      // Start checking immediately
      checkForCertificate();

      // Fallback timeout
      setTimeout(() => {
        const certUrl = certUrlElement?.value || '';
        const token = tokenElement?.value || '';
        resolve({ certUrl, token });
      }, timeout);
    });
  };

  return { getCertificateData };
};

export default TrustedForm;
