import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCompanies, getCompany } from '../utils/api';

export default function AdminPage() {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        setLoading(true);
        try {
            const res = await getCompanies();
            setCompanies(res.data);
        } catch (err) {
            setError('Failed to load companies.');
        } finally {
            setLoading(false);
        }
    };

    const openModal = async (id) => {
        setModalLoading(true);
        setSelectedCompany(null);
        try {
            const res = await getCompany(id);
            setSelectedCompany(res.data);
        } catch (err) {
            console.error('Failed to fetch company details:', err);
        } finally {
            setModalLoading(false);
        }
    };

    const closeModal = () => {
        setSelectedCompany(null);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 py-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>
                        <p className="text-gray-500 mt-1">View and manage all registered companies.</p>
                    </div>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Form
                    </Link>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <svg className="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm mb-6">
                        {error}
                    </div>
                )}

                {/* Empty state */}
                {!loading && !error && companies.length === 0 && (
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-1">No Companies Yet</h3>
                        <p className="text-gray-500 mb-4">Start by incorporating a new company.</p>
                        <Link to="/" className="text-indigo-600 font-medium hover:text-indigo-700">
                            Go to Incorporation Form →
                        </Link>
                    </div>
                )}

                {/* Table */}
                {!loading && companies.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                                        <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Company Name</th>
                                        <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Total Capital</th>
                                        <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider"># Shareholders</th>
                                        <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Created At</th>
                                        <th className="text-right px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {companies.map((c) => (
                                        <tr key={c.id} className="hover:bg-gray-50 transition-colors duration-150">
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-gray-800">{c.name}</p>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                ${parseFloat(c.total_capital).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                                                    {c.num_shareholders}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 text-sm">
                                                {new Date(c.created_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => openModal(c.id)}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-lg hover:bg-indigo-100 transition-colors duration-200"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {(selectedCompany || modalLoading) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        {modalLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                </svg>
                            </div>
                        ) : (
                            <>
                                {/* Modal Header */}
                                <div className="p-6 border-b border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-bold text-gray-800">{selectedCompany.name}</h2>
                                        <button
                                            onClick={closeModal}
                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Modal Body */}
                                <div className="p-6">
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-indigo-50 rounded-xl p-4">
                                            <p className="text-xs text-indigo-600 font-medium">Total Capital</p>
                                            <p className="text-lg font-bold text-gray-800">
                                                ${parseFloat(selectedCompany.total_capital).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                        <div className="bg-purple-50 rounded-xl p-4">
                                            <p className="text-xs text-purple-600 font-medium">Shareholders</p>
                                            <p className="text-lg font-bold text-gray-800">{selectedCompany.num_shareholders}</p>
                                        </div>
                                        <div className="col-span-2 bg-gray-50 rounded-xl p-4">
                                            <p className="text-xs text-gray-500 font-medium">Registered On</p>
                                            <p className="font-semibold text-gray-800">
                                                {new Date(selectedCompany.created_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">Shareholders</h3>
                                    {selectedCompany.shareholders.length === 0 ? (
                                        <p className="text-gray-500 text-sm italic">No shareholders registered yet.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {selectedCompany.shareholders.map((s, i) => (
                                                <div key={s.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex-shrink-0">
                                                        {i + 1}
                                                    </span>
                                                    <div>
                                                        <p className="font-medium text-gray-800 text-sm">
                                                            {s.first_name} {s.last_name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">{s.nationality}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Modal Footer */}
                                <div className="p-6 border-t border-gray-100">
                                    <button
                                        onClick={closeModal}
                                        className="w-full py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
