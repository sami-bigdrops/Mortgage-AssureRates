'use client';

import { useCallback, useEffect, useRef } from 'react';

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
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const certUrlRef = useRef<HTMLInputElement>(null);
  const tokenRef = useRef<HTMLInputElement>(null);

  const initTrustedForm = useCallback(() => {
    if (scriptRef.current || document.querySelector('script[src*="trustedform.js"]')) {
      return;
    }

    const tf = document.createElement('script');
    tf.type = 'text/javascript';
    tf.async = true;
    tf.src = 'https://api.trustedform.com/trustedform.js';

    window.field = 'xxTrustedFormCertUrl';
    window.provideReferrer = provideReferrer;

    if (enableSandbox) {
      window.sandbox = true;
    }

    tf.onload = () => {};

    tf.onerror = () => {
      console.error('Failed to load TrustedForm script');
    };

    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(tf, firstScript);
      scriptRef.current = tf;
    }
  }, [enableSandbox, provideReferrer]);

  useEffect(() => {
    initTrustedForm();

    if (onCertificateReady || onCertUrlReady) {
      const interval = setInterval(() => {
        const certUrl = certUrlRef.current?.value;
        const token = tokenRef.current?.value;

        if (certUrl) {
          if (onCertificateReady && token) {
            onCertificateReady(certUrl, token);
          } else if (onCertUrlReady) {
            onCertUrlReady(certUrl);
          }
          clearInterval(interval);
        }
      }, 500);

      setTimeout(() => clearInterval(interval), timeout + 1000);

      return () => clearInterval(interval);
    }
  }, [initTrustedForm, onCertificateReady, onCertUrlReady, timeout]);

  return (
    <>
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

        setTimeout(checkForCertificate, 100);
      };

      checkForCertificate();

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
