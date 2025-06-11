import React, { useState } from "react";

interface PositionsModalProps {
  onClose: () => void;
}
interface Job {
  title: string;
  location: string;
  type: string;
  description: string;
  tags: string[];
}

const PositionsModal: React.FC<PositionsModalProps> = ({ onClose }) => {
  const sampleJobs = [
    {
      title: "Cultural Program Coordinator",
      location: "Remote",
      type: "Full-time",
      description: "Develop and implement cultural programs that honor indigenous traditions and connect communities.",
      tags: ["culture", "program", "remote"]
    },
    {
      title: "Community Outreach Specialist",
      location: "Various Locations",
      type: "Part-time",
      description: "Build relationships with indigenous communities and organize events that celebrate cultural heritage.",
      tags: ["community", "outreach", "events"]
    },
    {
      title: "Education Content Developer",
      location: "Remote",
      type: "Contract",
      description: "Create educational materials about indigenous heritage, history, and contemporary issues.",
      tags: ["education", "content", "remote"]
    },
    {
      title: "Cultural Heritage Researcher",
      location: "Remote",
      type: "Full-time",
      description: "Conduct research on indigenous cultures and contribute to the preservation of cultural knowledge.",
      tags: ["research", "heritage", "remote"]
    },
    {
      title: "Event Coordinator for Indigenous Festivals",
      location: "Various Locations",
      type: "Seasonal",
      description: "Plan and execute festivals that showcase indigenous arts, crafts, and performances.",
      tags: ["events", "festivals", "arts"]
    },
    {
      title: "Social Media Manager for Indigenous Initiatives",
      location: "Remote",
      type: "Part-time",
      description: "Manage social media campaigns that promote indigenous culture and community events.",
      tags: ["social media", "marketing", "remote"]
    },
    {
      title: "Grant Writer for Indigenous Organizations",
      location: "Remote",
      type: "Contract",
      description: "Write grant proposals to secure funding for projects that support indigenous communities.",
      tags: ["grant", "writing", "remote"]
    },
    {
      title: "Cultural Heritage Tour Guide",
      location: "Various Locations",
      type: "Part-time",
      description: "Lead tours that educate visitors about indigenous cultures and their historical significance.",
      tags: ["tour", "guide", "heritage"]
    },
    {
      title: "Indigenous Arts Program Manager",
      location: "Remote",
      type: "Full-time",
      description: "Oversee programs that promote indigenous arts and connect artists with opportunities.",
      tags: ["arts", "program", "remote"]
    },
    {
      title: "Language Preservation Specialist",
      location: "Remote",
      type: "Contract",
      description: "Work on initiatives to preserve and revitalize indigenous languages through various media.",
      tags: ["language", "preservation", "remote"]
    },
    {
      title: "Cultural Heritage Digital Archivist",
      location: "Remote",
      type: "Full-time",
      description: "Digitally archive artifacts, documents, and oral histories related to indigenous cultures.",
      tags: ["archive", "digital", "heritage"]
    },
    {
      title: "Indigenous Rights Advocate",
      location: "Remote",
      type: "Full-time",
      description: "Advocate for the rights of indigenous peoples and work on policy initiatives that support their communities.",
      tags: ["advocacy", "rights", "remote"]
    },
    {
      title: "Cultural Festival Organizer",
      location: "Various Locations",
      type: "Seasonal",
      description: "Organize cultural festivals that celebrate indigenous traditions and bring communities together.",
      tags: ["festival", "organizer", "culture"]
    },
    {
      title: "Indigenous Youth Program Coordinator",
      location: "Remote",
      type: "Full-time",
      description: "Develop programs that empower indigenous youth through cultural education and leadership opportunities.",
      tags: ["youth", "program", "remote"]
    },
    {
      title: "Cultural Heritage Consultant",
      location: "Remote",
      type: "Contract",
      description: "Provide expertise on indigenous cultural practices to organizations and institutions.",
      tags: ["consultant", "heritage", "remote"]
    },
    {
      title: "Indigenous Community Development Specialist",
      location: "Various Locations",
      type: "Full-time",
      description: "Work with indigenous communities to develop sustainable projects that enhance their cultural heritage.",
      tags: ["community", "development", "specialist"]
    }
    
  ];

  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const clearFilters = () => {
    setFilter("All");
    setSearchTerm("");
  };

  const handleTagClick = (tag: string) => {
    setSearchTerm(tag);
  };

  const highlightText = (text: string, term: string) => {
    if (!term) return text;
    const regex = new RegExp(`(${term})`, "gi");
    return text.split(regex).map((part, i) =>
      regex.test(part) ? <mark key={i} className="bg-yellow-200 px-1 rounded">{part}</mark> : part
    );
  };

  const filteredJobs = sampleJobs.filter(job => {
    const matchesType = filter === "All" || job.type === filter;
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      job.title.toLowerCase().includes(search) ||
      job.description.toLowerCase().includes(search) ||
      job.tags.some(tag => tag.toLowerCase().includes(search));
    return matchesType && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 backdrop-blur-sm bg-black/10 transition-opacity" />
      <div className="flex items-center justify-center min-h-screen p-4">
        <div
          className={`relative ${darkMode ? "bg-gray-900 text-white" : "bg-white text-black"} rounded-xl shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Header */}
          <div className={`sticky top-0 p-6 border-b ${darkMode ? "border-gray-700" : "border-gray-200"} rounded-t-xl flex justify-between items-center`}>
            <h2 id="modal-title" className="text-2xl font-bold text-amber-700">
              Open Positions
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="text-xl hover:text-amber-700 focus:outline-none"
                aria-label="Toggle dark mode"
              >
                {darkMode ? "🌙" : "☀️"}
              </button>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
                aria-label="Close modal"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="px-6 pt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex gap-2 items-center">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-sm text-black"
              >
                <option value="All">All</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
              <button
                onClick={clearFilters}
                className="text-sm px-3 py-2 bg-gray-100 border rounded hover:bg-gray-200 text-black"
              >
                Clear Filters
              </button>
            </div>

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search job titles, descriptions, or tags..."
              className="border border-gray-300 rounded px-3 py-2 text-sm text-black w-full md:w-1/2"
            />
          </div>

          {/* Job Grid */}
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job, index) => (
                  <div
                    key={index}
                    className={`relative border rounded-lg p-4 pb-16 hover:shadow-md transition-shadow ${darkMode ? "border-gray-700 bg-gray-800 text-white" : "border-gray-200 bg-white"}`}
                  >
                    <h3 className="text-xl font-semibold text-amber-700">{highlightText(job.title, searchTerm)}</h3>
                    <div className="flex items-center mt-2 space-x-4 text-sm text-gray-600 dark:text-gray-300">
                      <span className="flex items-center">📍 {job.location}</span>
                      <span className="flex items-center">🕒 {job.type}</span>
                    </div>
                    <p className="mt-3 text-gray-700 dark:text-gray-200">{highlightText(job.description, searchTerm)}</p>
                    <div className="mt-2 flex flex-wrap gap-1 text-xs">
                      {job.tags.map((tag, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleTagClick(tag)}
                          className="bg-amber-50 border border-amber-200 px-2 py-1 rounded text-amber-700 hover:bg-amber-100"
                        >
                          #{highlightText(tag, searchTerm)}
                        </button>
                      ))}
                    </div>
                    <div className="absolute bottom-4 left-0 w-full px-4">
                      <button className="w-full px-4 py-2 bg-amber-700 text-white rounded-lg text-sm font-medium hover:bg-amber-800 transition-colors">
                        Apply Now
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center text-gray-500 dark:text-gray-400">
                  No positions found matching your criteria.
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className={`p-4 border-t rounded-b-xl flex justify-end ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PositionsModal;


