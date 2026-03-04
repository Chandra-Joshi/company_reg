import { useState } from 'react';
import { submitIncorporation } from '../utils/api';

const Step2 = ({ company, onSuccess, onBack }) => {
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
            const res = await submitIncorporation({ company, shareholders });
            onSuccess(res.data);
        } catch (err) {
            setApiError(err.response?.data?.error || 'Failed to submit. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {/* Company summary */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Company Summary</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                        <p className="text-xs text-gray-500">Name</p>
                        <p className="text-sm font-semibold text-gray-800">{company.name}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Shareholders</p>
                        <p className="text-sm font-semibold text-gray-800">{company.num_shareholders}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Total Capital</p>
                        <p className="text-sm font-semibold text-gray-800">
                            ${parseFloat(company.total_capital).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-800 mb-1">Shareholder Information</h2>
            <p className="text-sm text-gray-500 mb-5">Enter details for each shareholder below.</p>

            {apiError && (
                <p className="mb-4 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                    {apiError}
                </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {shareholders.map((s, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                        <p className="text-sm font-medium text-gray-700 mb-3">Shareholder {index + 1}</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">First Name</label>
                                <input
                                    type="text"
                                    value={s.first_name}
                                    onChange={(e) => handleChange(index, 'first_name', e.target.value)}
                                    placeholder="e.g. Kshitiz"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                {errors[`${index}_first_name`] && (
                                    <p className="mt-1 text-xs text-red-500">{errors[`${index}_first_name`]}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Last Name</label>
                                <input
                                    type="text"
                                    value={s.last_name}
                                    onChange={(e) => handleChange(index, 'last_name', e.target.value)}
                                    placeholder="e.g.Rai"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                {errors[`${index}_last_name`] && (
                                    <p className="mt-1 text-xs text-red-500">{errors[`${index}_last_name`]}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Nationality</label>
                                <input
                                    type="text"
                                    value={s.nationality}
                                    onChange={(e) => handleChange(index, 'nationality', e.target.value)}
                                    placeholder="Nepalese"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                {errors[`${index}_nationality`] && (
                                    <p className="mt-1 text-xs text-red-500">{errors[`${index}_nationality`]}</p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onBack}
                        disabled={loading}
                        className="flex-1 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-md disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-[2] py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md disabled:opacity-50"
                    >
                        {loading ? 'Submitting...' : 'Submit Incorporation'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Step2;
