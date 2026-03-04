import { useEffect, useState } from 'react';
import { getCompany } from '../utils/api';

const Success = ({ companyId, onStartNew, onViewAll }) => {
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const res = await getCompany(companyId);
                setCompany(res.data);
            } catch (err) {
                console.error('Failed to fetch company:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCompany();
    }, [companyId]);

    if (loading) {
        return <p className="text-center py-10 text-gray-500 text-sm">Loading...</p>;
    }

    if (!company) {
        return <p className="text-center py-10 text-red-500 text-sm">Failed to load company details.</p>;
    }

    return (
        <div>
            {/* Success message */}
            <div className="text-center mb-6">
                <p className="text-green-600 font-semibold text-sm mb-1">Registration Complete</p>
                <h2 className="text-xl font-semibold text-gray-800">Company Registered Successfully</h2>
                <p className="text-sm text-gray-500 mt-1">All details have been saved.</p>
            </div>

            {/* Company Details */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Company Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <p className="text-xs text-gray-500">Company Name</p>
                        <p className="text-sm font-semibold text-gray-800">{company.name}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Total Capital</p>
                        <p className="text-sm font-semibold text-gray-800">
                            ${parseFloat(company.total_capital).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Number of Shareholders</p>
                        <p className="text-sm font-semibold text-gray-800">{company.num_shareholders}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Registered On</p>
                        <p className="text-sm font-semibold text-gray-800">
                            {new Date(company.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Shareholders */}
            <div className="border border-gray-200 rounded-lg p-4 mb-6 bg-white">
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Shareholders</h3>
                <div className="space-y-2">
                    {company.shareholders.map((s, i) => (
                        <div key={s.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center justify-center flex-shrink-0">
                                {i + 1}
                            </span>
                            <div>
                                <p className="text-sm font-medium text-gray-800">{s.first_name} {s.last_name}</p>
                                <p className="text-xs text-gray-500">{s.nationality}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
                <button
                    onClick={onViewAll}
                    className="flex-1 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-md"
                >
                    View All Companies
                </button>
                <button
                    onClick={onStartNew}
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md"
                >
                    Start New Incorporation
                </button>
            </div>
        </div>
    );
};

export default Success;
