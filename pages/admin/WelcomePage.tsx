import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminStats, getAdminUsers, getAdminEmployers, getAdminActivities } from '../../src/services/notificationService';

type LabelType = 
  | 'PWD' 
  | 'Statistic' 
  | 'Admin' 
  | 'Company';

type TableMode = 'users' | 'pwd' | 'employers';

type Activity = { type: string; title: string; description: string; timestamp: string; status?: string };

const StatCard = ({ title, value, subtitle, color, onClick }: { title: string; value: number | string; subtitle?: string; color: string; onClick?: () => void }) => {
	const colorMap: Record<string, string> = {
		blue: 'from-blue-500 to-indigo-500',
		green: 'from-green-500 to-emerald-500',
		purple: 'from-purple-500 to-fuchsia-500',
		orange: 'from-orange-500 to-amber-500',
		indigo: 'from-indigo-500 to-violet-500',
	};
	return (
		<div onClick={onClick} className={`group relative rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden`}>
			<div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${colorMap[color] || colorMap.blue}`} />
			<div className="p-5">
				<div className="flex items-center justify-between">
					<h3 className="text-sm font-medium text-gray-600">{title}</h3>
					<span className="text-xs font-semibold text-gray-500">View</span>
				</div>
				<div className="mt-2 text-3xl font-bold text-gray-900">{value}</div>
				{subtitle && <div className="mt-1 text-xs text-gray-500">{subtitle}</div>}
			</div>
		</div>
	);
};

const Modal: React.FC<{ open: boolean; title: string; onClose: () => void; children: React.ReactNode }> = ({ open, title, onClose, children }) => {
	if (!open) return null;
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<div className="absolute inset-0 bg-black/30" onClick={onClose} />
			<div className="relative z-10 w-full max-w-5xl rounded-xl bg-white shadow-xl">
				<div className="flex items-center justify-between border-b px-5 py-3">
					<h3 className="text-lg font-semibold">{title}</h3>
					<button className="text-gray-500 hover:text-gray-700" onClick={onClose}>✕</button>
				</div>
				<div className="p-5 overflow-auto max-h-[70vh]">
					{children}
				</div>
			</div>
		</div>
	);
};

const AdminWelcomePage = () => {
  const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [stats, setStats] = useState<{ totals: { users: number; employers: number }, breakdown: { jobseekers: number; general: number; pwd: number } } | null>(null);

	// Modal/table state
	const [tableOpen, setTableOpen] = useState(false);
	const [tableMode, setTableMode] = useState<TableMode>('users');
	const [page, setPage] = useState(1);
	const [pageSize] = useState(10);
	const [total, setTotal] = useState(0);
	const [rows, setRows] = useState<any[]>([]);
	const [tableLoading, setTableLoading] = useState(false);
	const [tableError, setTableError] = useState<string | null>(null);

	// Activities and interactions
	const [activities, setActivities] = useState<Activity[]>([]);
	const [activityPage, setActivityPage] = useState(1);
	const [activityTotal, setActivityTotal] = useState(0);
	const activityPageSize = 20; // default 20
	const [interactions, setInteractions] = useState<Array<{ aId: number; bId: number; aName: string; bName: string; totalMessages: number; lastMessageAt: string }>>([]);
	const [interactionsOpen, setInteractionsOpen] = useState(false);

  const handleCardClick = (label: LabelType) => {
    if (label === 'Statistic') {
      navigate('/admin/statistics');
      return;
    }
    navigate(`/${label.toLowerCase().replace(' ', '-')}`);
  };

	const openUsersTable = (mode: TableMode) => {
		setTableMode(mode);
		setPage(1);
		setTableOpen(true);
	};

	useEffect(() => {
		getAdminStats()
			.then((res) => {
				if (res?.success) {
					setStats(res.data);
				} else {
					setError('Failed to load stats');
				}
			})
			.catch(() => setError('Failed to load stats'))
			.finally(() => setLoading(false));
	}, []);

	const loadActivities = (pageNum: number) => {
		getAdminActivities({ days: 90, /* limit not used with pagination */ page: pageNum as any, pageSize: activityPageSize as any } as any)
			.then((res) => {
				if (res?.success) {
					setActivities(res.data.activities);
					setActivityTotal(res.data.total);
				}
			}).catch(() => {});
	};

	useEffect(() => {
		loadActivities(activityPage);
	}, [activityPage]);

	useEffect(() => {
		// Initial interactions load
		getAdminActivities({ days: 90 } as any).then((res) => {
			if (res?.success) {
				setInteractions(res.data.interactions.map((i: any) => ({ ...i, lastMessageAt: i.lastMessageAt })));
			}
		}).catch(() => {});
	}, []);

	useEffect(() => {
		if (!tableOpen) return;
		setTableLoading(true);
		setTableError(null);
		const load = async () => {
			try {
				if (tableMode === 'employers') {
					const res = await getAdminEmployers({ page, pageSize });
					if (res?.success) {
						setRows(res.data.records);
						setTotal(res.data.total);
					} else setTableError('Failed to load employers');
				} else if (tableMode === 'users') {
					const res = await getAdminUsers({ type: 'all', page, pageSize });
					if (res?.success) {
						setRows(res.data.records);
						setTotal(res.data.total);
					} else setTableError('Failed to load users');
				} else if (tableMode === 'pwd') {
					const res = await getAdminUsers({ type: 'pwd', page, pageSize });
					if (res?.success) {
						setRows(res.data.records);
						setTotal(res.data.total);
					} else setTableError('Failed to load PWDs');
				}
			} catch (e) {
				setTableError('Failed to load data');
			} finally {
				setTableLoading(false);
			}
		};
		load();
	}, [tableOpen, tableMode, page, pageSize]);

	const renderTable = () => {
		if (tableLoading) return <div className="text-sm text-gray-600">Loading...</div>;
		if (tableError) return <div className="text-sm text-red-600">{tableError}</div>;
		if (!rows.length) return <div className="text-sm text-gray-600">No data</div>;

		if (tableMode === 'employers') {
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
									<td className="px-3 py-2">{r.industry || '-'}</td>
									<td className="px-3 py-2">{r.company_size || '-'}</td>
									<td className="px-3 py-2"><a className="text-indigo-600 hover:underline" href={r.website_url} target="_blank" rel="noreferrer">{r.website_url || '-'}</a></td>
									<td className="px-3 py-2">{r.contact_person || '-'}</td>
									<td className="px-3 py-2">{r.user_email || '-'}</td>
									<td className="px-3 py-2">{new Date(r.user_created_at).toLocaleDateString()}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			);
		}

		// Users table (general/pwd)
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
								<td className="px-3 py-2">{r.first_name || '-'}</td>
								<td className="px-3 py-2">{r.last_name || '-'}</td>
								<td className="px-3 py-2 uppercase">{r.user_type}</td>
								<td className="px-3 py-2">{new Date(r.created_at).toLocaleDateString()}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		);
	};

	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const activityTotalPages = Math.max(1, Math.ceil(activityTotal / activityPageSize));

  return (
    <div className="mx-auto px-8 my-2 mt-20">
      <div className="mx-auto">
        <div className="mx-4">
          <div className="mx-auto">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
              <div>
              <h1 className="text-2xl font-bold">Welcome to the Admin Dashboard</h1>
              <p className="mt-2">Overview of users and employers</p>
              </div>
            </div>

				{/* KPI Row */}
				<div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
					<StatCard
						title="Users"
						value={loading ? '—' : (stats?.totals.users ?? 0)}
						subtitle={stats ? `${stats.breakdown.jobseekers} jobseekers` : undefined}
						color="blue"
						onClick={() => openUsersTable('users')}
					/>
					<StatCard
						title="Employers"
						value={loading ? '—' : (stats?.totals.employers ?? 0)}
						subtitle={stats ? `${stats.breakdown.general + stats.breakdown.pwd} non-employer users` : undefined}
						color="orange"
						onClick={() => openUsersTable('employers')}
					/>
					<StatCard
						title="PWD"
						value={loading ? '—' : (stats?.breakdown.pwd ?? 0)}
						color="purple"
						onClick={() => openUsersTable('pwd')}
					/>
					<StatCard
						title="Statistic"
						value={loading ? '—' : (stats ? (stats.breakdown.general + stats.totals.employers + stats.breakdown.pwd) : 0)}
						subtitle="Charts and Insights"
						color="green"
						onClick={() => handleCardClick('Statistic')}
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
						<h2 className="text-sm font-semibold text-gray-700">Recent Activities</h2>
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
										<td className="px-3 py-2">{new Date(a.timestamp).toLocaleString()}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<div className="mt-4 flex items-center justify-between">
						<button className="px-3 py-1 rounded border text-sm" disabled={activityPage <= 1} onClick={() => setActivityPage(p => Math.max(1, p - 1))}>Previous</button>
						<div className="text-xs text-gray-600">Page {activityPage} of {activityTotalPages}</div>
						<button className="px-3 py-1 rounded border text-sm" disabled={activityPage >= activityTotalPages} onClick={() => setActivityPage(p => Math.min(activityTotalPages, p + 1))}>Next</button>
					</div>
				</div>

				{error && <div className="mt-6 text-sm text-red-600">{error}</div>}
          </div>
        </div>
      </div>

		{/* Interactions Modal */}
		<Modal open={interactionsOpen} title="Mutual Interactions (Me ↔ Employer pairs)" onClose={() => setInteractionsOpen(false)}>
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
								<td className="px-3 py-2">{i.aName} (#{i.aId})</td>
								<td className="px-3 py-2">{i.bName} (#{i.bId})</td>
								<td className="px-3 py-2">{i.totalMessages}</td>
								<td className="px-3 py-2">{new Date(i.lastMessageAt).toLocaleString()}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</Modal>

		{/* Users/Employers Table Modal */}
		<Modal open={tableOpen} title={
			tableMode === 'employers' ? 'Employers' :
			tableMode === 'pwd' ? 'PWD Users' : 'All Users'
		} onClose={() => setTableOpen(false)}>
			{renderTable()}
			<div className="mt-4 flex items-center justify-between">
				<button className="px-3 py-1 rounded border text-sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</button>
				<div className="text-xs text-gray-600">Page {page} of {totalPages}</div>
				<button className="px-3 py-1 rounded border text-sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</button>
			</div>
		</Modal>
    </div>
  );
};

export default AdminWelcomePage; 