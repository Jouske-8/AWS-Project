import React from 'react';

const AuthLayout = ({ children, title, subtitle, onSwitch, switchText, switchLinkText }) => (
    <div className="min-h-screen w-full bg-gray-900 text-white flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2">Chronos</h1>
                <p className="text-gray-400">API Time-Travel Debugging</p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-8 shadow-2xl shadow-blue-500/10">
                <h2 className="text-2xl font-semibold mb-2">{title}</h2>
                <p className="text-gray-400 mb-6">{subtitle}</p>
                {children}
            </div>
            <p className="text-center text-gray-500 mt-6">
                {switchText}{' '}
                <button onClick={onSwitch} className="font-medium text-blue-400 hover:text-blue-300 focus:outline-none focus:underline transition">
                    {switchLinkText}
                </button>
            </p>
        </div>
    </div>
);

export default AuthLayout;
