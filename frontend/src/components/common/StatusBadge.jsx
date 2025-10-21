import React from 'react';

const StatusBadge = ({ status }) => {
    const baseClasses = "px-2 py-1 text-xs font-bold rounded-full";
    if (status >= 200 && status < 300) return <span className={`${baseClasses} bg-green-500/20 text-green-300`}>● {status}</span>;
    if (status >= 300 && status < 400) return <span className={`${baseClasses} bg-blue-500/20 text-blue-300`}>● {status}</span>;
    if (status >= 400 && status < 500) return <span className={`${baseClasses} bg-yellow-500/20 text-yellow-300`}>● {status}</span>;
    if (status >= 500) return <span className={`${baseClasses} bg-red-500/20 text-red-300`}>● {status}</span>;
    return <span className={`${baseClasses} bg-gray-500/20 text-gray-300`}>● {status}</span>;
};

export default StatusBadge;
