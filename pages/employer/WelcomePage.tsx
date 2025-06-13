import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ApplicantModal from '../../modals/ApplicantModal';
import JobPostingModal from '../../modals/JobPostingModal'; // Add this import
import { XMarkIcon, MapPinIcon, BriefcaseIcon, CurrencyDollarIcon, ClockIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

function EmployerWelcomePage() {
  const [showApplicantModal, setShowApplicantModal] = useState(false);
  const [showJobPostingModal, setShowJobPostingModal] = useState(false);
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  const services = [
    '🧱 Construction Staffing',
    '🩺 Healthcare Professionals',
    '💻 IT & Technical Experts',
    '⚙️ Manufacturing Workers',
    '🧼 Housekeeping & Maintenance',
    '🛫 Overseas Job Placement'
  ];

  const workers = [
    { name: 'John D.', role: 'Certified Welder with 5+ years of experience' },
    { name: 'Maria L.', role: 'Registered Nurse, fluent in English & Arabic' },
    { name: 'Ahmed K.', role: 'Web Developer – Frontend & Backend expert' }
  ];

  const testimonials = [
    {
      quote: "This agency helped us build a stronger and more inclusive workforce.",
      name: "Mark T.",
      company: "ConstructionPro Inc."
    },
    {
      quote: "We hired amazing talent while supporting diversity. Highly recommended.",
      name: "Sarah N.",
      company: "Tech Solutions"
    },
    {
      quote: "They connected us with skilled Indigenous professionals—seamless process.",
      name: "Liam K.",
      company: "GreenFuture Manufacturing"
    }
  ];

  const logos = [
    'https://upload.wikimedia.org/wikipedia/commons/a/ab/Logo_TV_2015.png',
    'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
    'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
    'https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg'
  ];

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  const paginateTestimonial = (dir: number) => {
    setTestimonialIndex((prev) => (prev + dir + testimonials.length) % testimonials.length);
  };

  return (
    <div className={`font-sans bg-gray-50 text-gray-800 ${(showApplicantModal || showJobPostingModal) ? 'overflow-hidden h-screen' : ''}`}>
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-indigo-700 to-blue-800 text-white py-20 px-4 text-center">
        <motion.h1
          className="text-5xl font-extrabold mb-4"
          initial="hidden"
          whileInView="visible"
          variants={fadeUp}
          transition={{ duration: 0.6 }}
        >
          Empowering PWD & Indigenous Workers
        </motion.h1>
        <motion.p
          className="text-xl mb-6 max-w-2xl mx-auto"
          initial="hidden"
          whileInView="visible"
          variants={fadeUp}
          transition={{ delay: 0.2 }}
        >
          Bridging inclusive talent with companies that believe in equal opportunity and workforce diversity.
        </motion.p>
        <motion.button
          className="bg-white text-blue-700 font-semibold px-6 py-3 rounded-full hover:bg-gray-100 shadow-md transition"
          whileHover={{ scale: 1.05 }}
        >
          Partner With Us
        </motion.button>
      </header>

      {/* Call-to-Action Buttons */}
      <section className="bg-white py-8 px-4 text-center">
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <button
            onClick={() => setShowApplicantModal(true)}
            className="bg-blue-700 text-white font-semibold px-6 py-3 rounded-full hover:bg-blue-800 transition shadow-md"
          >
            View All PWD & Indigenous Applicants
          </button>
          <button
            onClick={() => setShowJobPostingModal(true)}
            className="bg-green-600 text-white font-semibold px-6 py-3 rounded-full hover:bg-green-700 transition shadow-md"
          >
            Post a Job
          </button>
        </div>
      </section>

      {/* Modals */}
      <AnimatePresence>
        {showApplicantModal && (
          <ApplicantModal showModal={showApplicantModal} onClose={() => setShowApplicantModal(false)} />
        )}
        {showJobPostingModal && (
          <JobPostingModal onClose={() => setShowJobPostingModal(false)} />
        )}
      </AnimatePresence>

      {/* About Section */}
      <section className="py-12 px-4 text-center">
        <h2 className="text-3xl font-bold mb-6">Why Choose Us?</h2>
        <p className="text-gray-600 max-w-3xl mx-auto">
          We specialize in connecting Persons With Disabilities (PWD) and Indigenous individuals with companies that value inclusive hiring practices. Our vetted pool of talented individuals ensures a perfect fit for your organizational needs.
        </p>
      </section>

      {/* Services */}
      <section className="bg-gray-100 py-12 px-4 text-center">
        <h2 className="text-3xl font-bold mb-8">Our Services</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {services.map((service, i) => (
            <motion.div
              key={i}
              className="bg-white rounded-xl shadow p-6"
              initial="hidden"
              whileInView="visible"
              variants={fadeUp}
              transition={{ delay: i * 0.1 }}
            >
              <p className="text-xl">{service}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Workers */}
      <section className="py-12 px-4 text-center">
        <h2 className="text-3xl font-bold mb-6">Featured Workers</h2>
        <div className="flex flex-wrap justify-center gap-6">
          {workers.map((worker, i) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-md w-72">
              <h3 className="font-bold text-lg">{worker.name}</h3>
              <p className="text-gray-600 text-sm">{worker.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-blue-50 py-12 px-4 text-center">
        <h2 className="text-3xl font-bold mb-6">What Our Partners Say</h2>
        <div className="max-w-xl mx-auto">
          <motion.div
            key={testimonialIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <p className="italic mb-4">"{testimonials[testimonialIndex].quote}"</p>
            <p className="font-semibold">{testimonials[testimonialIndex].name}, {testimonials[testimonialIndex].company}</p>
          </motion.div>
          <div className="flex justify-center mt-4 gap-4">
            <button onClick={() => paginateTestimonial(-1)}>&larr;</button>
            <button onClick={() => paginateTestimonial(1)}>&rarr;</button>
          </div>
        </div>
      </section>

      {/* Trusted By Logos */}
      <section className="py-12 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Trusted By</h2>
        <div className="flex flex-wrap justify-center gap-8 items-center">
          {logos.map((logo, i) => (
            <img key={i} src={logo} alt={`Partner ${i}`} className="h-12 object-contain" />
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-gray-900 text-white py-12 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Build an Inclusive Team?</h2>
        <p className="mb-6">Contact us today and discover a diverse talent pool waiting to contribute.</p>
        <button className="bg-white text-blue-900 font-bold px-6 py-3 rounded-full hover:bg-gray-200 transition">Get In Touch</button>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white text-center py-4">
        &copy; {new Date().getFullYear()} InclusiveHire Agency. All rights reserved.
      </footer>
    </div>
  );
}

export default EmployerWelcomePage;