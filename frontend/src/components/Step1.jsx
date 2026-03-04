import { useState, useEffect } from 'react';

const Step1 = ({ onNext, initialData, onFormChange }) => {
    const [form, setForm] = useState(initialData || {
        name: '',
        num_shareholders: '',
        total_capital: '',
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (initialData) setForm(initialData);
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
        if (onFormChange) onFormChange(updated);
        if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;
        onNext({
            name: form.name.trim(),
            num_shareholders: parseInt(form.num_shareholders),
            total_capital: parseFloat(form.total_capital),
        });
    };

    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-1">Company Information</h2>
            <p className="text-sm text-gray-500 mb-6">Enter the basic details of the company.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Company Name */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Company Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="e.g. Acme Corporation Ltd."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                </div>

                {/* Number of Shareholders */}
                <div>
                    <label htmlFor="num_shareholders" className="block text-sm font-medium text-gray-700 mb-1">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errors.num_shareholders && <p className="mt-1 text-xs text-red-500">{errors.num_shareholders}</p>}
                </div>

                {/* Total Capital */}
                <div>
                    <label htmlFor="total_capital" className="block text-sm font-medium text-gray-700 mb-1">
                        Total Capital ($)
                    </label>
                    <input
                        type="number"
                        id="total_capital"
                        name="total_capital"
                        value={form.total_capital}
                        onChange={handleChange}
                        min="10000"
                        step="100"
                        placeholder="e.g. 50000.00"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errors.total_capital && <p className="mt-1 text-xs text-red-500">{errors.total_capital}</p>}
                </div>

                <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md"
                >
                    Next: Add Shareholders
                </button>
            </form>
        </div>
    );
};

export default Step1;
