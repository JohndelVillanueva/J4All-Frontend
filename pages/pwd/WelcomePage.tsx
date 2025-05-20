const PWDWelcomePage = () => {
    return ( 
<div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      {/* Navigation (added for better UX) */}
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-blue-900">
          Accessibility For All
        </div>
        <div className="hidden md:flex space-x-6">
          <a
            href="#resources"
            className="text-blue-900 hover:text-blue-700 transition-colors"
          >
            Resources
          </a>
          <a
            href="#community"
            className="text-blue-900 hover:text-blue-700 transition-colors"
          >
            Community
          </a>
          <a
            href="#rights"
            className="text-blue-900 hover:text-blue-700 transition-colors"
          >
            Your Rights
          </a>
          <a
            href="#contact"
            className="text-blue-900 hover:text-blue-700 transition-colors"
          >
            Contact
          </a>
        </div>
        <button className="md:hidden text-blue-900" aria-label="Menu">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </nav>

      {/* Hero Section - Enhanced with imagery */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center">
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
        </div>
      </section>

      {/* Main Content - Improved sections with icons */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Resources Section */}
          <div
            id="resources"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="text-blue-700 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-blue-900 mb-4">
              Accessibility Resources
            </h2>
            <p className="text-gray-700 mb-4">
              Find tools, guides, and technologies to improve accessibility in your daily life and workplace.
            </p>
            <a
              href="#"
              className="text-blue-700 hover:text-blue-900 font-medium inline-flex items-center"
              aria-label="Explore more resources"
            >
              Explore more
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </a>
          </div>

          {/* Community Section */}
          <div
            id="community"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="text-blue-700 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-blue-900 mb-4">
              Support Community
            </h2>
            <p className="text-gray-700 mb-4">
              Connect with others, share experiences, and find support in our inclusive community.
            </p>
            <a
              href="#"
              className="text-blue-700 hover:text-blue-900 font-medium inline-flex items-center"
              aria-label="Get involved in the community"
            >
              Get involved
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </a>
          </div>

          {/* Rights Section */}
          <div
            id="rights"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="text-blue-700 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-blue-900 mb-4">
              Know Your Rights
            </h2>
            <p className="text-gray-700 mb-4">
              Learn about disability rights laws, accommodations, and how to advocate for yourself.
            </p>
            <a
              href="#"
              className="text-blue-700 hover:text-blue-900 font-medium inline-flex items-center"
              aria-label="Learn about your rights"
            >
              Learn more
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="bg-blue-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 mx-auto mb-6 opacity-70"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <blockquote className="text-xl italic mb-6">
              "This community helped me understand my rights and gave me the confidence to request the accommodations I need at work."
            </blockquote>
            <div className="font-medium">— Jamal Carter, Wheelchair User</div>
          </div>
        </div>
      </section>

      {/* Call to Action - Enhanced */}
      <section
        id="careers"
        className="container mx-auto px-4 py-16 text-center"
      >
        <div className="bg-white rounded-xl shadow-xl p-8 md:p-12 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-blue-900 mb-4">
            Inclusive Employment Opportunities
          </h2>
          <p className="text-gray-700 mb-8 max-w-2xl mx-auto">
            Discover employers committed to accessibility and find job opportunities that value diversity and inclusion.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="px-8 py-3 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors shadow-md hover:shadow-lg">
              View Accessible Jobs
            </button>
            <button className="px-8 py-3 border-2 border-blue-700 text-blue-700 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              Employer Resources
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-blue-100 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="text-xl font-bold mb-2">Accessibility For All</div>
              <p className="text-sm opacity-80">
                Building a more inclusive world, one step at a time.
              </p>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-white transition-colors" aria-label="Facebook">
                <span className="sr-only">Facebook</span>
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a href="#" className="hover:text-white transition-colors" aria-label="Instagram">
                <span className="sr-only">Instagram</span>
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a href="#" className="hover:text-white transition-colors" aria-label="Twitter">
                <span className="sr-only">Twitter</span>
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-blue-800 text-sm text-center opacity-70">
            <p>
              © {new Date().getFullYear()} Accessibility For All. All rights reserved.
            </p>
            <p className="mt-2">Fully accessible website compliant with WCAG 2.1 AA standards</p>
          </div>
        </div>
      </footer>
    </div>
     );
}
 
export default PWDWelcomePage;