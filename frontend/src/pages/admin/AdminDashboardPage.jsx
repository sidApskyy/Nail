import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/Card';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { StaffProfileManager } from '../../components/StaffProfileManager';

export function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [metricDetails, setMetricDetails] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [animatedStats, setAnimatedStats] = useState({});
  const [hoveredCard, setHoveredCard] = useState(null);

  // Animate numbers on load
  useEffect(() => {
    if (stats) {
      const targetStats = {
        activeUsers: stats.activeUsers || 0,
        activeStaff: stats.activeStaff || 0,
        activeStaffProfiles: stats.activeStaffProfiles || 0,
        totalAppointments: stats.totalAppointments || 0,
        completedAppointments: stats.completedAppointments || 0,
        uploadedWorks: stats.uploadedWorks || 0
      };

      Object.keys(targetStats).forEach(key => {
        const target = targetStats[key];
        const duration = 2000; // 2 seconds
        const steps = 60;
        const increment = target / steps;
        let current = 0;
        
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          setAnimatedStats(prev => ({ ...prev, [key]: Math.floor(current) }));
        }, duration / steps);
      });
    }
  }, [stats]);

  const getMetricIcon = (metricType) => {
    const icons = {
      activeUsers: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      activeStaff: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      activeStaffProfiles: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      totalAppointments: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      completedAppointments: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      uploadedWorks: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    };
    return icons[metricType] || null;
  };

  const getMetricColor = (metricType) => {
    const colors = {
      activeUsers: 'from-blue-500 to-blue-600',
      activeStaff: 'from-purple-500 to-purple-600',
      activeStaffProfiles: 'from-indigo-500 to-indigo-600',
      totalAppointments: 'from-orange-500 to-orange-600',
      completedAppointments: 'from-emerald-500 to-emerald-600',
      uploadedWorks: 'from-pink-500 to-pink-600'
    };
    return colors[metricType] || 'from-gray-500 to-gray-600';
  };

  const loadMetricDetails = async (metricType) => {
    setDetailsLoading(true);
    try {
      let endpoint;
      switch (metricType) {
        case 'activeUsers':
          endpoint = '/admin/users';
          break;
        case 'activeStaff':
          endpoint = '/admin/users';
          break;
        case 'activeStaffProfiles':
          endpoint = '/staff-profiles/active';
          break;
        case 'totalAppointments':
          endpoint = '/admin/appointments';
          break;
        case 'completedAppointments':
          endpoint = '/admin/appointments';
          break;
        case 'uploadedWorks':
          endpoint = '/admin/completed-works';
          break;
        default:
          return;
      }
      
      const response = await api.get(endpoint);
      let data = response.data?.data || [];
      
      // Filter data based on metric type
      if (metricType === 'activeStaff') {
        data = data.filter(user => user.role === 'staff' && user.is_active);
      } else if (metricType === 'completedAppointments') {
        data = data.filter(apt => apt.status === 'completed');
      }
      
      setMetricDetails(data);
      setSelectedMetric(metricType);
    } catch (err) {
      setError('Failed to load details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetailsModal = () => {
    setSelectedMetric(null);
    setMetricDetails([]);
  };

  const renderTableHeaders = (metricType) => {
    switch (metricType) {
      case 'activeUsers':
      case 'activeStaff':
        return (
          <>
            <th className="py-2">Name</th>
            <th className="py-2">Email</th>
            <th className="py-2">Role</th>
            <th className="py-2">Status</th>
            <th className="py-2">Created</th>
          </>
        );
      case 'activeStaffProfiles':
        return (
          <>
            <th className="py-2">Staff Name</th>
            <th className="py-2">Specialization</th>
            <th className="py-2">Experience</th>
            <th className="py-2">Phone</th>
            <th className="py-2">Status</th>
          </>
        );
      case 'totalAppointments':
      case 'completedAppointments':
        return (
          <>
            <th className="py-2">Customer</th>
            <th className="py-2">Phone</th>
            <th className="py-2">Date</th>
            <th className="py-2">Time</th>
            <th className="py-2">Status</th>
          </>
        );
      case 'uploadedWorks':
        return (
          <>
            <th className="py-2">Customer</th>
            <th className="py-2">Service</th>
            <th className="py-2">Amount</th>
            <th className="py-2">Staff</th>
            <th className="py-2">Date</th>
          </>
        );
      default:
        return null;
    }
  };

  const renderTableRow = (item, metricType) => {
    switch (metricType) {
      case 'activeUsers':
      case 'activeStaff':
        return (
          <>
            <td className="py-2 font-medium">{item.name}</td>
            <td className="py-2 text-slate-600">{item.email}</td>
            <td className="py-2 capitalize">{item.role}</td>
            <td className="py-2">
              <span className={`px-2 py-1 text-xs rounded-full ${
                item.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
              }`}>
                {item.is_active ? 'Active' : 'Inactive'}
              </span>
            </td>
            <td className="py-2 text-slate-600">{new Date(item.created_at).toLocaleDateString()}</td>
          </>
        );
      case 'activeStaffProfiles':
        return (
          <>
            <td className="py-2 font-medium">{item.staff_name}</td>
            <td className="py-2 text-slate-600">{item.specialization || '-'}</td>
            <td className="py-2 text-slate-600">{item.experience || '-'}</td>
            <td className="py-2 text-slate-600">{item.phone || '-'}</td>
            <td className="py-2">
              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                Active
              </span>
            </td>
          </>
        );
      case 'totalAppointments':
      case 'completedAppointments':
        return (
          <>
            <td className="py-2 font-medium">{item.customer_name}</td>
            <td className="py-2 text-slate-600">{item.customer_phone}</td>
            <td className="py-2 text-slate-600">{new Date(item.appointment_date).toLocaleDateString()}</td>
            <td className="py-2 text-slate-600">{item.appointment_time}</td>
            <td className="py-2">
              <span className={`px-2 py-1 text-xs rounded-full ${
                item.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                item.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {item.status}
              </span>
            </td>
          </>
        );
      case 'uploadedWorks':
        return (
          <>
            <td className="py-2 font-medium">{item.customer_name}</td>
            <td className="py-2 text-slate-600">{item.name}</td>
            <td className="py-2 font-medium">₹{item.total || 0}</td>
            <td className="py-2 text-slate-600">{item.uploaded_by_name || '-'}</td>
            <td className="py-2 text-slate-600">{new Date(item.created_at).toLocaleDateString()}</td>
          </>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .get('/admin/dashboard-stats')
      .then((res) => {
        if (mounted) {
          setStats(res.data?.data);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (mounted) {
          setError(e?.response?.data?.message || 'Failed to load dashboard');
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-orange-50 via-peach-50 to-pink-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={`bg-${i}`}
            className="absolute rounded-full bg-gradient-to-br from-orange-200/20 to-pink-200/20 blur-3xl animate-float-slow"
            style={{
              width: `${200 + i * 50}px`,
              height: `${200 + i * 50}px`,
              left: `${-10 + i * 20}%`,
              top: `${-5 + i * 15}%`,
              animationDelay: `${i * 2}s`,
              animationDuration: `${20 + i * 5}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* Header with animation */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="mt-2 text-lg text-orange-600">Studio overview & analytics</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Live</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="relative">
              <LoadingSpinner size="lg" />
              <div className="absolute inset-0 animate-ping">
                <LoadingSpinner size="lg" />
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="animate-shake">
            <EmptyState
              title="Error Loading Dashboard"
              description={error}
            />
          </div>
        ) : !stats ? (
          <div className="animate-fade-in">
            <EmptyState
              title="No Data Available"
              description="Dashboard statistics will appear here once there's activity in the system."
            />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              {[
                { key: 'activeUsers', label: 'Active Users', icon: 'users' },
                { key: 'activeStaff', label: 'Active Staff', icon: 'staff' },
                { key: 'activeStaffProfiles', label: 'Staff Profiles', icon: 'profiles' },
                { key: 'totalAppointments', label: 'Total Appointments', icon: 'appointments' },
                { key: 'completedAppointments', label: 'Completed', icon: 'completed' },
                { key: 'uploadedWorks', label: 'Uploaded Works', icon: 'works' }
              ].map((metric, index) => (
                <div
                  key={metric.key}
                  className={`relative group animate-scale-in cursor-pointer transform transition-all duration-300 hover:scale-105 hover:-translate-y-2`}
                  style={{ animationDelay: `${index * 100}ms` }}
                  onMouseEnter={() => setHoveredCard(metric.key)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => loadMetricDetails(metric.key)}
                >
                  <Card className={`relative overflow-hidden bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-300 ${hoveredCard === metric.key ? 'ring-2 ring-orange-400 ring-opacity-50' : ''}`}>
                    {/* Gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${getMetricColor(metric.key)} opacity-5`}></div>
                    
                    {/* Icon */}
                    <div className={`absolute top-4 right-4 w-10 h-10 rounded-full bg-gradient-to-br ${getMetricColor(metric.key)} flex items-center justify-center text-white transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12`}>
                      {getMetricIcon(metric.key)}
                    </div>
                    
                    {/* Content */}
                    <div className="relative z-10 p-6">
                      <div className="text-sm font-medium text-gray-600 mb-2">{metric.label}</div>
                      <div className={`text-3xl font-bold bg-gradient-to-r ${getMetricColor(metric.key)} bg-clip-text text-transparent`}>
                        {animatedStats[metric.key] || 0}
                      </div>
                      
                      {/* Hover indicator */}
                      <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${getMetricColor(metric.key)} transform transition-transform duration-300 ${hoveredCard === metric.key ? 'scale-x-100' : 'scale-x-0'} origin-left`}></div>
                    </div>
                    
                    {/* Glow effect on hover */}
                    {hoveredCard === metric.key && (
                      <div className={`absolute inset-0 bg-gradient-to-br ${getMetricColor(metric.key)} opacity-10 animate-pulse`}></div>
                    )}
                  </Card>
                </div>
              ))}
            </div>

            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 animate-slide-up-delay-1">
              <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-700">System is running smoothly</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">All services operational</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Last backup completed</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

      {/* Details Modal */}
      {selectedMetric && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={closeDetailsModal}
        >
          <div 
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scale-in shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-slate-900 capitalize">
                  {selectedMetric.replace(/([A-Z])/g, ' $1').trim()} Details
                </h3>
                <button
                  onClick={closeDetailsModal}
                  className="text-slate-400 hover:text-slate-600 text-2xl transform transition-transform duration-200 hover:scale-110"
                >
                  ×
                </button>
              </div>

              {detailsLoading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : metricDetails.length === 0 ? (
                <EmptyState
                  title="No Data Found"
                  description={`No ${selectedMetric.replace(/([A-Z])/g, ' $1').trim().toLowerCase()} available.`}
                />
              ) : (
                <div className="overflow-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-600 border-b">
                        {renderTableHeaders(selectedMetric)}
                      </tr>
                    </thead>
                    <tbody>
                      {metricDetails.map((item, index) => (
                        <tr key={item.id || index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors duration-200">
                          {renderTableRow(item, selectedMetric)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Staff Profiles Management */}
      <div className="mt-8 animate-slide-up-delay-2">
        <StaffProfileManager />
      </div>
      </div>
    </div>
  );
}
