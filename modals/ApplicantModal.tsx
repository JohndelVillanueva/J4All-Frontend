import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiX, FiChevronUp, FiChevronDown, FiFileText, FiEdit2, FiCheck, FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface Applicant {
  id: number;
  name: string;
  email: string;
  phone: string;
  resume: string;
  status: "Pending" | "Interviewed" | "Hired" | "Failed";
  position: string;
  appliedDate: string;
}

interface ApplicantModalProps {
  showModal: boolean;
  onClose: () => void;
}

const sampleApplicants: Applicant[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    phone: "0917-123-4567",
    resume: "#",
    status: "Pending",
    position: "Frontend Developer",
    appliedDate: "2023-05-15"
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "0918-234-5678",
    resume: "#",
    status: "Interviewed",
    position: "UX Designer",
    appliedDate: "2023-05-18"
  },
  {
    id: 3,
    name: "Michael Lee",
    email: "michael@example.com",
    phone: "0920-345-6789",
    resume: "#",
    status: "Hired",
    position: "Backend Developer",
    appliedDate: "2023-05-10"
  },
  {
    id: 4,
    name: "Sarah Tan",
    email: "sarah@example.com",
    phone: "0921-000-1234",
    resume: "#",
    status: "Pending",
    position: "Project Manager",
    appliedDate: "2023-06-02"
  },
  {
    id: 5,
    name: "Chris Yu",
    email: "chris@example.com",
    phone: "0932-111-2222",
    resume: "#",
    status: "Interviewed",
    position: "QA Tester",
    appliedDate: "2023-05-28"
  },
  {
    id: 6,
    name: "Anna Lim",
    email: "anna@example.com",
    phone: "0943-222-3333",
    resume: "#",
    status: "Pending",
    position: "DevOps Engineer",
    appliedDate: "2023-06-05"
  },
  {
    id: 7,
    name: "Mark Chan",
    email: "mark@example.com",
    phone: "0954-333-4444",
    resume: "#",
    status: "Hired",
    position: "Data Analyst",
    appliedDate: "2023-04-30"
  },
  {
    id: 8,
    name: "Emily Wong",
    email: "emily@example.com",
    phone: "0965-444-5555",
    resume: "#",
    status: "Pending",
    position: "Product Designer",
    appliedDate: "2023-06-10"
  },
  {
    id: 9,
    name: "David Koh",
    email: "david@example.com",
    phone: "0976-555-6666",
    resume: "#",
    status: "Interviewed",
    position: "Full Stack Developer",
    appliedDate: "2023-05-22"
  },
  {
    id: 10,
    name: "Rachel Ng",
    email: "rachel@example.com",
    phone: "0987-666-7777",
    resume: "#",
    status: "Hired",
    position: "Marketing Specialist",
    appliedDate: "2023-04-15"
  },
  {
    id: 11,
    name: "Kevin Zhang",
    email: "kevin@example.com",
    phone: "0998-777-8888",
    resume: "#",
    status: "Pending",
    position: "Mobile Developer",
    appliedDate: "2023-06-12"
  },
  {
    id: 12,
    name: "Lisa Park",
    email: "lisa@example.com",
    phone: "0911-888-9999",
    resume: "#",
    status: "Interviewed",
    position: "UI/UX Designer",
    appliedDate: "2023-05-30"
  },
  {
    id: 13,
    name: "Daniel Kim",
    email: "daniel@example.com",
    phone: "0912-999-0000",
    resume: "#",
    status: "Pending",
    position: "Systems Architect",
    appliedDate: "2023-06-08"
  },
  {
    id: 14,
    name: "Olivia Chen",
    email: "olivia@example.com",
    phone: "0913-123-7890",
    resume: "#",
    status: "Hired",
    position: "Content Strategist",
    appliedDate: "2023-05-05"
  },
  {
    id: 15,
    name: "Ethan Tan",
    email: "ethan@example.com",
    phone: "0914-456-1234",
    resume: "#",
    status: "Interviewed",
    position: "Technical Writer",
    appliedDate: "2023-06-01"
  },
  {
    id: 16,
    name: "Sophia Lim",
    email: "sophia@example.com",
    phone: "0915-789-4567",
    resume: "#",
    status: "Pending",
    position: "Data Scientist",
    appliedDate: "2023-06-15"
  },
  {
    id: 17,
    name: "Aaron Wong",
    email: "aaron@example.com",
    phone: "0916-321-6549",
    resume: "#",
    status: "Hired",
    position: "Cloud Engineer",
    appliedDate: "2023-04-20"
  },
  {
    id: 18,
    name: "Grace Ho",
    email: "grace@example.com",
    phone: "0919-654-9873",
    resume: "#",
    status: "Interviewed",
    position: "Scrum Master",
    appliedDate: "2023-05-25"
  },
  {
    id: 19,
    name: "Benjamin Teo",
    email: "benjamin@example.com",
    phone: "0922-987-3216",
    resume: "#",
    status: "Pending",
    position: "Security Analyst",
    appliedDate: "2023-06-18"
  },
  {
    id: 20,
    name: "Michelle Goh",
    email: "michelle@example.com",
    phone: "0923-159-7538",
    resume: "#",
    status: "Hired",
    position: "HR Specialist",
    appliedDate: "2023-03-15"
  }
];

const statusColors = {
  Pending: { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" },
  Interviewed: { bg: "bg-blue-50", text: "text-blue-800", border: "border-blue-200" },
  Hired: { bg: "bg-green-50", text: "text-green-800", border: "border-green-200" },
  Failed: { bg: "bg-red-50", text: "text-red-800", border: "border-red-200" }
};

const ApplicantModal: React.FC<ApplicantModalProps> = ({ showModal, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<keyof Applicant>("appliedDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingStatus, setEditingStatus] = useState<{id: number | null, value: Applicant["status"]}>({ id: null, value: "Pending" });
  const [applicants, setApplicants] = useState<Applicant[]>(sampleApplicants);

  const itemsPerPage = 8;

  const columns = [
    { key: "name", label: "Name", className: "min-w-[120px] sticky left-0 bg-white z-10" },
    { key: "position", label: "Position", className: "min-w-[150px] hidden md:table-cell" },
    { key: "email", label: "Email", className: "min-w-[180px] hidden lg:table-cell" },
    { key: "phone", label: "Phone", className: "min-w-[120px]" },
    { key: "appliedDate", label: "Applied", className: "min-w-[100px]" },
    { key: "status", label: "Status", className: "min-w-[120px]" },
    { key: "resume", label: "Resume", className: "min-w-[80px] sticky right-0 bg-white z-10" }
  ];

  const filteredApplicants = useMemo(() => {
    return applicants.filter(applicant => 
      Object.values(applicant).join(" ").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [applicants, searchQuery]);

  const sortedApplicants = useMemo(() => {
    return [...filteredApplicants].sort((a, b) => {
      const valA = a[sortKey].toString().toLowerCase();
      const valB = b[sortKey].toString().toLowerCase();
      
      if (sortKey === "appliedDate") {
        return sortOrder === "asc" 
          ? new Date(a.appliedDate).getTime() - new Date(b.appliedDate).getTime()
          : new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime();
      }
      
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredApplicants, sortKey, sortOrder]);

  const paginatedApplicants = useMemo(() => {
    return sortedApplicants.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [sortedApplicants, currentPage]);

  const totalPages = Math.ceil(filteredApplicants.length / itemsPerPage);

  const handleSort = (key: keyof Applicant) => {
    if (sortKey === key) {
      setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const updateStatus = (id: number, newStatus: Applicant["status"]) => {
    setApplicants(prev => 
      prev.map(applicant => 
        applicant.id === id ? { ...applicant, status: newStatus } : applicant
      )
    );
    setEditingStatus({ id: null, value: "Pending" });
  };

  const StatusBadge: React.FC<{ status: Applicant["status"] }> = ({ status }) => (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColors[status].bg} ${statusColors[status].text} ${statusColors[status].border}`}>
      {status}
    </span>
  );

  return (
    <AnimatePresence>
      {showModal && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />
          
          <motion.div
            className="fixed top-1/2 left-1/2 z-50 bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] transform -translate-x-1/2 -translate-y-1/2 flex flex-col"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25 }}
          >
            <div className="p-6 pb-0 flex justify-between items-center border-b">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Applicant Management</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {filteredApplicants.length} applicants found
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close modal"
              >
                <FiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by name, email, position..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              <div className="overflow-visible rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {columns.map(({ key, label, className }) => (
                        <th
                          key={key}
                          scope="col"
                          className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className} ${
                            key !== "actions" ? "cursor-pointer hover:bg-gray-100" : ""
                          }`}
                          onClick={() => key !== "actions" && handleSort(key as keyof Applicant)}
                        >
                          <div className="flex items-center">
                            {label}
                            {sortKey === key && (
                              <span className="ml-1">
                                {sortOrder === "asc" ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
                              </span>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedApplicants.length > 0 ? (
                      paginatedApplicants.map((applicant) => (
                        <tr key={applicant.id} className="hover:bg-gray-50 relative">
                          <td className="px-4 py-3 whitespace-nowrap sticky left-0 bg-white z-10">
                            <div className="font-medium text-gray-900 truncate max-w-[120px]">
                              {applicant.name}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
                            <div className="text-gray-900 truncate max-w-[150px]">
                              {applicant.position}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap hidden lg:table-cell">
                            <div className="text-gray-900 truncate max-w-[180px]">
                              {applicant.email}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-gray-900">
                              {applicant.phone}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-gray-500">
                              {new Date(applicant.appliedDate).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {editingStatus.id === applicant.id ? (
                              <div className="flex items-center space-x-2">
                                <select
                                  value={editingStatus.value}
                                  onChange={(e) => setEditingStatus({
                                    id: applicant.id,
                                    value: e.target.value as Applicant["status"]
                                  })}
                                  className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  autoFocus
                                >
                                  {Object.keys(statusColors).map((status) => (
                                    <option key={status} value={status}>
                                      {status}
                                    </option>
                                  ))}
                                </select>
                                <button
                                  onClick={() => updateStatus(applicant.id, editingStatus.value)}
                                  className="p-1 text-green-600 hover:text-green-800"
                                  aria-label="Confirm status change"
                                >
                                  <FiCheck className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <StatusBadge status={applicant.status} />
                                <button
                                  onClick={() => setEditingStatus({
                                    id: applicant.id,
                                    value: applicant.status
                                  })}
                                  className="p-1 text-gray-500 hover:text-blue-600"
                                  aria-label="Edit status"
                                >
                                  <FiEdit2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap sticky right-0 bg-white z-10">
                            <a
                              href={applicant.resume}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-blue-600 hover:text-blue-900"
                            >
                              <FiFileText className="mr-1 w-4 h-4" />
                              <span className="hidden sm:inline">Resume</span>
                            </a>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                          No applicants found matching your search criteria
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between mt-4 px-2">
                <div className="text-sm text-gray-500">
                  Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, filteredApplicants.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredApplicants.length}</span> results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md flex items-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <FiChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-3 py-1 border border-gray-300 rounded-md flex items-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                    <FiChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ApplicantModal;