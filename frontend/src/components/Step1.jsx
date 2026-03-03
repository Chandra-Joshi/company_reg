import { useState, useEffect } from 'react';
import { createCompany } from '../utils/api';

export default function Step1({ onNext, initialData, onFormChange }) {
    const [form, setForm] = useState(initialData || {
        name: '',
        num_shareholders: '',
        total_capital: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    // Sync with parent when initialData changes (e.g. on mount from parent state)
    useEffect(() => {
        if (initialData) {
            setForm(initialData);
        }
    }, []);

    const validate = () => {
        const newErrors = {};
        if (!form.name.trim()) newErrors.name = 'Company name is required.';
        if (!form.num_shareholders || parseInt(form.num_shareholders) < 1)
            newErrors.num_shareholders = 'Must be at least 1 shareholder.';
        if (!form.total_capital || parseFloat(form.total_capital) <= 0)
            newErrors.total_capital = 'Capital must be greater than 0.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const updated = { ...form, [e.target.name]: e.target.value };
        setForm(updated);
        // Notify parent to persist form data
        if (onFormChange) onFormChange(updated);
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }
        setApiError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        setApiError('');
        try {
            const res = await createCompany({
                name: form.name.trim(),
                num_shareholders: parseInt(form.num_shareholders),
                total_capital: parseFloat(form.total_capital),
            });
            localStorage.setItem('draftCompanyId', res.data.id);
            onNext(res.data);
        } catch (err) {
            setApiError(err.response?.data?.error || 'Failed to create company. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fadeIn">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800">Company Information</h2>
                <p className="text-gray-500 mt-1">Enter the basic details of the company to incorporate.</p>
            </div>

            {apiError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {apiError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                        Company Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="e.g. Acme Corporation Ltd."
                        className={`w-full px-4 py-3 border-2 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                    />
                    {errors.name && <p className="mt-1.5 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                    <label htmlFor="num_shareholders" className="block text-sm font-semibold text-gray-700 mb-2">
                        Number of Shareholders
                    </label>
                    <input
                        type="number"
                        id="num_shareholders"
                        name="num_shareholders"
                        value={form.num_shareholders}
                        onChange={handleChange}
                        min="1"
                        placeholder="e.g. 3"
                        className={`w-full px-4 py-3 border-2 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ${errors.num_shareholders ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                    />
                    {errors.num_shareholders && <p className="mt-1.5 text-sm text-red-600">{errors.num_shareholders}</p>}
                </div>

                <div>
                    <label htmlFor="total_capital" className="block text-sm font-semibold text-gray-700 mb-2">
                        Total Capital Invested ($)
                    </label>
                    <input
                        type="number"
                        id="total_capital"
                        name="total_capital"
                        value={form.total_capital}
                        onChange={handleChange}
                        min="0.01"
                        step="0.01"
                        placeholder="e.g. 50000.00"
                        className={`w-full px-4 py-3 border-2 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ${errors.total_capital ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                    />
                    {errors.total_capital && <p className="mt-1.5 text-sm text-red-600">{errors.total_capital}</p>}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                            </svg>
                            Creating Company…
                        </>
                    ) : (
                        <>
                            Next: Add Shareholders
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
