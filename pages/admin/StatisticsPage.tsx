import React, { useEffect, useState } from 'react';
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

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

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
									<Line type="monotone" dataKey="total" stroke="#6366F1" strokeWidth={2} />
									<Line type="monotone" dataKey="employer" stroke="#10B981" strokeWidth={2} />
									<Line type="monotone" dataKey="general" stroke="#F59E0B" strokeWidth={2} />
									<Line type="monotone" dataKey="pwd" stroke="#EF4444" strokeWidth={2} />
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
											<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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