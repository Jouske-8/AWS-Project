import React, { useState } from 'react';
import AuthLayout from './AuthLayout';

const LoginForm = ({ onLogin, onSwitchToSignup }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            // MOCK: Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (email === 'test@example.com' && password === 'password') {
                onLogin({ username: 'madhur' }); // Simulate successful login
            } else {
                throw new Error('Invalid credentials');
            }
            // REAL IMPLEMENTATION:
            // const user = await Auth.signIn(email, password);
            // onLogin(user);
        } catch (err) {
            setError(err.message || 'An error occurred during sign in.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Welcome Back"
            subtitle="Sign in to continue to Chronos."
            onSwitch={onSwitchToSignup}
            switchText="Don't have an account?"
            switchLinkText="Sign up"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="text-sm font-medium text-gray-300">Email Address</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full mt-1 p-3 bg-gray-900 border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                        placeholder="you@example.com"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password" className="text-sm font-medium text-gray-300">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full mt-1 p-3 bg-gray-900 border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                        placeholder="••••••••"
                        required
                    />
                </div>
                {error && <p className="text-sm text-red-400">{error}</p>}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-md transition-all duration-300 flex items-center justify-center"
                >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                </button>
            </form>
        </AuthLayout>
    );
};

export default LoginForm;
