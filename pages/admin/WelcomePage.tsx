import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAdminStats,
  getAdminUsers,
  getAdminEmployers,
  getAdminActivities,
} from "../../src/services/notificationService";
import {
  FaCheckCircle,
  FaSpinner,
  FaBuilding,
  FaEnvelope,
  FaPhone,
  FaGlobe,
  FaCalendar,
  FaUsers,
  FaFileAlt,
  FaUserCircle,
  FaTimesCircle,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { useToast } from "../../components/ToastContainer";

type LabelType = "PWD" | "Statistic" | "Admin" | "Company";

type TableMode = "users" | "pwd" | "employers" | "pending-employers";

type Activity = {
  type: string;
  title: string;
  description: string;
  timestamp: string;
  status?: string;
};

const StatCard = ({
  title,
  value,
  subtitle,
  color,
  onClick,
  badge,
}: {
  title: string;
  value: number | string;
  subtitle?: string;
  color: string;
  onClick?: () => void;
  badge?: number;
}) => {
  const colorMap: Record<string, string> = {
    blue: "from-blue-500 to-indigo-500",
    green: "from-green-500 to-emerald-500",
    purple: "from-purple-500 to-fuchsia-500",
    orange: "from-orange-500 to-amber-500",
    indigo: "from-indigo-500 to-violet-500",
    yellow: "from-yellow-500 to-amber-500",
  };
  return (
    <div
      onClick={onClick}
      className={`group relative rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden`}
    >
      <div
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${
          colorMap[color] || colorMap.blue
        }`}
      />
      {badge && badge > 0 && (
        <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
          {badge}
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          <span className="text-xs font-semibold text-gray-500">View</span>
        </div>
        <div className="mt-2 text-3xl font-bold text-gray-900">{value}</div>
        {subtitle && (
          <div className="mt-1 text-xs text-gray-500">{subtitle}</div>
        )}
      </div>
    </div>
  );
};

const Modal: React.FC<{
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  size?: "default" | "large";
}> = ({ open, title, onClose, children, size = "default" }) => {
  if (!open) return null;
  const sizeClass = size === "large" ? "max-w-7xl" : "max-w-5xl";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div
        className={`relative z-10 w-full ${sizeClass} rounded-xl bg-white shadow-xl`}
      >
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <div className="p-5 overflow-auto max-h-[70vh]">{children}</div>
      </div>
    </div>
  );
};

const AdminWelcomePage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    totals: { users: number; employers: number };
    breakdown: { jobseekers: number; general: number; pwd: number };
  } | null>(null);

  // Modal/table state
  const [tableOpen, setTableOpen] = useState(false);
  const [tableMode, setTableMode] = useState<TableMode>("users");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [rows, setRows] = useState<any[]>([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableError, setTableError] = useState<string | null>(null);

  // Pending employers state
  const [pendingEmployers, setPendingEmployers] = useState<any[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [selectedEmployer, setSelectedEmployer] = useState<any | null>(null);

  // Image preview modal
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Activities and interactions
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activityPage, setActivityPage] = useState(1);
  const [activityTotal, setActivityTotal] = useState(0);
  const activityPageSize = 20;
  const [interactions, setInteractions] = useState<
    Array<{
      aId: number;
      bId: number;
      aName: string;
      bName: string;
      totalMessages: number;
      lastMessageAt: string;
    }>
  >([]);
  const [interactionsOpen, setInteractionsOpen] = useState(false);

  const handleCardClick = (label: LabelType) => {
    if (label === "Statistic") {
      navigate("/admin/statistics");
      return;
    }
    navigate(`/${label.toLowerCase().replace(" ", "-")}`);
  };

  const openUsersTable = (mode: TableMode) => {
    setTableMode(mode);
    setPage(1);
    setTableOpen(true);
  };

  // Fetch pending employers with their photos
  const fetchPendingEmployers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/pending-employers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        // Remove duplicates based on user ID
        const uniqueEmployers = data.data.filter(
          (employer: any, index: number, self: any[]) =>
            index === self.findIndex((e: any) => e.id === employer.id)
        );

        setPendingEmployers(uniqueEmployers);
        setPendingCount(uniqueEmployers.length);
      } else {
        showToast({
          type: "error",
          message: "Failed to fetch pending employers",
          autoHide: true,
          autoHideDelay: 3000,
        });
      }
    } catch (error) {
      console.error("Error fetching pending employers:", error);
      showToast({
        type: "error",
        message: "Error fetching pending employers",
        autoHide: true,
        autoHideDelay: 3000,
      });
    }
  };

  // Approve employer
  const approveEmployer = async (employerId: number) => {
    setProcessingId(employerId);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/approve-employer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ employerId }),
      });

      const data = await response.json();
      if (data.success) {
        setPendingEmployers((prev) =>
          prev.filter((emp) => emp.id !== employerId)
        );
        setPendingCount((prev) => prev - 1);

        showToast({
          type: "success",
          message:
            "Employer approved successfully! Approval email has been sent.",
          autoHide: true,
          autoHideDelay: 5000,
        });
      } else {
        showToast({
          type: "error",
          message: `Failed to approve employer: ${
            data.error || "Unknown error"
          }`,
          autoHide: true,
          autoHideDelay: 5000,
        });
      }
    } catch (error) {
      console.error("Error approving employer:", error);
      showToast({
        type: "error",
        message: "Network error: Failed to approve employer",
        autoHide: true,
        autoHideDelay: 5000,
      });
    } finally {
      setProcessingId(null);
      setSelectedEmployer(null);
    }
  };

  useEffect(() => {
    getAdminStats()
      .then((res) => {
        if (res?.success) {
          setStats(res.data);
        } else {
          setError("Failed to load stats");
          showToast({
            type: "error",
            message: "Failed to load dashboard statistics",
            autoHide: true,
            autoHideDelay: 3000,
          });
        }
      })
      .catch(() => {
        setError("Failed to load stats");
        showToast({
          type: "error",
          message: "Failed to load dashboard statistics",
          autoHide: true,
          autoHideDelay: 3000,
        });
      })
      .finally(() => setLoading(false));

    fetchPendingEmployers();

    const interval = setInterval(fetchPendingEmployers, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadActivities = (pageNum: number) => {
    getAdminActivities({
      days: 90,
      page: pageNum as any,
      pageSize: activityPageSize as any,
    } as any)
      .then((res) => {
        if (res?.success) {
          setActivities(res.data.activities);
          setActivityTotal(res.data.total);
        }
      })
      .catch(() => {
        showToast({
          type: "error",
          message: "Failed to load activities",
          autoHide: true,
          autoHideDelay: 3000,
        });
      });
  };

  useEffect(() => {
    loadActivities(activityPage);
  }, [activityPage]);

  useEffect(() => {
    getAdminActivities({ days: 90 } as any)
      .then((res) => {
        if (res?.success) {
          setInteractions(
            res.data.interactions.map((i: any) => ({
              ...i,
              lastMessageAt: i.lastMessageAt,
            }))
          );
        }
      })
      .catch(() => {
        showToast({
          type: "error",
          message: "Failed to load interactions",
          autoHide: true,
          autoHideDelay: 3000,
        });
      });
  }, []);

  useEffect(() => {
    if (!tableOpen) return;
    setTableLoading(true);
    setTableError(null);
    const load = async () => {
      try {
        if (tableMode === "pending-employers") {
          setRows(pendingEmployers);
          setTotal(pendingEmployers.length);
          setTableLoading(false);
          return;
        }

        if (tableMode === "employers") {
          const res = await getAdminEmployers({ page, pageSize });
          if (res?.success) {
            setRows(res.data.records);
            setTotal(res.data.total);
          } else {
            setTableError("Failed to load employers");
            showToast({
              type: "error",
              message: "Failed to load employers data",
              autoHide: true,
              autoHideDelay: 3000,
            });
          }
        } else if (tableMode === "users") {
          const res = await getAdminUsers({ type: "all", page, pageSize });
          if (res?.success) {
            setRows(res.data.records);
            setTotal(res.data.total);
          } else {
            setTableError("Failed to load users");
            showToast({
              type: "error",
              message: "Failed to load users data",
              autoHide: true,
              autoHideDelay: 3000,
            });
          }
        } else if (tableMode === "pwd") {
          const res = await getAdminUsers({ type: "pwd", page, pageSize });
          if (res?.success) {
            setRows(res.data.records);
            setTotal(res.data.total);
          } else {
            setTableError("Failed to load PWDs");
            showToast({
              type: "error",
              message: "Failed to load PWD users data",
              autoHide: true,
              autoHideDelay: 3000,
            });
          }
        }
      } catch (e) {
        setTableError("Failed to load data");
        showToast({
          type: "error",
          message: "Failed to load table data",
          autoHide: true,
          autoHideDelay: 3000,
        });
      } finally {
        setTableLoading(false);
      }
    };
    load();
  }, [tableOpen, tableMode, page, pageSize, pendingEmployers]);

  const renderTable = () => {
    if (tableLoading)
      return <div className="text-sm text-gray-600">Loading...</div>;
    if (tableError)
      return <div className="text-sm text-red-600">{tableError}</div>;
    if (!rows.length)
      return <div className="text-sm text-gray-600">No pending employers</div>;

    // Pending Employers detailed view with verification documents
    if (tableMode === "pending-employers") {
      return (
        <div className="space-y-6">
          {rows.map((employer) => {
            const profilePhoto = employer.photo;
            const verificationDocs =
              employer.photos?.filter(
                (p: any) => p.photo_type === "verification"
              ) || [];

            return (
              <div
                key={employer.id}
                className="bg-gray-50 rounded-lg p-6 border border-gray-200"
              >
                {/* <div className="flex items-start justify-between mb-4">
									<div className="flex items-center">
										{employer.employer?.logo_path ? (
											<img 
												src={employer.employer.logo_path} 
												alt={employer.employer.company_name}
												className="h-16 w-16 rounded-lg object-cover border-2 border-gray-200"
											/>
										) : (
											<div className="h-16 w-16 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
												<FaBuilding className="h-8 w-8 text-white" />
											</div>
										)}
										<div className="ml-4">
											<h3 className="text-xl font-bold text-gray-900">
												{employer.employer?.company_name}
											</h3>
											<p className="text-sm text-gray-600">
												Registered on {new Date(employer.created_at).toLocaleDateString()}
											</p>
										</div>
									</div>
								</div>
								<div className="flex items-start justify-between mb-4">
									<div className="flex items-center">
										{employer.employer?.logo_path ? (
											<img 
												src={employer.employer.logo_path} 
												alt={employer.employer.company_name}
												className="h-16 w-16 rounded-lg object-cover border-2 border-gray-200"
											/>
										) : (
											<div className="h-16 w-16 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
												<FaBuilding className="h-8 w-8 text-white" />
											</div>
										)}
										<div className="ml-4">
											<h3 className="text-xl font-bold text-gray-900">
												{employer.employer?.company_name}
											</h3>
											<p className="text-sm text-gray-600">
												Registered on {new Date(employer.created_at).toLocaleDateString()}
											</p>
										</div>
									</div>
								</div> */}

                {/* Profile Photo Section */}
                <div className="mb-4 pb-4 border-b">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <FaUserCircle className="mr-2 text-indigo-600" />
                    Profile Photo
                  </h4>

                  {profilePhoto ? (
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          profilePhoto.startsWith("http")
                            ? profilePhoto
                            : `http://localhost:3111${profilePhoto}`
                        }
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover border-2 border-indigo-200 cursor-pointer hover:opacity-80 transition"
                        onClick={() =>
                          setImagePreview(
                            profilePhoto.startsWith("http")
                              ? profilePhoto
                              : `http://localhost:3111${profilePhoto}`
                          )
                        }
                        onError={(e) => {
                          console.error(
                            "Profile photo load error:",
                            profilePhoto
                          );
                          e.currentTarget.src =
                            'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      <div className="text-xs text-gray-500">
                        <p>Click to view full size</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center text-gray-500 text-sm">
                      <FaTimesCircle className="mr-2 text-red-500" />
                      No profile photo uploaded
                    </div>
                  )}
                </div>

                {/* Verification Documents Section */}
                <div className="mb-4 pb-4 border-b">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <FaFileAlt className="mr-2 text-green-600" />
                    Verification Documents ({verificationDocs.length}/3)
                  </h4>
                  {verificationDocs.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                      {verificationDocs.map((doc: any, idx: number) => {
                        const fullPath = doc.photo_path.startsWith("http")
                          ? doc.photo_path
                          : `http://localhost:3111${doc.photo_path}`;
                        const isPDF = doc.photo_path
                          .toLowerCase()
                          .endsWith(".pdf");

                        return (
                          <div key={idx} className="relative group">
                            {isPDF ? (
                              <div
                                className="w-full h-32 border-2 border-gray-200 rounded-lg flex flex-col items-center justify-center bg-red-50 cursor-pointer hover:bg-red-100 transition"
                                onClick={() => window.open(fullPath, "_blank")}
                              >
                                <FaFileAlt className="text-3xl text-red-500 mb-1" />
                                <span className="text-xs text-gray-600 text-center px-2">
                                  Document {idx + 1}
                                </span>
                                <FaExternalLinkAlt className="text-xs text-gray-400 mt-1" />
                              </div>
                            ) : (
                              <img
                                src={fullPath}
                                alt={`Verification ${idx + 1}`}
                                className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:opacity-80 transition"
                                onClick={() => setImagePreview(fullPath)}
                                onError={(e) => {
                                  console.error("Image load error:", fullPath);
                                  const target = e.currentTarget;
                                  target.style.display = "none";
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.innerHTML = `
																			<div class="w-full h-32 border-2 border-red-200 rounded-lg flex flex-col items-center justify-center bg-red-50">
																				<svg class="w-8 h-8 text-red-500 mb-1" fill="currentColor" viewBox="0 0 20 20">
																					<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
																				</svg>
																				<span class="text-xs text-red-600 text-center px-2">Failed to load</span>
																				<span class="text-xs text-gray-500 mt-1">${doc.photo_path}</span>
																			</div>
																		`;
                                  }
                                }}
                              />
                            )}
                            <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-2 py-1 rounded">
                              Doc {idx + 1}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center text-gray-500 text-sm">
                      <FaTimesCircle className="mr-2 text-red-500" />
                      No verification documents uploaded
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  Registered on{" "}
                  {new Date(employer.created_at).toLocaleDateString()}
                </p>

                {/* Company Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center text-gray-700">
                    <FaEnvelope className="mr-2 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-medium text-sm">{employer.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-700">
                    <FaPhone className="mr-2 text-green-600" />
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="font-medium text-sm">
                        {employer.phone_number || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-700">
                    <FaUsers className="mr-2 text-purple-600" />
                    <div>
                      <p className="text-xs text-gray-500">Contact Person</p>
                      <p className="font-medium text-sm">
                        {employer.employer?.contact_person}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-700">
                    <FaBuilding className="mr-2 text-indigo-600" />
                    <div>
                      <p className="text-xs text-gray-500">Industry</p>
                      <p className="font-medium text-sm">
                        {employer.employer?.industry}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-700">
                    <FaUsers className="mr-2 text-orange-600" />
                    <div>
                      <p className="text-xs text-gray-500">Company Size</p>
                      <p className="font-medium text-sm">
                        {employer.employer?.company_size} employees
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-700">
                    <FaCalendar className="mr-2 text-red-600" />
                    <div>
                      <p className="text-xs text-gray-500">Founded Year</p>
                      <p className="font-medium text-sm">
                        {employer.employer?.founded_year}
                      </p>
                    </div>
                  </div>
                </div>

                {employer.employer?.website_url && (
                  <div className="flex items-center text-gray-700 mb-4">
                    <FaGlobe className="mr-2 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-500">Website</p>
                      <a
                        href={employer.employer.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-sm text-blue-600 hover:underline"
                      >
                        {employer.employer.website_url}
                      </a>
                    </div>
                  </div>
                )}

                {employer.employer?.address && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Address</p>
                    <p className="text-gray-700 text-sm">
                      {employer.employer.address}
                    </p>
                  </div>
                )}

                <div className="flex items-center space-x-2 mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <FaCheckCircle className="mr-1" />
                    Email Verified
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Pending Admin Approval
                  </span>
                  {verificationDocs.length < 3 && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      <FaFileAlt className="mr-1" />
                      Incomplete Documents ({verificationDocs.length}/3)
                    </span>
                  )}
                </div>

                <button
                  onClick={() => setSelectedEmployer(employer)}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  disabled={processingId === employer.id}
                >
                  {processingId === employer.id ? (
                    <>
                      <FaSpinner className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaCheckCircle className="-ml-1 mr-2 h-4 w-4" />
                      Approve Account
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      );
    }

    if (tableMode === "employers") {
      return (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-3 py-2 text-left">Company</th>
                <th className="px-3 py-2 text-left">Industry</th>
                <th className="px-3 py-2 text-left">Size</th>
                <th className="px-3 py-2 text-left">Website</th>
                <th className="px-3 py-2 text-left">Contact</th>
                <th className="px-3 py-2 text-left">Email</th>
                <th className="px-3 py-2 text-left">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-3 py-2">{r.company_name}</td>
                  <td className="px-3 py-2">{r.industry || "-"}</td>
                  <td className="px-3 py-2">{r.company_size || "-"}</td>
                  <td className="px-3 py-2">
                    <a
                      className="text-indigo-600 hover:underline"
                      href={r.website_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {r.website_url || "-"}
                    </a>
                  </td>
                  <td className="px-3 py-2">{r.contact_person || "-"}</td>
                  <td className="px-3 py-2">{r.user_email || "-"}</td>
                  <td className="px-3 py-2">
                    {new Date(r.user_created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-3 py-2 text-left">Username</th>
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2 text-left">First Name</th>
              <th className="px-3 py-2 text-left">Last Name</th>
              <th className="px-3 py-2 text-left">Type</th>
              <th className="px-3 py-2 text-left">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-3 py-2">{r.username}</td>
                <td className="px-3 py-2">{r.email}</td>
                <td className="px-3 py-2">{r.first_name || "-"}</td>
                <td className="px-3 py-2">{r.last_name || "-"}</td>
                <td className="px-3 py-2 uppercase">{r.user_type}</td>
                <td className="px-3 py-2">
                  {new Date(r.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const activityTotalPages = Math.max(
    1,
    Math.ceil(activityTotal / activityPageSize)
  );

  return (
    <div className="mx-auto px-8 my-2 mt-20">
      <div className="mx-auto">
        <div className="mx-4">
          <div className="mx-auto">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold">
                  Welcome to the Admin Dashboard
                </h1>
                <p className="mt-2">Overview of users and employers</p>
              </div>
            </div>

            {/* KPI Row */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
              <StatCard
                title="Users"
                value={loading ? "—" : stats?.totals.users ?? 0}
                subtitle={
                  stats ? `${stats.breakdown.jobseekers} jobseekers` : undefined
                }
                color="blue"
                onClick={() => openUsersTable("users")}
              />
              <StatCard
                title="Employers"
                value={loading ? "—" : stats?.totals.employers ?? 0}
                subtitle={
                  stats
                    ? `${
                        stats.breakdown.general + stats.breakdown.pwd
                      } non-employer users`
                    : undefined
                }
                color="orange"
                onClick={() => openUsersTable("employers")}
              />
              <StatCard
                title="Pending Approvals"
                value={pendingCount}
                subtitle="Awaiting review"
                color="yellow"
                badge={pendingCount}
                onClick={() => openUsersTable("pending-employers")}
              />
              <StatCard
                title="PWD"
                value={loading ? "—" : stats?.breakdown.pwd ?? 0}
                color="purple"
                onClick={() => openUsersTable("pwd")}
              />
              <StatCard
                title="Statistic"
                value={
                  loading
                    ? "—"
                    : stats
                    ? stats.breakdown.general +
                      stats.totals.employers +
                      stats.breakdown.pwd
                    : 0
                }
                subtitle="Charts and Insights"
                color="green"
                onClick={() => handleCardClick("Statistic")}
              />
              <StatCard
                title="Interactions"
                value={interactions.length}
                subtitle="Mutual chat pairs"
                color="indigo"
                onClick={() => setInteractionsOpen(true)}
              />
            </div>

            {/* Activities Table */}
            <div className="mt-8 rounded-xl border bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-700">
                  Recent Activities
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="px-3 py-2 text-left">Type</th>
                      <th className="px-3 py-2 text-left">Title</th>
                      <th className="px-3 py-2 text-left">When</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {activities.map((a, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2 capitalize">{a.type}</td>
                        <td className="px-3 py-2">{a.title}</td>
                        <td className="px-3 py-2">
                          {new Date(a.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <button
                  className="px-3 py-1 rounded border text-sm"
                  disabled={activityPage <= 1}
                  onClick={() => setActivityPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                <div className="text-xs text-gray-600">
                  Page {activityPage} of {activityTotalPages}
                </div>
                <button
                  className="px-3 py-1 rounded border text-sm"
                  disabled={activityPage >= activityTotalPages}
                  onClick={() =>
                    setActivityPage((p) => Math.min(activityTotalPages, p + 1))
                  }
                >
                  Next
                </button>
              </div>
            </div>

            {error && <div className="mt-6 text-sm text-red-600">{error}</div>}
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {imagePreview && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80"
          onClick={() => setImagePreview(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setImagePreview(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 text-2xl"
            >
              ✕
            </button>
            <img
              src={imagePreview}
              alt="Preview"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Interactions Modal */}
      <Modal
        open={interactionsOpen}
        title="Mutual Interactions (Me ↔ Employer pairs)"
        onClose={() => setInteractionsOpen(false)}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-3 py-2 text-left">Participant A</th>
                <th className="px-3 py-2 text-left">Participant B</th>
                <th className="px-3 py-2 text-left">Total Messages</th>
                <th className="px-3 py-2 text-left">Last Message</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {interactions.map((i, idx) => (
                <tr key={idx}>
                  <td className="px-3 py-2">
                    {i.aName} (#{i.aId})
                  </td>
                  <td className="px-3 py-2">
                    {i.bName} (#{i.bId})
                  </td>
                  <td className="px-3 py-2">{i.totalMessages}</td>
                  <td className="px-3 py-2">
                    {new Date(i.lastMessageAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>

      {/* Users/Employers Table Modal */}
      <Modal
        open={tableOpen}
        title={
          tableMode === "employers"
            ? "Employers"
            : tableMode === "pwd"
            ? "PWD Users"
            : tableMode === "pending-employers"
            ? "Pending Employer Approvals"
            : "All Users"
        }
        onClose={() => setTableOpen(false)}
        size={tableMode === "pending-employers" ? "large" : "default"}
      >
        {renderTable()}
        {tableMode !== "pending-employers" && (
          <div className="mt-4 flex items-center justify-between">
            <button
              className="px-3 py-1 rounded border text-sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <div className="text-xs text-gray-600">
              Page {page} of {totalPages}
            </div>
            <button
              className="px-3 py-1 rounded border text-sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        )}
      </Modal>

      {/* Approval Confirmation Modal */}
      {selectedEmployer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-blur bg-opacity-40 backdrop-blur-sm">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirm Approval
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to approve{" "}
              <strong>{selectedEmployer.employer?.company_name}</strong>? This
              will activate their account and send them a notification email.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => approveEmployer(selectedEmployer.id)}
                className="flex-1 inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                disabled={processingId === selectedEmployer.id}
              >
                {processingId === selectedEmployer.id
                  ? "Processing..."
                  : "Yes, Approve"}
              </button>
              <button
                onClick={() => setSelectedEmployer(null)}
                className="flex-1 inline-flex justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={processingId === selectedEmployer.id}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWelcomePage;
