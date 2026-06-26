'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [unsubscribed, setUnsubscribed] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid unsubscribe link.');
      setLoading(false);
      return;
    }

    axios.get(`/api/unsubscribe?token=${token}`)
      .then(({ data }) => {
        setEmail(data.email);
        setName(data.name);
        setUnsubscribed(data.unsubscribed);
      })
      .catch(() => setError('Invalid or expired unsubscribe link.'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleAction = async (action: 'unsubscribe' | 'resubscribe') => {
    setProcessing(true);
    try {
      const { data } = await axios.post('/api/unsubscribe', { token, action });
      setUnsubscribed(data.unsubscribed);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">TrackTok</h1>
          <p className="text-sm text-gray-400 uppercase tracking-widest">Email Preferences</p>
        </div>

        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : error ? (
          <div>
            <p className="text-red-600 mb-4">{error}</p>
            <a href="/" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Go to TrackTok</a>
          </div>
        ) : unsubscribed ? (
          <div>
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📭</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">You're unsubscribed</h2>
            <p className="text-sm text-gray-500 mb-1">
              <strong>{email}</strong> will no longer receive marketing emails from TrackTok.
            </p>
            <p className="text-xs text-gray-400 mb-6">
              You'll still receive transactional emails like password resets and direct reminders you've set up.
            </p>
            <button
              onClick={() => handleAction('resubscribe')}
              disabled={processing}
              className="px-6 py-2 text-sm font-medium text-indigo-600 border border-indigo-200 hover:bg-indigo-50 rounded-lg disabled:opacity-50 transition-colors"
            >
              {processing ? 'Processing...' : 'Re-subscribe'}
            </button>
          </div>
        ) : (
          <div>
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📬</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Unsubscribe from emails?</h2>
            <p className="text-sm text-gray-500 mb-6">
              {name ? `Hi ${name}, you` : 'You'} will stop receiving marketing and insight emails at <strong>{email}</strong>.
              Transactional emails (reminders, password resets) will still be sent.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => handleAction('unsubscribe')}
                disabled={processing}
                className="px-6 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 transition-colors"
              >
                {processing ? 'Processing...' : 'Unsubscribe'}
              </button>
              <a
                href="/"
                className="px-6 py-2 text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors inline-block"
              >
                Cancel
              </a>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            <a href="https://www.tracktok.com" className="text-gray-500 hover:text-gray-700">TrackTok</a>
            {' · '}
            A product by <a href="https://www.thewebvale.com" className="text-gray-500 hover:text-gray-700">TheWebVale</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <p className="text-gray-400">Loading...</p>
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  );
}
