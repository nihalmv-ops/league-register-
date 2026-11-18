import React, { useState } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { InstructionsCard } from './components/InstructionsCard';
import { RegistrationForm } from './components/RegistrationForm';
import { SuccessView } from './components/SuccessView';
import { StatusChecker } from './components/StatusChecker';
import { Footer } from './components/Footer';
import { RegistrationSuccessData } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'register' | 'status'>('register');
  const [successData, setSuccessData] = useState<RegistrationSuccessData | null>(null);
  const [searchQueryId, setSearchQueryId] = useState<string>('');

  const handleRegistrationSuccess = (data: RegistrationSuccessData) => {
    setSuccessData(data);
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  const handleResetForm = () => {
    setSuccessData(null);
    setActiveTab('register');
  };

  const handleCheckStatus = (id: string) => {
    setSearchQueryId(id);
    setActiveTab('status');
    window.scrollTo({ top: 150, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-pitch-darkest text-slate-100 flex flex-col pitch-pattern selection:bg-football-accent selection:text-black">
      {/* Navigation Header */}
      <Header
        onRegisterClick={() => {
          setActiveTab('register');
          setSuccessData(null);
        }}
        onStatusClick={() => setActiveTab('status')}
        activeTab={activeTab}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {activeTab === 'register' ? (
          <>
            {!successData ? (
              <>
                {/* Hero Section */}
                <HeroSection
                  onRegisterClick={() => {
                    const formElement = document.getElementById('registration-section');
                    formElement?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  onStatusClick={() => setActiveTab('status')}
                />

                {/* Instructions Card */}
                <div id="registration-section">
                  <InstructionsCard />
                </div>

                {/* Registration Form with exactly 6 fields */}
                <RegistrationForm onSuccess={handleRegistrationSuccess} />
              </>
            ) : (
              /* Success Screen */
              <SuccessView
                data={successData}
                onReset={handleResetForm}
                onCheckStatus={handleCheckStatus}
              />
            )}
          </>
        ) : (
          /* Public Status Tracking View */
          <div className="pt-6">
            <StatusChecker
              initialIdentifier={searchQueryId}
              onGoToRegister={() => {
                setActiveTab('register');
                setSuccessData(null);
              }}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;
