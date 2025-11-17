import { useEffect, useState } from 'react';
import { getAdminAnalytics } from '../../src/services/notificationService';
import {
	ResponsiveContainer,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	Legend,
	PieChart,
	Pie,
	Cell,
	LineChart,
	Line,
} from 'recharts';

// Consistent color scheme across all charts
const USER_COLORS = {
	admin: '#10B981',     // Green (admin and general are the same)
	general: '#10B981',   // Green (same as admin)
	employer: '#3B82F6',  // Blue
	jobseeker: '#EF4444', // Red (pwd and jobseeker are the same)
	pwd: '#EF4444',       // Red (same as jobseeker)
	total: '#8B5CF6',     // Purple (for total line)
};

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#8B5CF6', '#F59E0B', '#06B6D4'];

const StatisticsPage = () => {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [usersOverTime, setUsersOverTime] = useState<any[]>([]);
	const [jobsByWorkMode, setJobsByWorkMode] = useState<any[]>([]);
	const [usersDistribution, setUsersDistribution] = useState<any[]>([]);

	useEffect(() => {
		getAdminAnalytics()
			.then((res) => {
				if (res?.success) {
					setUsersOverTime(res.data.usersOverTime);
					setJobsByWorkMode(res.data.jobsByWorkMode);
					setUsersDistribution(res.data.usersDistribution);
				} else {
					setError('Failed to load analytics');
				}
			})
			.catch(() => setError('Failed to load analytics'))
			.finally(() => setLoading(false));
	}, []);

	// Helper function to get color based on user type
	const getColorForUserType = (type: string) => {
		const normalizedType = type.toLowerCase();
		if (normalizedType.includes('admin') || normalizedType.includes('general')) return USER_COLORS.admin;
		if (normalizedType.includes('employer')) return USER_COLORS.employer;
		if (normalizedType.includes('pwd') || normalizedType.includes('jobseeker')) return USER_COLORS.jobseeker;
		return COLORS[0];
	};

	return (
		<div className="mx-auto px-6 py-8">
			<div className="mb-6">
				<h1 className="text-2xl font-bold">Statistics</h1>
				<p className="text-gray-600">Interactive charts powered by live data</p>
			</div>

			{error && <div className="text-sm text-red-600 mb-4">{error}</div>}
			{loading ? (
				<div className="text-sm text-gray-600">Loading...</div>
			) : (
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<div className="rounded-xl border bg-white p-4 shadow-sm">
						<h2 className="mb-3 text-sm font-semibold text-gray-700">Users Over Time (Monthly)</h2>
						<div className="h-72">
							<ResponsiveContainer width="100%" height="100%">
								<LineChart data={usersOverTime}>
									<XAxis dataKey="month" />
									<YAxis allowDecimals={false} />
									<Tooltip />
									<Legend />
									<Line type="monotone" dataKey="total" stroke={USER_COLORS.total} strokeWidth={2} />
									<Line type="monotone" dataKey="general" stroke={USER_COLORS.general} strokeWidth={2} />
									<Line type="monotone" dataKey="employer" stroke={USER_COLORS.employer} strokeWidth={2} />
									<Line type="monotone" dataKey="pwd" stroke={USER_COLORS.pwd} strokeWidth={2} />
								</LineChart>
							</ResponsiveContainer>
						</div>
					</div>

					<div className="rounded-xl border bg-white p-4 shadow-sm">
						<h2 className="mb-3 text-sm font-semibold text-gray-700">Users Distribution</h2>
						<div className="h-72">
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie data={usersDistribution} dataKey="count" nameKey="type" outerRadius={100} fill="#8884d8" label>
										{usersDistribution.map((entry, index) => (
											<Cell key={`cell-${index}`} fill={getColorForUserType(entry.type)} />
										))}
									</Pie>
									<Tooltip />
									<Legend />
								</PieChart>
							</ResponsiveContainer>
						</div>
					</div>

					<div className="rounded-xl border bg-white p-4 shadow-sm lg:col-span-2">
						<h2 className="mb-3 text-sm font-semibold text-gray-700">Jobs by Work Mode</h2>
						<div className="h-72">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart data={jobsByWorkMode}>
									<XAxis dataKey="work_mode" />
									<YAxis allowDecimals={false} />
									<Tooltip />
									<Legend />
									<Bar dataKey="count" fill="#8B5CF6" />
								</BarChart>
							</ResponsiveContainer>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default StatisticsPage;