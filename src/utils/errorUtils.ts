/**
 * Maps backend error messages or codes to user-friendly messages.
 * @param error The error object or message string.
 * @returns A user-friendly error message string.
 */
export const getFriendlyErrorMessage = (error: any): string => {
    const message = error?.message || error?.toString() || 'An unexpected error occurred';

    // Common authentication errors
    if (message.includes('Invalid credentials') || message.includes('Incorrect email or password')) {
        return 'The email or password you entered is incorrect. Please try again.';
    }
    if (message.includes('User not found')) {
        return 'We couldn\'t find an account with that email address.';
    }
    if (message.includes('User already exists') || message.includes('Email already in use')) {
        return 'An account with this email address already exists. Please sign in instead.';
    }
    if (message.includes('Password') && message.includes('short')) {
        return 'Your password is too short. It must be at least 6 characters long.';
    }

    // Network/Server errors
    if (message.includes('Network Error') || message.includes('Failed to fetch')) {
        return 'We\'re having trouble connecting to the server. Please check your internet connection and try again.';
    }
    if (message.includes('500') || message.includes('Internal Server Error')) {
        return 'Something went wrong on our end. Please try again later.';
    }

    // Default fallback
    return message;
};
