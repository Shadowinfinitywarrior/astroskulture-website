/**
 * Maps backend error messages or codes to user-friendly messages.
 * @param error The error object or message string.
 * @returns A user-friendly error message string.
 */
export const getFriendlyErrorMessage = (error: any): string => {
    // Extract the message from various error formats
    const message = error?.message || error?.error || error?.toString() || 'An unexpected error occurred';
    const status = error?.status;

    // Authentication errors - Registration (HTTP 400)
    if (message.includes('User already exists') ||
        message.includes('Email already in use') ||
        message.includes('already exists with this email')) {
        return 'User already registered. Please sign in instead.';
    }

    // Authentication errors - Login (HTTP 401)
    if (message.includes('Invalid credentials') ||
        message.includes('Incorrect email or password') ||
        status === 401) {
        return 'The email or password you entered is incorrect. Please try again.';
    }

    // User not found
    if (message.includes('User not found') || message.includes('Account not found')) {
        return 'We couldn\'t find an account with that information.';
    }

    // Password validation errors
    if (message.includes('Password') && (message.includes('short') || message.includes('least'))) {
        return 'Your password is too short. It must be at least 6 characters long.';
    }
    if (message.includes('Password') && message.includes('required')) {
        return 'Password is required.';
    }

    // Email/Username validation errors
    if (message.includes('Email') && message.includes('required')) {
        return 'Email address is required.';
    }
    if (message.includes('Username') && message.includes('required')) {
        return 'Username is required.';
    }
    if (message.includes('Email') && message.includes('invalid')) {
        return 'Please enter a valid email address.';
    }

    // Required fields
    if (message.includes('required') && message.includes('name')) {
        return 'Full name is required.';
    }

    // Authorization errors (HTTP 403)
    if (status === 403 || message.includes('Forbidden') || message.includes('not authorized')) {
        return 'You don\'t have permission to perform this action.';
    }

    // Network/Server errors
    if (message.includes('Network Error') ||
        message.includes('Failed to fetch') ||
        message.includes('Cannot connect')) {
        return 'We\'re having trouble connecting to the server. Please check your internet connection and try again.';
    }

    // Server errors (HTTP 500)
    if (status === 500 ||
        message.includes('500') ||
        message.includes('Internal Server Error') ||
        message.includes('Server error')) {
        return 'Something went wrong on our end. Please try again later.';
    }

    // Generic HTTP errors - only show if we don't have a better message
    if (message.match(/^HTTP \d{3}$/) || message.match(/^API request failed: \d{3}/)) {
        if (status === 400) return 'Invalid request. Please check your information and try again.';
        if (status === 404) return 'The requested resource was not found.';
        return 'An error occurred. Please try again.';
    }

    // Default fallback - return the original message if it's descriptive
    return message;
};
