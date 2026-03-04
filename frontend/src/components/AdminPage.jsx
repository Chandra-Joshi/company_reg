import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCompanies, getCompany } from '../utils/api';

const AdminPage = () => {
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

    const closeModal = () => setSelectedCompany(null);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-5xl mx-auto px-4 py-8">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-800">Admin Panel</h1>
                        <p className="text-sm text-gray-500">View all registered companies.</p>
                    </div>
                    <Link
                        to="/"
                        className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md"
                    >
                        + New Incorporation
                    </Link>
                </div>

                {/* Loading */}
                {loading && <p className="text-center py-16 text-gray-500 text-sm">Loading...</p>}

                {/* Error */}
                {error && (
                    <p className="mb-4 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                        {error}
                    </p>
                )}

                {/* Empty state */}
                {!loading && !error && companies.length === 0 && (
                    <div className="text-center py-16">
                        <p className="text-gray-500 text-sm mb-3">No companies registered yet.</p>
                        <Link to="/" className="text-indigo-600 text-sm font-medium hover:underline">
                            Go to Incorporation Form
                        </Link>
                    </div>
                )}

                {/* Table */}
                {!loading && companies.length > 0 && (
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">
                                        <th className="px-4 py-3">Company Name</th>
                                        <th className="px-4 py-3">Total Capital</th>
                                        <th className="px-4 py-3">Shareholders</th>
                                        <th className="px-4 py-3">Registered</th>
                                        <th className="px-4 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {companies.map((c) => (
                                        <tr key={c.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium text-gray-800">{c.name}</td>
                                            <td className="px-4 py-3 text-gray-600">
                                                ${parseFloat(c.total_capital).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">{c.num_shareholders}</td>
                                            <td className="px-4 py-3 text-gray-500">
                                                {new Date(c.created_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    onClick={() => openModal(c.id)}
                                                    className="text-indigo-600 hover:underline text-sm font-medium"
                                                >
                                                    View
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
                    {/* Overlay */}
                    <div className="fixed inset-0 bg-black/40" onClick={closeModal}></div>

                    {/* Modal box */}
                    <div className="relative bg-white rounded-lg shadow-md max-w-md w-full max-h-[90vh] overflow-y-auto">
                        {modalLoading ? (
                            <p className="text-center py-12 text-gray-500 text-sm">Loading...</p>
                        ) : (
                            <>
                                {/* Modal Header */}
                                <div className="px-5 py-4 border-b border-gray-200">
                                    <h2 className="text-base font-semibold text-gray-800">{selectedCompany.name}</h2>
                                </div>

                                {/* Modal Body */}
                                <div className="px-5 py-4">
                                    {/* Company info */}
                                    <div className="grid grid-cols-2 gap-3 mb-5">
                                        <div className="col-span-2 bg-gray-50 border border-gray-200 rounded-md p-3">
                                            <p className="text-xs text-gray-500 mb-1">Company ID</p>
                                            <p className="text-sm font-semibold text-gray-800">#{selectedCompany.id}</p>
                                        </div>
                                        <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                                            <p className="text-xs text-gray-500 mb-1">Total Capital</p>
                                            <p className="text-sm font-semibold text-gray-800">
                                                ${parseFloat(selectedCompany.total_capital).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                                            <p className="text-xs text-gray-500 mb-1">Shareholders</p>
                                            <p className="text-sm font-semibold text-gray-800">{selectedCompany.num_shareholders}</p>
                                        </div>
                                        <div className="col-span-2 bg-gray-50 border border-gray-200 rounded-md p-3">
                                            <p className="text-xs text-gray-500 mb-1">Registered On</p>
                                            <p className="text-sm font-semibold text-gray-800">
                                                {new Date(selectedCompany.created_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Shareholders list */}
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Shareholders</h3>
                                    {selectedCompany.shareholders.length === 0 ? (
                                        <p className="text-sm text-gray-400">No shareholders found.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {selectedCompany.shareholders.map((s, i) => (
                                                <div key={s.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                                                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center justify-center flex-shrink-0">
                                                        {i + 1}
                                                    </span>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-800">
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
                                <div className="px-5 py-4 border-t border-gray-200">
                                    <button
                                        onClick={closeModal}
                                        className="w-full py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-md"
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
};

export default AdminPage;
