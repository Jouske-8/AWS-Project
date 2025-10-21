import React from 'react';

const MethodBadge = ({ method }) => {
    const baseClasses = "px-2.5 py-1 text-xs font-semibold rounded-md w-20 text-center";
    switch (method) {
        case 'GET': return <span className={`${baseClasses} bg-sky-600/20 text-sky-400`}>{method}</span>;
        case 'POST': return <span className={`${baseClasses} bg-emerald-600/20 text-emerald-400`}>{method}</span>;
        case 'PUT': return <span className={`${baseClasses} bg-amber-600/20 text-amber-400`}>{method}</span>;
        case 'DELETE': return <span className={`${baseClasses} bg-rose-600/20 text-rose-400`}>{method}</span>;
        default: return <span className={`${baseClasses} bg-gray-600/20 text-gray-400`}>{method}</span>;
    }
};

export default MethodBadge;
