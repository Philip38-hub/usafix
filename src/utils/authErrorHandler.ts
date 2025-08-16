import { AuthError } from '@/contexts/CivicAuthContext';

export class AuthErrorHandler {
  static handleCivicAuthError(error: any): AuthError {
    // Handle specific Civic Auth error codes
    switch (error.code) {
      case 'USER_CANCELLED':
        return {
          type: 'civic_auth_error',
          message: 'Authentication was cancelled by user',
          code: error.code,
          retryable: true,
        };
      case 'NETWORK_ERROR':
        return {
          type: 'network_error',
          message: 'Network connection issue. Please check your internet connection.',
          code: error.code,
          retryable: true,
        };
      case 'INVALID_CLIENT_ID':
        return {
          type: 'validation_error',
          message: 'Invalid Civic Auth configuration. Please contact support.',
          code: error.code,
          retryable: false,
        };
      case 'VERIFICATION_FAILED':
        return {
          type: 'civic_auth_error',
          message: 'Identity verification failed. Please try again.',
          code: error.code,
          retryable: true,
        };
      default:
        return {
          type: 'civic_auth_error',
          message: error.message || 'Civic Auth error occurred',
          code: error.code,
          retryable: true,
        };
    }
  }

  static handleSupabaseError(error: any): AuthError {
    // Handle specific Supabase error codes
    switch (error.error_code || error.status) {
      case 'invalid_credentials':
        return {
          type: 'supabase_error',
          message: 'Invalid email or password',
          code: error.error_code,
          retryable: false,
        };
      case 'email_not_confirmed':
        return {
          type: 'supabase_error',
          message: 'Please check your email and click the confirmation link',
          code: error.error_code,
          retryable: false,
        };
      case 'signup_disabled':
        return {
          type: 'supabase_error',
          message: 'New user registration is currently disabled',
          code: error.error_code,
          retryable: false,
        };
      case 'too_many_requests':
        return {
          type: 'supabase_error',
          message: 'Too many requests. Please wait a moment and try again.',
          code: error.error_code,
          retryable: true,
        };
      default:
        return {
          type: 'supabase_error',
          message: error.message || 'Authentication service error',
          code: error.error_code || error.status,
          retryable: error.status !== 400,
        };
    }
  }

  static handleNetworkError(error: any): AuthError {
    return {
      type: 'network_error',
      message: 'Network connection issue. Please check your internet connection and try again.',
      code: 'NETWORK_ERROR',
      retryable: true,
    };
  }

  static displayUserFriendlyMessage(error: AuthError): string {
    switch (error.type) {
      case 'civic_auth_error':
        if (error.code === 'USER_CANCELLED') {
          return 'Authentication was cancelled. Please try again when ready.';
        }
        if (error.code === 'VERIFICATION_FAILED') {
          return 'Identity verification failed. Please ensure your identity documents are valid and try again.';
        }
        return 'There was an issue with Civic authentication. Please try again or use email/password login.';
      
      case 'supabase_error':
        if (error.code === 'invalid_credentials') {
          return 'Invalid email or password. Please check your credentials and try again.';
        }
        if (error.code === 'email_not_confirmed') {
          return 'Please check your email and click the confirmation link before signing in.';
        }
        return 'Authentication service is temporarily unavailable. Please try again in a moment.';
      
      case 'network_error':
        return 'Network connection issue. Please check your internet connection and try again.';
      
      case 'validation_error':
        return 'Please check your input and try again. If the problem persists, contact support.';
      
      default:
        return 'An unexpected error occurred. Please try again or contact support if the issue persists.';
    }
  }

  static getRetryDelay(error: AuthError): number {
    // Return delay in milliseconds for retryable errors
    switch (error.type) {
      case 'network_error':
        return 3000; // 3 seconds
      case 'civic_auth_error':
        return 1000; // 1 second
      case 'supabase_error':
        if (error.code === 'too_many_requests') {
          return 10000; // 10 seconds
        }
        return 2000; // 2 seconds
      default:
        return 1000; // 1 second
    }
  }

  static shouldShowRetryButton(error: AuthError): boolean {
    return error.retryable && error.type !== 'validation_error';
  }

  static logError(error: AuthError, context?: string): void {
    const logData = {
      type: error.type,
      message: error.message,
      code: error.code,
      retryable: error.retryable,
      context: context || 'unknown',
      timestamp: new Date().toISOString(),
    };

    // In development, log to console
    if (import.meta.env.DEV) {
      console.error('Auth Error:', logData);
    }

    // In production, you might want to send to an error tracking service
    // Example: Sentry.captureException(new Error(error.message), { extra: logData });
  }
}