// Support Component

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, HelpCircle, Globe } from 'lucide-react';

// FAQ Item
const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-gray-700 last:border-0">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-6 flex items-center justify-between text-left group"
            >
                <span className={`text-base md:text-lg font-bold transition-colors ${isOpen ? 'text-accent-main' : 'text-white group-hover:text-accent-main'}`}>
                    {question}
                </span>
                {isOpen ? <ChevronUp className="text-accent-main" size={20} /> : <ChevronDown className="text-gray-500" size={20} />}
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-6' : 'max-h-0'}`}>
                <p className="text-base text-gray-400 leading-relaxed max-w-3xl">
                    {answer}
                </p>
            </div>
        </div>
    );
};

// Charity Card
const CharityCard = ({ name, description, phone, link, logo }) => (
    <div className="bg-white/5 p-8 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors flex flex-col justify-between group h-full">
        <div className="space-y-5">
            <div className="flex items-center justify-between mb-2">
                {/* Logo Container */}
                <div className="w-32 h-16 flex items-center justify-start overflow-hidden shrink-0">
                    {logo ? (
                        <img 
                            src={logo} 
                            alt={`${name} logo`} 
                            className="w-full h-full object-contain object-left" 
                        />
                    ) : (
                        <Globe size={32} className="text-accent-main" />
                    )}
                </div>
            </div>
            <div className="space-y-3">
                <h3 className="text-xl font-bold text-white">{name}</h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                    {description}
                </p>
            </div>
        </div>
        <div className="pt-8 flex flex-col gap-4">
            </div>
            <a 
                href={link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-accent-main hover:text-white transition-colors"
            >
                Visit Website <ExternalLink size={14} />
            </a>
    </div>
);

const Support = () => {
    const faqs = [
        {
            question: "How does the 'Safe-to-Spend' calculation work?",
            answer: "The 'Safe-to-Spend' metric takes your current balance, subtracts your upcoming bills and savings targets, and divides the remainder by the days left in your budget cycle. This provides a daily allowance that prevents overspending."
        },
        {
            question: "Where is my financial data stored?",
            answer: "This site utilizes a 'Local-First' storage model. By default, your data is encrypted and stored strictly on your device. You can choose to enable Cloud Sync in settings if you wish to access your data across multiple devices."
        }
    ];

    const charities = [
        {
            name: "MoneyHelper",
            description: "Free, impartial money and pensions guidance provided by the UK Government's Money and Pensions Service.",
            link: "https://www.moneyhelper.org.uk/en",
            logo: "/assets/logos/moneyhelper.png"
        },
        {
            name: "Citizens Advice",
            description: "A network of independent charities offering free, confidential advice on debt, money, and consumer rights.",
            link: "https://www.citizensadvice.org.uk/",
            logo: "/assets/logos/citizens-advice.png"
        },
        {
            name: "Mind",
            description: "Mental health support that helps you understand the complex link between your mental health and money.",
            link: "https://www.mind.org.uk/",
            logo: "/assets/logos/mind.png"
        },
        {
            name: "NHS Better Health",
            description: "Support and tools to help you make small, manageable changes to improve your health and wellbeing.",
            link: "https://www.nhs.uk/better-health/",
            logo: "/assets/logos/nhs.png"
        }
    ];

    return (
        <main className="w-full bg-background-tertiary min-h-screen py-12 md:py-20 px-6">
            <div className="max-w-6xl mx-auto space-y-12">
                
                <header className="text-center space-y-4">
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">Support Hub</h1>
                    <p className="text-white/90 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                        Access specialized support for expert financial guidance and find answers to common questions.
                    </p>
                </header>

                <div className="bg-background-secondary rounded-3xl shadow-2xl border border-white/5 overflow-hidden">
                    
                    {/* Charity Grid */}
                    <section className="p-8 md:p-12 space-y-8 bg-black/5 border-b border-gray-700">
                        <div className="flex items-center gap-3">
                            <Globe className="text-accent-main" size={24} />
                            <h2 className="text-2xl font-bold text-white uppercase tracking-tighter">Support Charities</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {charities.map((charity, index) => (
                                <CharityCard key={index} {...charity} />
                            ))}
                        </div>
                    </section>

                    {/* FAQ Section */}
                    <section className="p-8 md:p-12">
                        <div className="flex items-center gap-3 mb-8">
                            <HelpCircle className="text-accent-main" size={24} />
                            <h2 className="text-2xl font-bold text-white">Frequently Asked Questions</h2>
                        </div>
                        <div className="divide-y divide-gray-700">
                            {faqs.map((faq, index) => (
                                <FAQItem key={index} {...faq} />
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
};

export default Support;