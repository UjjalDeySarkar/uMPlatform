import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useEffect } from "react";
import { useLocation } from 'react-router-dom';
import config from "../../config";
import axios, { AxiosError } from 'axios';
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from 'react-router-dom';

// Define the form data type for registration
interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterPage: React.FC = () => {
  // Use location state to get the dynamic post URL from the previous component
  const location = useLocation();
  // Use the passed postUrl or fallback to the default registration endpoint
  const dynamicPostUrl = `http://${location.state?.postUrl}:8000/register/` || `${config.API_BASE_URL}/register/`;

    useEffect(() => {
        // Check if the location state contains response data with a message
        if (location.state && (location.state as any).responseData) {
        //   const { message } = (location.state as any).responseData;
          toast.success("Onboarding Successful", { autoClose: 6000 }); // display for 6000ms
        }
      }, [location]);
  
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitMessage, setSubmitMessage] = useState<string>('');

  // Handle input changes
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setSubmitMessage('');

    try {
      // Post the registration data using the dynamic URL
      const response = await axios.post(
        dynamicPostUrl,
        {
          username: formData.email,  // using email as username
          email: formData.email,
          password: formData.password,
          password_confirm: formData.confirmPassword,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone_number: '', // Empty phone number
          profile_pic: ''   // Empty profile picture
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      setSubmitMessage('Registration successful! Redirecting...');
      navigate('/login', { state: { responseData: response.data, postUrl: location.state?.postUrl, firstTime: true} });
      
      setTimeout(() => console.log('Registered successfully', response.data), 1500);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Extract the specific error message from the API response.
        const errorData = error.response.data;
        console.log(error.response.data)
        toast.error(errorData.username[0], { autoClose: 6000 });
        
        // Optionally update the error state if there are multiple errors.
        if (typeof errorData === 'object') {
          setErrors(prev => ({ ...prev, ...errorData }));
        }
      } else {
        toast.error('Login failed. Please try again later.', { autoClose: 6000 });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">Sign up for an account</h2>
        {submitMessage && (
          <div className={`p-4 rounded-md ${submitMessage.includes('successful') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {submitMessage}
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="flex space-x-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border rounded-md"
              />
              {errors.firstName && <p className="text-sm text-red-600">{errors.firstName}</p>}
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border rounded-md"
              />
              {errors.lastName && <p className="text-sm text-red-600">{errors.lastName}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border rounded-md"
            />
            {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border rounded-md"
            />
            {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border rounded-md"
            />
            {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword}</p>}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 text-white rounded-md bg-indigo-600 hover:bg-indigo-700"
          >
            {isLoading ? 'Signing up...' : 'Sign up'}
          </button>
        </form>
        <ToastContainer position="top-right" autoClose={6000} />
      </div>
    </div>
  );
};

export default RegisterPage;
