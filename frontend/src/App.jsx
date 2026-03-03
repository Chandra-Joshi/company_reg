import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Step1 from './components/Step1';
import Step2 from './components/Step2';
import Success from './components/Success';
import AdminPage from './components/AdminPage';
import { getCompany } from './utils/api';

function IncorporationForm() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);

    // Lifted Step1 form data so it persists when navigating back
    const [step1Data, setStep1Data] = useState({
        name: '',
        num_shareholders: '',
        total_capital: '',
    });

    // Draft resume logic
    useEffect(() => {
        const resumeDraft = async () => {
            const draftId = localStorage.getItem('draftCompanyId');
            if (draftId) {
                try {
                    const res = await getCompany(draftId);
                    const c = res.data;
                    setCompany(c);
                    setStep1Data({
                        name: c.name,
                        num_shareholders: String(c.num_shareholders),
                        total_capital: String(c.total_capital),
                    });
                    if (c.shareholders && c.shareholders.length === c.num_shareholders) {
                        setStep(3);
                    } else {
                        setStep(2);
                    }
                } catch (err) {
                    localStorage.removeItem('draftCompanyId');
                    setStep(1);
                }
            } else {
                setStep(1);
            }
            setLoading(false);
        };
        resumeDraft();
    }, []);

    const handleStep1Next = (companyData) => {
        setCompany(companyData);
        setStep(2);
    };

    const handleGoBack = () => {
        setStep(1);
    };

    const handleSubmitSuccess = () => {
        setStep(3);
    };

    const handleStartNew = () => {
        localStorage.removeItem('draftCompanyId');
        setCompany(null);
        setStep1Data({ name: '', num_shareholders: '', total_capital: '' });
        setStep(1);
    };

    const handleViewAll = () => {
        navigate('/admin');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <svg className="animate-spin h-10 w-10 text-indigo-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    <p className="text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-2xl mx-auto px-4 py-10">
                {/* Progress Bar */}
                {step < 3 && (
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-600">
                                Step {step} of 2
                            </span>
                            <span className="text-sm text-gray-400">
                                {step === 1 ? 'Company Info' : 'Shareholders'}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                                style={{ width: step === 1 ? '50%' : '100%' }}
                            ></div>
                        </div>
                        <div className="flex justify-between mt-2">
                            <div className="flex items-center gap-1.5">
                                <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
                                <span className="text-xs text-gray-500">Company</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
                                <span className="text-xs text-gray-500">Shareholders</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Card Container */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                    {step === 1 && (
                        <Step1
                            onNext={handleStep1Next}
                            initialData={step1Data}
                            onFormChange={setStep1Data}
                        />
                    )}
                    {step === 2 && company && (
                        <Step2
                            company={company}
                            onSuccess={handleSubmitSuccess}
                            onBack={handleGoBack}
                        />
                    )}
                    {step === 3 && company && (
                        <Success companyId={company.id} onStartNew={handleStartNew} onViewAll={handleViewAll} />
                    )}
                </div>
            </div>
        </div>
    );
}

export default function App() {
    return (
        <>
            <Navbar />
            <Routes>
                <Route path="/" element={<IncorporationForm />} />
                <Route path="/admin" element={<AdminPage />} />
            </Routes>
        </>
    );
}
