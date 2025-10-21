import React, { useState } from 'react';
import AuthLayout from './AuthLayout';

const SignupForm = ({ onSignup, onSwitchToLogin }) => {
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
            console.log("Signing up with", email, password);
            onSignup({ username: email }); // Simulate successful signup & login
            // REAL IMPLEMENTATION:
            // await Auth.signUp({ username: email, password });
            // // After sign up, you might want to redirect to a confirmation page
            // // or automatically sign them in. For simplicity, we'll just log them in.
            // const user = await Auth.signIn(email, password);
            // onSignup(user);
        } catch (err) {
            setError(err.message || 'An error occurred during sign up.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Create an Account"
            subtitle="Start your journey with Chronos."
            onSwitch={onSwitchToLogin}
            switchText="Already have an account?"
            switchLinkText="Sign in"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email-signup" className="text-sm font-medium text-gray-300">Email Address</label>
                    <input
                        id="email-signup"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full mt-1 p-3 bg-gray-900 border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                        placeholder="you@example.com"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password-signup" className="text-sm font-medium text-gray-300">Password</label>
                    <input
                        id="password-signup"
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
                    {isLoading ? 'Creating Account...' : 'Sign Up'}
                </button>
            </form>
        </AuthLayout>
    );
};

export default SignupForm;
