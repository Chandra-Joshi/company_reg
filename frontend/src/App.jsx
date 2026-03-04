import { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Step1 from './components/Step1';
import Step2 from './components/Step2';
import Success from './components/Success';
import AdminPage from './components/AdminPage';

const IncorporationForm = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [company, setCompany] = useState(null);

    const [step1Data, setStep1Data] = useState({
        name: '',
        num_shareholders: '',
        total_capital: '',
    });

    const handleStep1Next = (formData) => {
        setCompany(formData);
        setStep(2);
    };

    const handleGoBack = () => setStep(1);

    const handleSubmitSuccess = (createdCompany) => {
        setCompany(createdCompany);
        setStep(3);
    };

    const handleStartNew = () => {
        setCompany(null);
        setStep1Data({ name: '', num_shareholders: '', total_capital: '' });
        setStep(1);
    };

    const handleViewAll = () => navigate('/admin');

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-2xl mx-auto px-4 py-8">

                {/* Progress indicator */}
                {step < 3 && (
                    <div className="mb-6">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Step {step} of 2</span>
                            <span>{step === 1 ? 'Company Info' : 'Shareholders'}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                                className="bg-indigo-600 h-1.5 rounded-full"
                                style={{ width: step === 1 ? '50%' : '100%' }}
                            />
                        </div>
                    </div>
                )}

                {/* Form card */}
                <div className="bg-white shadow-md rounded-lg p-6">
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
                        <Success
                            companyId={company.id}
                            onStartNew={handleStartNew}
                            onViewAll={handleViewAll}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

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
