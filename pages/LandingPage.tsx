import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Users, Briefcase, Shield, Heart, ArrowRight, CheckCircle } from 'lucide-react';

const LandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [stats, setStats] = useState({
    activeUsers: '0+',
    jobListings: '0+',
    partnerEmployers: '0+'
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch real statistics from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Use environment variable for API base URL
        const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://j4pwds.com';
        const response = await fetch(`${apiUrl}/api/stats`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          setStats({
            activeUsers: data.data.activeUsers.formatted,
            jobListings: data.data.jobListings.formatted,
            partnerEmployers: data.data.partnerEmployers.formatted
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Keep default values if fetch fails
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  const features = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Inclusive Community",
      description: "Connect with a supportive network designed specifically for persons with disabilities."
    },
    {
      icon: <Briefcase className="w-8 h-8" />,
      title: "Job Opportunities",
      description: "Access exclusive employment opportunities from inclusive employers committed to diversity."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure & Accessible",
      description: "Platform built with accessibility in mind, ensuring everyone can navigate with ease and security."
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Personalized Support",
      description: "Tailored resources and guidance based on your unique needs and aspirations."
    }
  ];

  const statsData = [
    { number: stats.activeUsers, label: "Active Users" },
    { number: stats.jobListings, label: "Job Listings" },
    { number: stats.partnerEmployers, label: "Partner Employers" }
  ];

  const userTypes = [
    {
      type: "PWD Applicants",
      icon: <Users className="w-12 h-12" />,
      description: "Find meaningful employment opportunities and resources tailored to your abilities.",
      benefits: ["Personalized job matches", "Accessibility support", "Career guidance", "Skills development"]
    },
    {
      type: "Employers",
      icon: <Briefcase className="w-12 h-12" />,
      description: "Build a diverse, inclusive workforce and meet your social responsibility goals.",
      benefits: ["Qualified candidates", "Compliance support", "Diversity metrics", "HR resources"]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <motion.nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/90 backdrop-blur-md shadow-lg' : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="/Images/logo1.jpg" 
                alt="J4PWDs Logo" 
                className="w-12 h-12 rounded-full border-2 border-indigo-200 object-contain bg-white"
              />
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                J4PWD's
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-indigo-600 transition-colors font-medium">Features</a>
              <a href="#about" className="text-gray-700 hover:text-indigo-600 transition-colors font-medium">About</a>
              <a href="#contact" className="text-gray-700 hover:text-indigo-600 transition-colors font-medium">Contact</a>
              <motion.a
                href="/login"
                className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign In
              </motion.a>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100" />
          <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-indigo-300 opacity-20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-300 opacity-20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <motion.div
          className="container mx-auto px-4 z-10 text-center"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                Empowering Everyone
              </span>
              <br />
              <span className="text-gray-800">Through Inclusive Opportunities</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Connecting persons with disabilities with meaningful employment and resources in a supportive, accessible platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="/SignUpPage"
                className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all inline-flex items-center justify-center gap-2"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started <ArrowRight className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="#features"
                className="px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all border-2 border-gray-200"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Learn More
              </motion.a>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-3 gap-8 mt-20 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {statsData.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">
                  {isLoadingStats ? (
                    <div className="animate-pulse">...</div>
                  ) : (
                    stat.number
                  )}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white relative">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
              Why Choose <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">J4PWD's</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A comprehensive platform designed with accessibility and inclusion at its core
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="p-6 rounded-2xl bg-gradient-to-br from-white to-indigo-50 border border-indigo-100 shadow-lg hover:shadow-xl transition-all"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section id="about" className="py-24 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
              Built For <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Everyone</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tailored experiences for applicants and employers alike
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {userTypes.map((user, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg">
                  {user.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-800">{user.type}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{user.description}</p>
                <ul className="space-y-3">
                  {user.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              Join thousands of users who have found success through our inclusive platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="/SignUpPage"
                className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all inline-flex items-center justify-center gap-2"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Create Account <ArrowRight className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="/EmployerSignUpForm"
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-semibold text-lg hover:bg-white/10 transition-all"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Employer Sign Up
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src="/Images/logo1.jpg" 
                  alt="J4PWDs Logo" 
                  className="w-10 h-10 rounded-full border-2 border-indigo-400 object-contain bg-white"
                />
                <span className="text-xl font-bold">J4PWD's</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Empowering everyone through inclusive opportunities and accessible technology.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
                <li><a href="/Login" className="hover:text-white transition-colors">Sign In</a></li>
                <li><a href="/SignUpPage" className="hover:text-white transition-colors">Sign Up</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <p className="text-gray-400 mb-2">support@j4ipwds.com</p>
              <p className="text-gray-400">Quezon City, Metro Manila, PH</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 J4PWD's. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;