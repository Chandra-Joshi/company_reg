import { useState } from 'react';
import { addShareholders } from '../utils/api';

export default function Step2({ company, onSuccess, onBack }) {
    const [shareholders, setShareholders] = useState(
        Array.from({ length: company.num_shareholders }, () => ({
            first_name: '',
            last_name: '',
            nationality: '',
        }))
    );
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    const handleChange = (index, field, value) => {
        const updated = [...shareholders];
        updated[index] = { ...updated[index], [field]: value };
        setShareholders(updated);

        // Clear specific error
        const errKey = `${index}_${field}`;
        if (errors[errKey]) {
            const newErrors = { ...errors };
            delete newErrors[errKey];
            setErrors(newErrors);
        }
        setApiError('');
    };

    const validate = () => {
        const newErrors = {};
        shareholders.forEach((s, i) => {
            if (!s.first_name.trim()) newErrors[`${i}_first_name`] = 'Required';
            if (!s.last_name.trim()) newErrors[`${i}_last_name`] = 'Required';
            if (!s.nationality.trim()) newErrors[`${i}_nationality`] = 'Required';
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        setApiError('');
        try {
            await addShareholders(company.id, shareholders);
            localStorage.removeItem('draftCompanyId');
            onSuccess();
        } catch (err) {
            setApiError(err.response?.data?.error || 'Failed to add shareholders. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fadeIn">
            {/* Company Summary (read-only) */}
            <div className="mb-8 p-5 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl">
                <h3 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-3">Company Summary</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <p className="text-xs text-gray-500">Company Name</p>
                        <p className="font-semibold text-gray-800">{company.name}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Shareholders</p>
                        <p className="font-semibold text-gray-800">{company.num_shareholders}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Total Capital</p>
                        <p className="font-semibold text-gray-800">${parseFloat(company.total_capital).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Shareholder Information</h2>
                <p className="text-gray-500 mt-1">Enter details for each shareholder below.</p>
            </div>

            {apiError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {apiError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                {shareholders.map((s, index) => (
                    <div
                        key={index}
                        className="p-5 bg-white border-2 border-gray-100 rounded-xl hover:border-indigo-100 transition-colors duration-200"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold">
                                {index + 1}
                            </span>
                            <h3 className="font-semibold text-gray-700">Shareholder {index + 1}</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">First Name</label>
                                <input
                                    type="text"
                                    value={s.first_name}
                                    onChange={(e) => handleChange(index, 'first_name', e.target.value)}
                                    placeholder="John"
                                    className={`w-full px-3 py-2.5 border-2 rounded-lg text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${errors[`${index}_first_name`] ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                />
                                {errors[`${index}_first_name`] && (
                                    <p className="mt-1 text-xs text-red-600">{errors[`${index}_first_name`]}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">Last Name</label>
                                <input
                                    type="text"
                                    value={s.last_name}
                                    onChange={(e) => handleChange(index, 'last_name', e.target.value)}
                                    placeholder="Doe"
                                    className={`w-full px-3 py-2.5 border-2 rounded-lg text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${errors[`${index}_last_name`] ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                />
                                {errors[`${index}_last_name`] && (
                                    <p className="mt-1 text-xs text-red-600">{errors[`${index}_last_name`]}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">Nationality</label>
                                <input
                                    type="text"
                                    value={s.nationality}
                                    onChange={(e) => handleChange(index, 'nationality', e.target.value)}
                                    placeholder="Nepalese"
                                    className={`w-full px-3 py-2.5 border-2 rounded-lg text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${errors[`${index}_nationality`] ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                />
                                {errors[`${index}_nationality`] && (
                                    <p className="mt-1 text-xs text-red-600">{errors[`${index}_nationality`]}</p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Button row: Previous + Submit */}
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onBack}
                        className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                        </svg>
                        Previous
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-[2] py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                </svg>
                                Submitting Incorporation…
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Submit Incorporation
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
