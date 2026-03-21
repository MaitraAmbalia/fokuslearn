import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import {
  Users, PlaySquare, Eye, Award, TrendingUp, BarChart3, ArrowLeft, Loader2, Calendar, LayoutDashboard, Crown
} from 'lucide-react';
import { Progress } from "../components/ui/progress";
import { Button } from "../components/ui/button";

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        setData(res.data);
      } catch (error) {
        console.error("Failed to load admin stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
      <p className="text-slate-500 dark:text-slate-400 font-medium">Loading platform analytics...</p>
    </div>
  );

  const { stats, growthData, topCourses, recentUsers, weeklyActivity } = data || {};

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* --- Header --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="bg-indigo-600/10 p-2 rounded-lg">
                <Crown className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 ml-11">Platform-wide analytics and user engagement</p>
          </div>
          <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-green-500 mr-2">●</span> Live System Data
          </div>
        </div>

        {/* --- Top Stat Cards --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            trend={`+${stats?.newUsersThisWeek || 0} this week`}
            icon={Users}
            color="text-blue-600"
            bg="bg-blue-50 dark:bg-blue-900/20"
          />
          <StatCard
            title="Total Playlists"
            value={stats?.totalGoals || 0}
            icon={PlaySquare}
            color="text-purple-600"
            bg="bg-purple-50 dark:bg-purple-900/20"
          />
          <StatCard
            title="Videos Watched"
            value={stats?.totalVideosWatched || 0}
            trend={`${Math.round((stats?.totalMinutes || 0) / 60)} hrs total`}
            icon={Eye}
            color="text-indigo-600"
            bg="bg-indigo-50 dark:bg-indigo-900/20"
          />
          <StatCard
            title="Certificates"
            value={stats?.totalCertificates || 0}
            icon={Award}
            color="text-yellow-600"
            bg="bg-yellow-50 dark:bg-yellow-900/20"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- Main Chart Column --- */}
          <div className="lg:col-span-2 space-y-8">
            {/* 30 Day Growth Chart */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-500" /> User Signups (30 Days)
                </h3>
              </div>
              <div className="h-64 flex items-end justify-between gap-1 mt-4 relative pt-6 border-b border-slate-100 dark:border-slate-700">
                {growthData && (() => {
                  const maxVal = Math.max(...growthData.map(d => d.count), 5); // Ensure scale has a min height
                  return growthData.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-slate-800 text-white text-xs px-2 py-1 rounded transition-opacity flex flex-col items-center z-10 pointer-events-none w-max">
                        <span className="font-bold">{d.count} Users</span>
                        <span className="text-[10px] text-slate-300">{d.label}</span>
                      </div>
                      <div
                        className="w-full max-w-[12px] md:max-w-[20px] bg-indigo-500/80 group-hover:bg-indigo-400 rounded-t-sm transition-all"
                        style={{ height: `${Math.max((d.count / maxVal) * 100, 2)}%` }} // Minimum height to show the bar exists
                      />
                    </div>
                  ));
                })()}
              </div>
              <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
                <span>{growthData?.[0]?.label}</span>
                <span>{growthData?.[growthData?.length - 1]?.label}</span>
              </div>
            </div>

            {/* Recent Signups Table */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" /> Recent Signups
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-700 text-xs uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                      <th className="pb-3 font-semibold">User</th>
                      <th className="pb-3 font-semibold">Email</th>
                      <th className="pb-3 font-semibold text-center">Level</th>
                      <th className="pb-3 font-semibold text-right">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                    {recentUsers?.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3 flex items-center gap-3">
                          <img src={u.avatar} alt="" className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700" />
                          <span className="font-medium text-sm text-slate-900 dark:text-slate-200">{u.name}</span>
                        </td>
                        <td className="py-3 text-sm text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                          {u.email}
                        </td>
                        <td className="py-3 text-center">
                          <span className="inline-flex items-center justify-center bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-800">
                            Lvl {u.level || 1}
                          </span>
                        </td>
                        <td className="py-3 text-sm text-right text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                    {recentUsers?.length === 0 && (
                      <tr>
                        <td colSpan="4" className="py-8 text-center text-slate-400">No recent signups</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* --- Sidebar Column --- */}
          <div className="space-y-8">
            {/* Top Courses */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-purple-500" /> Top Courses
              </h3>
              <div className="space-y-5">
                {topCourses?.map((course, i) => (
                  <div key={i} className="flex gap-4 group">
                    <img
                      src={course.thumbnail}
                      alt=""
                      className="w-16 h-12 object-cover rounded-md bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shadow-sm"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-slate-900 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {course._id}
                      </h4>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Users className="w-3 h-3" /> {course.userCount} users
                        </span>
                        <span className="text-xs text-slate-400">
                          {Math.round(course.avgProgress || 0)}% avg
                        </span>
                      </div>
                      <Progress value={course.avgProgress || 0} className="h-1.5 mt-1.5" />
                    </div>
                  </div>
                ))}
                {(!topCourses || topCourses.length === 0) && (
                  <div className="text-center p-4 text-slate-400 text-sm">No courses tracked yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Sub-component for metric cards
const StatCard = ({ title, value, trend, icon: Icon, color, bg }) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${bg} ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      {trend && (
        <span className="text-xs font-medium bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-600">
          {trend}
        </span>
      )}
    </div>
    <div>
      <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">{value?.toLocaleString() || 0}</h3>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
    </div>
  </div>
);

export default AdminDashboard;
