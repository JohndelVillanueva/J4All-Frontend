import React, { useState } from "react";
import PositionsModal from "../../modals/Find-Job"; // Ensure path is correct
// import { Moon, Sun } from "lucide-react";

const PWDWelcomePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      {isModalOpen && <PositionsModal onClose={() => setIsModalOpen(false)} />}
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-900">
            Accessibility For All
          </div>
          <div className="hidden md:flex space-x-6">
            <a href="#resources" className="text-blue-900 hover:text-blue-700">Resources</a>
            <a href="#community" className="text-blue-900 hover:text-blue-700">Community</a>
            <a href="#rights" className="text-blue-900 hover:text-blue-700">Your Rights</a>
            <a href="#contact" className="text-blue-900 hover:text-blue-700">Contact</a>
          </div>
        </nav>

        <section className="container mx-auto px-4 py-16 text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-1 bg-blue-700 rounded-full"></div>
          </div>
          <h1 className="text-5xl font-bold text-blue-900 mb-6">
            Empowering <span className="text-blue-700">Persons With Disabilities</span>
          </h1>
          <p className="text-xl text-blue-800 mb-8 max-w-2xl mx-auto">
            Advocating for accessibility, inclusion, and equal opportunities for all
          </p>
          <div className="mt-12 rounded-xl overflow-hidden shadow-xl max-w-4xl mx-auto">
            <img
              src="../Images/pwd.jpg"
              alt="Diverse group of people with disabilities"
              className="w-full h-auto object-cover"
              loading="lazy"
            />
          </div>
        </section>

        <section className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[{
              id: "resources",
              title: "Accessibility Resources",
              desc: "Find tools, guides, and technologies to improve accessibility.",
              icon: (
                <svg className="h-10 w-10 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              ),
              cta: "Explore more",
            }, {
              id: "community",
              title: "Support Community",
              desc: "Connect with others, share experiences, and find support.",
              icon: (
                <svg className="h-10 w-10 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
                </svg>
              ),
              cta: "Get involved",
            }, {
              id: "rights",
              title: "Know Your Rights",
              desc: "Learn about disability rights laws and accommodations.",
              icon: (
                <svg className="h-10 w-10 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              ),
              cta: "Learn more",
            }].map((card) => (
              <div key={card.id} id={card.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="mb-4">{card.icon}</div>
                <h2 className="text-2xl font-semibold text-blue-900 mb-4">{card.title}</h2>
                <p className="text-gray-700 mb-4">{card.desc}</p>
                <a href="#" className="text-blue-700 hover:text-blue-900 font-medium inline-flex items-center">
                  {card.cta}
                  <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        </section>

        <section className="text-center container mx-auto px-4 py-16">
          <div className="bg-white rounded-xl shadow-xl p-8 md:p-12 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-blue-900 mb-4">
              Inclusive Employment Opportunities
            </h2>
            <p className="text-gray-700 mb-8 max-w-2xl mx-auto">
              Discover employers committed to accessibility and find job opportunities that value diversity and inclusion.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button onClick={() => setIsModalOpen(true)} className="px-8 py-3 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors shadow-md hover:shadow-lg">
                View Accessible Jobs
              </button>
              <button className="px-8 py-3 border-2 border-blue-700 text-blue-700 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                Employer Resources
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PWDWelcomePage;