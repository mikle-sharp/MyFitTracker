'use client';

import { useEffect, useState } from 'react';

export default function GoogleCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const error = params.get('error');

      if (error) {
        setStatus('error');
        setError(error);
        return;
      }

      if (!code) {
        setStatus('error');
        setError('No authorization code');
        return;
      }

      try {
        // Exchange code for tokens
        const response = await fetch(`/api/google-auth?action=callback&code=${encodeURIComponent(code)}`);
        const data = await response.json();

        if (data.error) {
          setStatus('error');
          setError(data.error);
          return;
        }

        // Send data back to opener window
        if (window.opener) {
          window.opener.postMessage({
            type: 'GOOGLE_AUTH_CALLBACK',
            ...data,
          }, '*');
          
          setStatus('success');
          
          // Close popup after short delay
          setTimeout(() => {
            window.close();
          }, 1000);
        } else {
          // If no opener, redirect to main page
          const basePath = process.env.NODE_ENV === 'production' ? '/MyFitTracker' : '';
          window.location.href = basePath + '/';
        }
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-zinc-400">Авторизация...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-emerald-400">Авторизация успешна!</p>
            <p className="text-zinc-500 text-sm mt-1">Это окно закроется автоматически</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-red-400">Ошибка авторизации</p>
            <p className="text-zinc-500 text-sm mt-1">{error}</p>
          </>
        )}
      </div>
    </div>
  );
}
