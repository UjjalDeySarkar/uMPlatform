import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import config from "../../config";
import axios from 'axios';
import { useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

interface LoginFormData {
    username: string;
    password: string;
}

const LoginPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Retrieve dynamic POST URL from the location state, or use default endpoint
    const dynamicPostUrl = `http://${location.state?.postUrl}:8000/api/token/` || `${config.API_BASE_URL}/api-auth/login/`;

    useEffect(() => {
        // If location.state contains response data with a message, display it as a toast
        if (location.state && (location.state as any).responseData) {
            const { message } = (location.state as any).responseData;
            toast.success(message, { autoClose: 6000 });
        }
    }, [location]);

    const [formData, setFormData] = useState<LoginFormData>({ username: '', password: '' });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.username.trim()) newErrors.username = 'Username or email is required';
        if (!formData.password) newErrors.password = 'Password is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const response = await axios.post(dynamicPostUrl, formData, {
                headers: { 'Content-Type': 'application/json' }
            });

            // Store authentication token if provided by the API
            if (response.data && response.data.token) {
                localStorage.setItem('authToken', response.data.token);
            }

            toast.success('Login successful! Redirecting...', { autoClose: 6000 });

            // Redirect to dashboard (or any other page) after a short delay
            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                if (error.response.status === 401) {
                    toast.error('Invalid username or password', { autoClose: 6000 });
                } else {
                    toast.error(`Login failed: ${error.response.statusText}`, { autoClose: 6000 });
                }
                const serverErrors = error.response.data;
                if (typeof serverErrors === 'object') {
                    setErrors(prev => ({ ...prev, ...serverErrors }));
                }
            } else {
                toast.error('Login failed. Please try again later.', { autoClose: 6000 });
            }
        } finally {
            setIsLoading(false);
        }
    };

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

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
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
                </form>
                <ToastContainer position="top-right" autoClose={6000} />
            </div>
        </div>
    );
};

export default LoginPage;
