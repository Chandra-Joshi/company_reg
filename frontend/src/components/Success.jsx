import { useEffect, useState } from 'react';
import { getCompany } from '../utils/api';

export default function Success({ companyId, onStartNew, onViewAll }) {
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
        return (
            <div className="flex items-center justify-center py-20">
                <svg className="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
            </div>
        );
    }

    if (!company) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600">Failed to load company details.</p>
            </div>
        );
    }

    return (
        <div className="animate-fadeIn">
            {/* Success banner */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-4">
                    <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Incorporation Successful!</h2>
                <p className="text-gray-500">The company has been registered with all shareholders.</p>
            </div>

            {/* Company Details Card */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-6 mb-6">
                <h3 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-4">Company Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-gray-500">Company Name</p>
                        <p className="text-lg font-bold text-gray-800">{company.name}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Total Capital</p>
                        <p className="text-lg font-bold text-gray-800">
                            ${parseFloat(company.total_capital).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Number of Shareholders</p>
                        <p className="text-lg font-bold text-gray-800">{company.num_shareholders}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Registered At</p>
                        <p className="text-lg font-bold text-gray-800">
                            {new Date(company.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Shareholders List */}
            <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 mb-8">
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">Shareholders</h3>
                <div className="space-y-3">
                    {company.shareholders.map((s, i) => (
                        <div key={s.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold flex-shrink-0">
                                {i + 1}
                            </span>
                            <div>
                                <p className="font-semibold text-gray-800">
                                    {s.first_name} {s.last_name}
                                </p>
                                <p className="text-sm text-gray-500">{s.nationality}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
                <button
                    onClick={onViewAll}
                    className="flex-1 py-3 px-6 bg-white border-2 border-indigo-200 text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition-all duration-200 flex items-center justify-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    View All Companies
                </button>
                <button
                    onClick={onStartNew}
                    className="flex-1 py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Start New Incorporation
                </button>
            </div>
        </div>
    );
}
