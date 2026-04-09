import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/auth';
import Spinner from '../../components/ui/Spinner';

export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    const errorParam = searchParams.get('error');

    // If there's an error from OAuth provider
    if (errorParam) {
      setError(errorParam);
      setTimeout(() => navigate('/login', { state: { oauthError: errorParam } }), 3000);
      return;
    }

    if (!token) {
      navigate('/login');
      return;
    }

    // Verify token and get user info
    const verifyToken = async () => {
      try {
        const { data } = await authApi.me(token);
        setAuth(token, data);
        navigate('/dashboard');
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError('Failed to verify authentication. Please try again.');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    verifyToken();
  }, [searchParams, navigate, setAuth]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-light dark:bg-bg-dark">
        <div className="max-w-md rounded-xl bg-surface-light p-8 shadow-lg dark:bg-surface-dark">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/20">
              <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          <h2 className="mb-2 text-center text-xl font-semibold text-gray-900 dark:text-white">
            Authentication Failed
          </h2>
          <p className="mb-4 text-center text-gray-600 dark:text-gray-400">
            {error}
          </p>
          <p className="text-center text-sm text-gray-500 dark:text-gray-500">
            Redirecting to login page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-light dark:bg-bg-dark">
      <div className="text-center">
        <Spinner />
        <p className="mt-4 text-gray-600 dark:text-gray-400">Completing sign in...</p>
      </div>
    </div>
  );
}
