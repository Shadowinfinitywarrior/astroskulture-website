import { useState } from 'react';
import { Mail, Calendar, HelpCircle, Lock, ArrowLeft } from 'lucide-react';
import { apiService } from '../lib/mongodb';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface ForgotPasswordPageProps {
  onNavigate: (page: string) => void;
}

export function ForgotPasswordPage({ onNavigate }: ForgotPasswordPageProps) {
  const [step, setStep] = useState<'email' | 'verify' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiService.request('/auth/forgot-password/question', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      if (response.success) {
        setSecurityQuestion(response.securityQuestion);
        setStep('verify');
      } else {
        setError(response.message || 'Failed to retrieve security question');
      }
    } catch (err: any) {
      setError(err.message || 'User not found or security questions not set up');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiService.request('/auth/forgot-password/verify', {
        method: 'POST',
        body: JSON.stringify({
          email,
          dateOfBirth,
          securityAnswer,
        }),
      });

      if (response.success) {
        setResetToken(response.resetToken);
        setStep('reset');
      } else {
        setError(response.message || 'Verification failed');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check your answers.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await apiService.request('/auth/forgot-password/reset', {
        method: 'POST',
        body: JSON.stringify({
          resetToken,
          newPassword,
        }),
      });

      if (response.success) {
        setSuccess('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          onNavigate('login');
        }, 2000);
      } else {
        setError(response.message || 'Failed to reset password');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 rounded-full mb-4 border-2 border-slate-900 overflow-hidden">
              <img 
                src="/logo.png" 
                alt="Astros Kulture Logo" 
                className="w-10 h-10 object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Forgot Password</h1>
            <p className="text-slate-600">
              {step === 'email' && 'Enter your email to continue'}
              {step === 'verify' && 'Verify your identity'}
              {step === 'reset' && 'Create a new password'}
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-6">
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          {/* Step 1: Email */}
          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-colors"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors shadow-lg"
              >
                Continue
              </button>
            </form>
          )}

          {/* Step 2: Verify Security Questions */}
          {step === 'verify' && (
            <form onSubmit={handleVerifySubmit} className="space-y-6">
              <div>
                <label htmlFor="dob" className="block text-sm font-medium text-slate-700 mb-2">
                  Date of Birth
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="dob"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="securityAnswer" className="block text-sm font-medium text-slate-700 mb-2">
                  Security Question
                </label>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-3">
                  <p className="text-sm text-slate-700 flex items-start gap-2">
                    <HelpCircle className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span>{securityQuestion}</span>
                  </p>
                </div>
                <input
                  id="securityAnswer"
                  type="text"
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-colors"
                  placeholder="Your answer"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors shadow-lg"
              >
                Verify
              </button>

              <button
                type="button"
                onClick={() => setStep('email')}
                className="w-full text-slate-600 py-2 rounded-lg font-medium hover:text-slate-900 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            </form>
          )}

          {/* Step 3: Reset Password */}
          {step === 'reset' && (
            <form onSubmit={handleResetSubmit} className="space-y-6">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-colors"
                    placeholder="Enter new password"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-colors"
                    placeholder="Confirm new password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors shadow-lg"
              >
                Reset Password
              </button>
            </form>
          )}

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <button
              onClick={() => onNavigate('login')}
              className="text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}