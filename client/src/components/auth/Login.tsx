import React, { useState, ChangeEvent, FormEvent } from 'react';
import config from "../../config";
import axios from 'axios';

// Define the form data type for signin
interface LoginFormData {
    username: string;
    password: string;
}

const LoginPage: React.FC = () => {
    // Initialize form state
    const [formData, setFormData] = useState<LoginFormData>({
        username: '',
        password: '',
    });

    // State for form submission status and errors
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitMessage, setSubmitMessage] = useState<string>('');

    // Handle input changes for text fields
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });

        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };

    // Validate form before submission
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Required field validation
        if (!formData.username.trim()) newErrors.username = 'Username or email is required';
        if (!formData.password) newErrors.password = 'Password is required';

        // Set errors and return validation result
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // Validate form
        if (!validateForm()) return;

        setIsLoading(true);
        setSubmitMessage('');

        try {
            // Send the login request
            const response = await axios.post(
                `${config.API_BASE_URL}/login`,
                formData,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Handle successful login
            setSubmitMessage('Login successful! Redirecting...');

            // Store authentication token if provided by the API
            if (response.data && response.data.token) {
                localStorage.setItem('authToken', response.data.token);
            }

            // Redirect to dashboard or home page
            setTimeout(() => {
                // window.location.href = '/dashboard';
                console.log('Logged in successfully', response.data);
            }, 1500);

        } catch (error) {
            // Handle errors
            if (axios.isAxiosError(error) && error.response) {
                // API returned error response
                const serverErrors = error.response.data;

                if (error.response.status === 401) {
                    setSubmitMessage('Invalid username or password');
                } else {
                    setSubmitMessage(`Login failed: ${error.response.statusText}`);
                }

                // If server returns validation errors, update the errors state
                if (typeof serverErrors === 'object') {
                    setErrors(prev => ({ ...prev, ...serverErrors }));
                }
            } else {
                // Network or other error
                setSubmitMessage('Login failed. Please try again later.');
                console.error('Login error:', error);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Handle forgot password click
    const handleForgotPassword = (e: React.MouseEvent) => {
        e.preventDefault();
        console.log('Navigate to forgot password page');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Sign in to your account
                    </h2>
                </div>

                {submitMessage && (
                    <div className={`p-4 rounded-md ${submitMessage.includes('successful') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                        {submitMessage}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        {/* Username/Email field */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                Username or Email
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className={`mt-1 block w-full px-3 py-2 border ${errors.username ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                                value={formData.username}
                                onChange={handleInputChange}
                            />
                            {errors.username && (
                                <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                            )}
                        </div>

                        {/* Password field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className={`mt-1 block w-full px-3 py-2 border ${errors.password ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                                value={formData.password}
                                onChange={handleInputChange}
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between">

                        <div className="text-sm">
                            <a
                                href="#"
                                onClick={handleForgotPassword}
                                className="font-medium text-indigo-600 hover:text-indigo-500"
                            >
                                Forgot your password?
                            </a>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${isLoading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                        >
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>

                    <div className="text-sm text-center">
                        <a href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Don't have an account? Sign up
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;