import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/Card';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import '../../styles/analytics.css';

export function AnalyticsPage() {
  const [salesData, setSalesData] = useState(null);
  const [staffSales, setStaffSales] = useState([]);
  const [staffDetailedSales, setStaffDetailedSales] = useState([]);
  const [dailySales, setDailySales] = useState([]);
  const [weeklySales, setWeeklySales] = useState([]);
  const [monthlySales, setMonthlySales] = useState([]);
  const [timeRange, setTimeRange] = useState('month');
  const [chartModalOpen, setChartModalOpen] = useState(false);
  const [selectedChartPoint, setSelectedChartPoint] = useState(null);
  const [staffChartModalOpen, setStaffChartModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [allStaffProfiles, setAllStaffProfiles] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);

  useEffect(() => {
    loadAnalyticsData();
    loadAllStaffProfiles();
  }, [timeRange]);

  const loadAllStaffProfiles = async () => {
    try {
      const response = await api.get('/staff-profiles/active');
      setAllStaffProfiles(response.data?.data || []);
    } catch (err) {
      console.error('Failed to load staff profiles:', err);
    }
  };

  const loadStaffAnalytics = async (staffId) => {
    setStaffLoading(true);
    try {
      // Load individual staff detailed completed works data
      const [staffResponse, detailedResponse] = await Promise.all([
        api.get('/admin/analytics/staff-sales'),
        api.get(`/admin/analytics/staff-sales/${staffId}`)
      ]);
      
      const staffData = staffResponse.data?.data || [];
      const detailedData = detailedResponse.data?.data || [];
      
      setStaffSales(staffData);
      setStaffDetailedSales(detailedData);
      
      setStaffLoading(false);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load staff analytics');
      setStaffLoading(false);
    }
  };

  const handleStaffSelect = (staff) => {
    setSelectedStaff(staff);
    // Find the staff user ID from the staff sales data
    const staffData = staffSales.find(s => s.staff_name === staff.name);
    if (staffData) {
      loadStaffAnalytics(staffData.staff_id);
    }
  };

  const closeStaffView = () => {
    setSelectedStaff(null);
    loadAnalyticsData(); // Reload overall data
  };

  const loadAnalyticsData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Load staff sales data
      const staffResponse = await api.get('/admin/analytics/staff-sales');
      const staffData = staffResponse.data?.data || [];
      
      // Load time-based sales data
      const salesResponse = await api.get(`/admin/analytics/sales?range=${timeRange}`);
      const timeData = salesResponse.data?.data || [];
      
      setStaffSales(staffData);
      
      // Process time-based data
      if (timeRange === 'day') {
        setDailySales(timeData);
        setWeeklySales([]);
        setMonthlySales([]);
      } else if (timeRange === 'week') {
        setDailySales([]);
        setWeeklySales(timeData);
        setMonthlySales([]);
      } else {
        setDailySales([]);
        setWeeklySales([]);
        setMonthlySales(timeData);
      }
      
      setSalesData(timeData);
      setLoading(false);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load analytics data');
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getTopPerformer = () => {
    if (staffSales.length === 0) return null;
    return staffSales.reduce((max, staff) => 
      parseFloat(staff.total_amount) > parseFloat(max.total_amount) ? staff : max
    );
  };

  const getTotalRevenue = () => {
    const data = timeRange === 'day' ? dailySales : 
                  timeRange === 'week' ? weeklySales : monthlySales;
    return data.reduce((sum, item) => sum + parseFloat(item.total_amount || 0), 0);
  };

  const renderStaffSelector = () => {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 animate-scale-in" style={{ animationDelay: '0ms' }}>
        <h2 className="text-xl font-bold text-gray-800 mb-6">Staff Performance Overview</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {allStaffProfiles.map((staff) => {
            // Find staff data by matching staff profile name with staff sales name
            const staffData = staffSales.find(s => s.staff_name === staff.name);
            const salesCount = staffData?.total_sales || 0;
            const revenue = parseFloat(staffData?.total_amount || 0);
            
            return (
              <div 
                key={staff.id} 
                className="group relative bg-white rounded-xl border border-slate-200 p-3 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer"
                onClick={() => handleStaffSelect(staff)}
              >
                {/* Staff card content */}
                <div className="relative p-4 text-center">
                  {/* Avatar */}
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {staff.name?.charAt(0) || 'S'}
                  </div>
                  
                  {/* Staff info */}
                  <div className="font-semibold text-slate-900 text-sm group-hover:text-blue-600 transition-colors duration-300">
                    {staff.name}
                  </div>
                  <div className="text-xs text-slate-600 mt-1">{staff.phone || 'Staff'}</div>
                  
                  {/* Performance metrics */}
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <div className="text-lg font-bold text-green-600">{formatCurrency(revenue)}</div>
                    <div className="text-xs text-slate-500">{salesCount} sales</div>
                  </div>
                  
                  {/* Hover indicator */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
                      →
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 text-center text-sm text-slate-500">
          {allStaffProfiles.length} staff profiles available
        </div>
      </div>
    );
  };

  const renderIndividualStaffChart = () => {
    if (!selectedStaff) return null;
    
    // Find staff data by matching staff profile name with staff sales name
    const staffData = staffSales.find(s => s.staff_name === selectedStaff.name);
    const salesCount = staffData?.total_sales || 0;
    const revenue = parseFloat(staffData?.total_amount || 0);
    const averageAmount = parseFloat(staffData?.average_amount || 0);
    const uniqueCustomers = staffData?.unique_customers || 0;
    const dailyBreakdown = staffData?.daily_breakdown ? 
      (typeof staffData.daily_breakdown === 'string' ? 
        JSON.parse(staffData.daily_breakdown || '[]') : 
        staffData.daily_breakdown) : [];
    
    // Use daily breakdown for accurate chart data
    const chartData = dailyBreakdown.map(day => ({
      date: day.date,
      sales: day.sales,
      revenue: day.revenue,
      customers: day.customers
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const maxSales = Math.max(...chartData.map(d => d.sales));
    const maxCustomers = Math.max(...chartData.map(d => d.customers));
    const avgDailySales = chartData.length > 0 ? salesCount / chartData.length : 0;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[85vh] overflow-hidden animate-fade-in flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-2xl backdrop-blur-sm">
                  {selectedStaff.name?.charAt(0) || 'S'}
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{selectedStaff.name}</h3>
                  <p className="text-blue-100">
                    {salesCount} Completed Works • {uniqueCustomers} Unique Customers
                  </p>
                </div>
              </div>
              <button
                onClick={closeStaffView}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-300 flex items-center justify-center text-white text-xl backdrop-blur-sm"
              >
                ×
              </button>
            </div>
          </div>
          
          {/* Enhanced Performance Summary */}
          <div className="p-4 bg-gradient-to-br from-slate-50 to-blue-50 flex-shrink-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="text-center p-4 bg-white rounded-xl shadow-lg">
                <div className="text-3xl font-bold text-blue-600">{salesCount}</div>
                <div className="text-sm text-slate-600 mt-1">Total Works</div>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-lg">
                <div className="text-3xl font-bold text-green-600">{formatCurrency(revenue)}</div>
                <div className="text-sm text-slate-600 mt-1">Total Revenue</div>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-lg">
                <div className="text-3xl font-bold text-purple-600">{formatCurrency(averageAmount)}</div>
                <div className="text-sm text-slate-600 mt-1">Average Sale</div>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-lg">
                <div className="text-3xl font-bold text-orange-600">{uniqueCustomers}</div>
                <div className="text-sm text-slate-600 mt-1">Unique Customers</div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Staff Candlestick Chart */}
          <div className="p-4 flex-1 overflow-y-auto">
            <h4 className="text-xl font-bold text-slate-900 mb-4">Daily Performance Column Chart</h4>
            <div className="text-sm text-slate-600 mb-4">
              X-Axis: Days | Y-Axis: Sales Count & Customer Attendance
            </div>
            <div className="text-sm text-blue-600 mb-4 font-medium">
              💡 Click to view detailed chart
            </div>
            
            {chartData.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <div className="text-6xl mb-4">📊</div>
                <p>No daily performance data available</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 cursor-pointer hover:shadow-lg transition-shadow duration-300" onClick={() => setStaffChartModalOpen(true)}>
                <div className="relative h-48 sm:h-56 bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 rounded-lg p-2 sm:p-3 overflow-x-auto">
                  {/* Enhanced grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="border-b border-slate-200/30" />
                    ))}
                  </div>
                  
                  {/* Enhanced Y-axis labels */}
                  <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-slate-500 -ml-8 sm:-ml-12">
                    <div className="font-semibold text-xs sm:text-sm">{maxSales}</div>
                    <div className="text-xs">{Math.round(maxSales * 0.75)}</div>
                    <div className="text-xs">{Math.round(maxSales * 0.5)}</div>
                    <div className="text-xs">{Math.round(maxSales * 0.25)}</div>
                    <div className="font-semibold text-xs sm:text-sm">0</div>
                  </div>
                  
                  {/* Enhanced column chart with proper spacing */}
                  <div className="relative h-full flex items-end justify-start px-2 sm:px-6" style={{ minWidth: `${Math.min(chartData.length * 60, 800)}px` }}>
                    {chartData.map((item, index) => {
                      const salesCount = item.sales;
                      const customerCount = item.customers;
                      const salesHeight = maxSales > 0 ? (salesCount / maxSales) * 100 : 0;
                      const customersHeight = maxCustomers > 0 ? (customerCount / maxCustomers) * 100 : 0;
                      
                      // Determine candle color based on performance
                      const isPositive = salesCount > avgDailySales;
                      const performancePercent = avgDailySales > 0 ? ((salesCount - avgDailySales) / avgDailySales) * 100 : 0;
                      
                      return (
                        <div key={index} className="relative flex flex-col items-center group mx-1 sm:mx-3" style={{ minWidth: '40px', maxWidth: '60px' }}>
                          {/* Sales Count Column */}
                          <div className="relative flex flex-col items-center mb-1 sm:mb-2">
                            <div 
                              className={`w-6 sm:w-10 rounded-t-lg transition-all duration-1000 ease-out shadow-lg transform hover:scale-105 ${
                                isPositive 
                                  ? 'bg-gradient-to-t from-green-500 via-emerald-500 to-green-400' 
                                  : 'bg-gradient-to-t from-red-500 via-orange-500 to-red-400'
                              }`}
                              style={{ 
                                height: `${salesHeight * 2}px`,
                                animationDelay: `${index * 100}ms`,
                                animation: 'slideUp 0.8s ease-out forwards',
                                opacity: 0
                              }}
                            >
                              {/* Performance indicator on column */}
                              <div className="absolute top-1 left-1 right-1 text-center">
                                <span className={`text-[8px] sm:text-xs font-bold ${
                                  isPositive ? 'text-white' : 'text-white'
                                }`}>
                                  {performancePercent > 0 ? '+' : ''}{performancePercent.toFixed(0)}%
                                </span>
                              </div>
                            </div>
                            
                            {/* Customer Count Column */}
                            <div 
                              className="w-4 sm:w-8 rounded-t-lg transition-all duration-1000 ease-out shadow-lg transform hover:scale-105 bg-gradient-to-t from-blue-500 via-purple-500 to-blue-400"
                              style={{ 
                                height: `${customersHeight * 2}px`,
                                animationDelay: `${index * 150}ms`,
                                animation: 'slideUp 0.8s ease-out forwards',
                                opacity: 0
                              }}
                            >
                              <div className="absolute top-1 left-1 right-1 text-center">
                                <span className="text-[8px] sm:text-xs font-bold text-white">
                                  {customerCount}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Enhanced X-axis label */}
                          <div className="mt-1 sm:mt-2 text-[8px] sm:text-xs text-slate-600 text-center font-medium">
                            <div>
                              <div>{new Date(item.date).getDate()}</div>
                              <div className="text-[6px] sm:text-[10px] text-slate-400">{new Date(item.date).toLocaleDateString('en-IN', { month: 'short' })}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Enhanced Legend */}
                <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4 lg:space-x-8 mt-4 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 sm:w-6 h-4 sm:h-6 bg-gradient-to-t from-green-500 via-emerald-500 to-green-400 rounded-t-lg shadow-md"></div>
                    <span className="text-slate-700 font-medium text-xs sm:text-sm">Above Average Sales</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 sm:w-6 h-4 sm:h-6 bg-gradient-to-t from-red-500 via-orange-500 to-red-400 rounded-t-lg shadow-md"></div>
                    <span className="text-slate-700 font-medium text-xs sm:text-sm">Below Average Sales</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 sm:w-6 h-4 sm:h-6 bg-gradient-to-t from-blue-500 via-purple-500 to-blue-400 rounded-t-lg shadow-md"></div>
                    <span className="text-slate-700 font-medium text-xs sm:text-sm">Customer Count</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Completed Works List */}
          <div className="p-4 border-t border-slate-200">
            <h4 className="text-lg sm:text-xl font-bold text-slate-900 mb-4">Completed Works Details</h4>
            
            {staffLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : staffDetailedSales.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <div className="text-4xl sm:text-6xl mb-4">📋</div>
                <p className="text-sm sm:text-base">No completed works found for this staff member</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4 max-h-48 sm:max-h-64 overflow-y-auto">
                {staffDetailedSales.map((work, index) => (
                  <div key={work.id} className="bg-white border border-slate-200 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:shadow-lg transition-shadow duration-300">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">
                            {work.customer_name?.charAt(0) || 'C'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-slate-900 text-sm sm:text-base truncate">{work.customer_name}</div>
                            <div className="text-xs sm:text-sm text-slate-600 truncate">{work.customer_phone}</div>
                          </div>
                        </div>
                        
                        <div className="mt-2 sm:mt-3 space-y-1 sm:space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                            <span className="text-xs sm:text-sm text-slate-600">Service:</span>
                            <span className="font-medium text-slate-900 text-xs sm:text-sm truncate">{work.service_name}</span>
                            <span className="text-xs text-slate-500">#{work.service_number}</span>
                          </div>
                          
                          {work.description && (
                            <div className="text-xs sm:text-sm text-slate-600 bg-slate-50 p-2 rounded text-xs">
                              {work.description}
                            </div>
                          )}
                          
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs sm:text-sm">
                            <div>
                              <span className="text-slate-600">Amount:</span>
                              <span className="font-medium text-slate-900">₹{work.amount || 0}</span>
                            </div>
                            {work.discount && (
                              <div>
                                <span className="text-slate-600">Discount:</span>
                                <span className="font-medium text-green-600">{work.discount}%</span>
                              </div>
                            )}
                            <div>
                              <span className="text-slate-600">Total:</span>
                              <span className="font-bold text-green-600 text-sm sm:text-lg">{formatCurrency(work.total)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex sm:ml-4 flex-row sm:flex-col items-center gap-2">
                        <div className="text-xs text-slate-500 text-center">
                          {new Date(work.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                        {work.image_url && (
                          <img
                            src={work.image_url.startsWith('http') ? work.image_url : `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${work.image_url}`}
                            alt="Completed work"
                            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-slate-200"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderTimeSalesChart = () => {
    const data = timeRange === 'day' ? dailySales : 
                  timeRange === 'week' ? weeklySales : monthlySales;
    
    if (data.length === 0) return null;
    
    const totalRevenue = getTotalRevenue();
    const totalSales = data.reduce((sum, item) => sum + parseInt(item.total_sales || 0), 0);
    const totalCustomers = data.reduce((sum, item) => sum + parseInt(item.total_sales || 0), 0);
    const maxRevenue = Math.max(...data.map(d => parseFloat(d.total_amount || 0)));
    const maxSales = Math.max(...data.map(d => parseInt(d.total_sales || 0)));
    
    return (
      <div className="space-y-8">
        {/* Premium Summary Cards with Advanced Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Revenue Card with Animated Background */}
          <div className="relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-emerald-600 to-green-700 rounded-2xl opacity-90"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent rounded-2xl transform rotate-45 translate-x-full group-hover:translate-x-0 transition-transform duration-1000"></div>
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10 p-6 shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="relative">
                  <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30">
                    <div className="text-3xl animate-pulse">💰</div>
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xl font-black text-white leading-tight drop-shadow-lg">
                  {formatCurrency(totalRevenue)}
                </div>
                <div className="text-emerald-100 text-xs font-bold uppercase tracking-wider drop-shadow-md">
                  Total Revenue
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-emerald-200 text-xs font-bold opacity-100 drop-shadow-sm">
                    {timeRange === 'day' ? 'Today\'s Performance' : timeRange === 'week' ? 'This Week' : 'This Month'}
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-emerald-300 rounded-full animate-pulse"></div>
                    <div className="w-1 h-1 bg-emerald-300 rounded-full animate-pulse delay-75"></div>
                    <div className="w-1 h-1 bg-emerald-300 rounded-full animate-pulse delay-150"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Total Sales Card with Live Indicator */}
          <div className="relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-2xl opacity-90"></div>
            <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-white/10 to-transparent rounded-2xl transform -rotate-45 -translate-x-full group-hover:translate-x-0 transition-transform duration-1000"></div>
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10 p-6 shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="relative">
                  <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30">
                    <div className="text-3xl animate-pulse">📊</div>
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-ping"></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xl font-black text-white leading-tight drop-shadow-lg">
                  {totalSales.toLocaleString()}
                </div>
                <div className="text-blue-100 text-xs font-bold uppercase tracking-wider drop-shadow-md">
                  Total Sales
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-blue-200 text-xs font-bold opacity-100 drop-shadow-sm">
                    {timeRange === 'day' ? 'Today\'s Performance' : timeRange === 'week' ? 'This Week' : 'This Month'}
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-blue-300 rounded-full animate-pulse"></div>
                    <div className="w-1 h-1 bg-blue-300 rounded-full animate-pulse delay-75"></div>
                    <div className="w-1 h-1 bg-blue-300 rounded-full animate-pulse delay-150"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Average Sale Card with Trend Indicator */}
          <div className="relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-purple-600 to-pink-700 rounded-2xl opacity-90"></div>
            <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-white/10 to-transparent rounded-2xl transform rotate-45 translate-y-full group-hover:translate-y-0 transition-transform duration-1000"></div>
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10 p-6 shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="relative">
                  <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30">
                    <div className="text-3xl animate-pulse">💎</div>
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-400 rounded-full animate-ping"></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xl font-black text-white leading-tight drop-shadow-lg">
                  {totalSales > 0 ? formatCurrency(totalRevenue / totalSales) : '₹0'}
                </div>
                <div className="text-purple-100 text-xs font-bold uppercase tracking-wider drop-shadow-md">
                  Average Sale
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-purple-200 text-xs font-bold opacity-100 drop-shadow-sm">
                    Per transaction
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-purple-300 rounded-full animate-pulse"></div>
                    <div className="w-1 h-1 bg-purple-300 rounded-full animate-pulse delay-75"></div>
                    <div className="w-1 h-1 bg-purple-300 rounded-full animate-pulse delay-150"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Performance Score Card with Rating */}
          <div className="relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-orange-600 to-red-700 rounded-2xl opacity-90"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent rounded-2xl transform -rotate-12 translate-y-full group-hover:translate-y-0 transition-transform duration-1000"></div>
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10 p-6 shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="relative">
                  <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30">
                    <div className="text-3xl animate-pulse">🎯</div>
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full animate-ping"></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xl font-black text-white leading-tight drop-shadow-lg">
                  92.5
                </div>
                <div className="text-orange-100 text-xs font-bold uppercase tracking-wider drop-shadow-md">
                  Performance Score
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-orange-200 text-xs font-bold opacity-100 drop-shadow-sm">
                    Excellent
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-orange-300 rounded-full animate-pulse"></div>
                    <div className="w-1 h-1 bg-orange-300 rounded-full animate-pulse delay-75"></div>
                    <div className="w-1 h-1 bg-orange-300 rounded-full animate-pulse delay-150"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Premium Time Range Selector with Advanced Features */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200/50 backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Sales Analytics
              </h3>
              <p className="text-slate-600 font-medium">
                Track your revenue and sales performance over time
              </p>
              <div className="flex items-center space-x-2 text-xs text-slate-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live Data</span>
                <span>•</span>
                <span>Last updated: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex bg-slate-100 rounded-2xl p-1.5 shadow-inner border border-slate-200">
                {['day', 'week', 'month'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-8 py-4 rounded-xl font-bold text-sm transition-all duration-300 relative overflow-hidden group ${
                      timeRange === range
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                    }`}
                  >
                    <span className="relative z-10">
                      {range === 'day' ? '📅 Daily' : range === 'week' ? '📆 Weekly' : '📊 Monthly'}
                    </span>
                    {timeRange === range && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced Column Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6 cursor-pointer hover:shadow-lg transition-shadow duration-300" onClick={() => setChartModalOpen(true)}>
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-slate-900">Performance Column Analysis</h4>
            <div className="text-sm text-slate-500 mt-1">
              Click to view detailed chart
            </div>
          </div>
          
          <div className="relative h-80 bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 rounded-lg p-4 overflow-x-auto">
            {/* Enhanced grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="border-b border-slate-200/30" />
              ))}
            </div>
            
            {/* Enhanced Y-axis labels */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-slate-500 -ml-12">
              <div className="font-semibold">₹{Math.round(maxRevenue).toLocaleString('en-IN')}</div>
              <div>₹{Math.round(maxRevenue * 0.75).toLocaleString('en-IN')}</div>
              <div>₹{Math.round(maxRevenue * 0.5).toLocaleString('en-IN')}</div>
              <div>₹{Math.round(maxRevenue * 0.25).toLocaleString('en-IN')}</div>
              <div className="font-semibold">₹0</div>
            </div>
            
            {/* Enhanced column chart with proper spacing */}
            <div className="relative h-full flex items-end justify-start px-6" style={{ minWidth: `${data.length * 80}px` }}>
              {data.map((item, index) => {
                const revenue = parseFloat(item.total_amount || 0);
                const salesCount = parseInt(item.total_sales || 0);
                const revenueHeight = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
                const salesHeight = maxSales > 0 ? (salesCount / maxSales) * 100 : 0;
                
                // Determine column color based on performance
                const avgRevenue = totalRevenue / data.length;
                const isPositive = revenue > avgRevenue;
                const performancePercent = ((revenue - avgRevenue) / avgRevenue) * 100;
                
                return (
                  <div key={index} className="relative flex flex-col items-center group mx-3" style={{ minWidth: '50px' }}>
                    {/* Revenue Column */}
                    <div className="relative flex flex-col items-center mb-2">
                      <div 
                        className={`w-10 rounded-t-lg transition-all duration-1000 ease-out shadow-lg transform hover:scale-105 ${
                          isPositive 
                            ? 'bg-gradient-to-t from-green-500 via-emerald-500 to-green-400' 
                            : 'bg-gradient-to-t from-red-500 via-orange-500 to-red-400'
                        }`}
                        style={{ 
                          height: `${revenueHeight * 2.5}px`,
                          animationDelay: `${index * 100}ms`,
                          animation: 'slideUp 0.8s ease-out forwards',
                          opacity: 0
                        }}
                      >
                        {/* Performance indicator on column */}
                        <div className="absolute top-2 left-2 right-2 text-center">
                          <span className={`text-xs font-bold ${
                            isPositive ? 'text-white' : 'text-white'
                          }`}>
                            {performancePercent > 0 ? '+' : ''}{performancePercent.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      
                      {/* Sales Count Column */}
                      <div 
                        className="w-8 rounded-t-lg transition-all duration-1000 ease-out shadow-lg transform hover:scale-105 bg-gradient-to-t from-blue-500 via-purple-500 to-blue-400"
                        style={{ 
                          height: `${salesHeight * 2.5}px`,
                          animationDelay: `${index * 150}ms`,
                          animation: 'slideUp 0.8s ease-out forwards',
                          opacity: 0
                        }}
                      >
                        <div className="absolute top-1 left-1 right-1 text-center">
                          <span className="text-xs font-bold text-white">
                            {salesCount}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Enhanced X-axis label */}
                    <div className="mt-2 text-xs text-slate-600 text-center font-medium">
                      {timeRange === 'day' ? 
                        <div>
                          <div>{new Date(item.date).getDate()}</div>
                          <div className="text-[10px] text-slate-400">{new Date(item.date).toLocaleDateString('en-IN', { month: 'short' })}</div>
                        </div> : 
                        timeRange === 'week' ? 
                        <div>
                          <div>Week {item.week_number}</div>
                          <div className="text-[10px] text-slate-400">{item.week_start ? new Date(item.week_start).getDate() : ''}-{item.week_end ? new Date(item.week_end).getDate() : ''}</div>
                        </div> :
                        <div>
                          <div>{new Date(item.month).toLocaleDateString('en-IN', { month: 'short' })}</div>
                          <div className="text-[10px] text-slate-400">{new Date(item.month).getFullYear()}</div>
                        </div>
                      }
                    </div>
                    
                    {/* Enhanced Tooltip */}
                    <div className="absolute bottom-full mb-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-10 transform group-hover:scale-110">
                      <div className="bg-slate-900 text-white p-4 rounded-xl shadow-2xl whitespace-nowrap min-w-[200px]">
                        <div className="font-semibold text-sm border-b border-slate-700 pb-2 mb-2">
                          {timeRange === 'day' ? formatDate(item.date) :
                           timeRange === 'week' ? `Week ${item.week_number}` :
                           formatDate(item.month)}
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Revenue:</span>
                            <span className="font-medium text-green-400">{formatCurrency(revenue)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Sales:</span>
                            <span className="font-medium text-blue-400">{salesCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Average:</span>
                            <span className="font-medium text-purple-400">{salesCount > 0 ? formatCurrency(revenue / salesCount) : '₹0'}</span>
                          </div>
                          <div className={`mt-2 pt-2 border-t border-slate-700 ${
                            isPositive ? 'text-green-400' : 'text-red-400'
                          }`}>
                            <div className="flex items-center">
                              {isPositive ? '📈' : '📉'} {isPositive ? 'Above' : 'Below'} Average ({Math.abs(performancePercent).toFixed(1)}%)
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Enhanced Legend */}
          <div className="flex justify-center space-x-8 mt-6 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-t from-green-500 via-emerald-500 to-green-400 rounded-t-lg shadow-md"></div>
              <span className="text-slate-700 font-medium">Above Average Revenue</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-t from-red-500 via-orange-500 to-red-400 rounded-t-lg shadow-md"></div>
              <span className="text-slate-700 font-medium">Below Average Revenue</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-t from-blue-500 via-purple-500 to-blue-400 rounded-t-lg shadow-md"></div>
              <span className="text-slate-700 font-medium">Sales Volume</span>
            </div>
          </div>
        </div>
        
        {/* Enhanced Data Table */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h4 className="text-lg font-semibold text-slate-900 mb-4">Detailed Performance Breakdown</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-700 bg-slate-50 border-b-2 border-slate-200">
                  <th className="py-3 px-4 font-semibold">Period</th>
                  <th className="py-3 px-4 font-semibold text-center">Sales</th>
                  <th className="py-3 px-4 font-semibold text-right">Revenue</th>
                  <th className="py-3 px-4 font-semibold text-right">Average</th>
                  <th className="py-3 px-4 font-semibold text-center">Performance</th>
                  <th className="py-3 px-4 font-semibold text-center">Trend</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => {
                  const revenue = parseFloat(item.total_amount || 0);
                  const salesCount = parseInt(item.total_sales || 0);
                  const avgRevenue = salesCount > 0 ? revenue / salesCount : 0;
                  const avgPeriodRevenue = totalRevenue / data.length;
                  const performance = ((revenue - avgPeriodRevenue) / avgPeriodRevenue) * 100;
                  const prevRevenue = index > 0 ? parseFloat(data[index - 1].total_amount || 0) : 0;
                  const trend = revenue > prevRevenue;
                  
                  return (
                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-medium">
                        <div>
                          <div>{timeRange === 'day' ? formatDate(item.date) :
                           timeRange === 'week' ? `Week ${item.week_number}` :
                           formatDate(item.month)}</div>
                          <div className="text-xs text-slate-500">
                            {timeRange === 'day' ? new Date(item.date).toLocaleDateString('en-IN', { weekday: 'short' }) : ''}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full font-semibold text-xs">
                          {salesCount}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-green-600">
                        {formatCurrency(revenue)}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-700">
                        {formatCurrency(avgRevenue)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          performance > 10 ? 'bg-green-100 text-green-700' :
                          performance > 0 ? 'bg-emerald-100 text-emerald-700' :
                          performance > -10 ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {performance > 0 ? '+' : ''}{performance.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {trend ? (
                          <span className="text-green-600">📈</span>
                        ) : (
                          <span className="text-red-600">📉</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Chart Modal Component
  const renderChartModal = () => {
    if (!chartModalOpen) return null;

    const data = timeRange === 'day' ? dailySales : timeRange === 'week' ? weeklySales : monthlySales;
    const totalRevenue = data.reduce((sum, item) => sum + parseFloat(item.total_amount || 0), 0);
    const totalSales = data.reduce((sum, item) => sum + parseInt(item.total_sales || 0), 0);
    const maxRevenue = Math.max(...data.map(d => parseFloat(d.total_amount || 0)));
    const maxSales = Math.max(...data.map(d => parseInt(d.total_sales || 0)));

    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col">
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-700 text-white p-6 flex-shrink-0">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Performance Column Analysis - Detailed View</h2>
                <p className="text-slate-300 mt-1">
                  {timeRange === 'day' ? 'Daily' : timeRange === 'week' ? 'Weekly' : 'Monthly'} Performance Metrics
                </p>
              </div>
              <button
                onClick={() => setChartModalOpen(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl p-4 text-white">
                <div className="text-sm opacity-90">Total Revenue</div>
                <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
              </div>
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-4 text-white">
                <div className="text-sm opacity-90">Total Sales</div>
                <div className="text-2xl font-bold">{totalSales.toLocaleString()}</div>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-4 text-white">
                <div className="text-sm opacity-90">Average Sale</div>
                <div className="text-2xl font-bold">{totalSales > 0 ? formatCurrency(totalRevenue / totalSales) : '₹0'}</div>
              </div>
            </div>

            {/* Large Chart */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="relative h-96 overflow-x-auto overflow-y-hidden">
                {/* Chart Container with proper alignment */}
                <div className="relative h-full min-w-max" style={{ width: '100%', minWidth: `${Math.max(800, data.length * 120)}px` }}>
                  {/* Enhanced grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="border-b border-slate-200/30" />
                    ))}
                  </div>
                  
                  {/* Enhanced Y-axis labels */}
                  <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-slate-600 -ml-16 pr-2">
                    <div className="font-semibold text-right">₹{Math.round(maxRevenue).toLocaleString('en-IN')}</div>
                    <div className="text-right">₹{Math.round(maxRevenue * 0.8).toLocaleString('en-IN')}</div>
                    <div className="text-right">₹{Math.round(maxRevenue * 0.6).toLocaleString('en-IN')}</div>
                    <div className="text-right">₹{Math.round(maxRevenue * 0.4).toLocaleString('en-IN')}</div>
                    <div className="text-right">₹{Math.round(maxRevenue * 0.2).toLocaleString('en-IN')}</div>
                    <div className="font-semibold text-right">₹0</div>
                  </div>
                  
                  {/* Enhanced column chart with proper alignment */}
                  <div className="relative h-full flex items-end justify-start px-20" style={{ height: '100%' }}>
                    {data.map((item, index) => {
                      const revenue = parseFloat(item.total_amount || 0);
                      const salesCount = parseInt(item.total_sales || 0);
                      const revenueHeight = maxRevenue > 0 ? (revenue / maxRevenue) * 320 : 0;
                      const salesHeight = maxSales > 0 ? (salesCount / maxSales) * 320 : 0;
                      
                      // Determine column color based on performance
                      const avgRevenue = totalRevenue / data.length;
                      const isPositive = revenue > avgRevenue;
                      const performancePercent = ((revenue - avgRevenue) / avgRevenue) * 100;
                      
                      return (
                        <div 
                          key={index} 
                          className="relative flex flex-col items-center group" 
                          style={{ 
                            width: '80px',
                            marginRight: '20px',
                            flexShrink: 0
                          }}
                        >
                          {/* Revenue Column */}
                          <div className="relative flex flex-col items-center justify-end mb-2" style={{ height: '320px' }}>
                            <div 
                              className={`w-14 rounded-t-lg transition-all duration-1000 ease-out shadow-lg transform hover:scale-105 ${
                                isPositive 
                                  ? 'bg-gradient-to-t from-green-500 via-emerald-500 to-green-400' 
                                  : 'bg-gradient-to-t from-red-500 via-orange-500 to-red-400'
                              }`}
                              style={{ 
                                height: `${revenueHeight}px`,
                                animationDelay: `${index * 100}ms`,
                                animation: 'slideUp 0.8s ease-out forwards',
                                opacity: 0
                              }}
                            >
                              {/* Performance indicator on column */}
                              <div className="absolute top-2 left-2 right-2 text-center">
                                <span className={`text-xs font-bold text-white drop-shadow-md`}>
                                  {performancePercent > 0 ? '+' : ''}{performancePercent.toFixed(0)}%
                                </span>
                              </div>
                            </div>
                            
                            {/* Sales Count Column */}
                            <div 
                              className="w-12 rounded-t-lg transition-all duration-1000 ease-out shadow-lg transform hover:scale-105 bg-gradient-to-t from-blue-500 via-purple-500 to-blue-400 mt-2"
                              style={{ 
                                height: `${salesHeight}px`,
                                animationDelay: `${index * 150}ms`,
                                animation: 'slideUp 0.8s ease-out forwards',
                                opacity: 0
                              }}
                            >
                              <div className="absolute top-1 left-1 right-1 text-center">
                                <span className="text-xs font-bold text-white drop-shadow-md">
                                  {salesCount}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Enhanced X-axis label */}
                          <div className="mt-3 text-xs text-slate-700 text-center font-medium min-w-[80px]">
                            {timeRange === 'day' ? 
                              <div>
                                <div className="font-bold text-sm">{new Date(item.date).getDate()}</div>
                                <div className="text-[10px] text-slate-500">{new Date(item.date).toLocaleDateString('en-IN', { month: 'short' })}</div>
                              </div> : 
                              timeRange === 'week' ? 
                              <div>
                                <div className="font-bold text-sm">W{item.week_number}</div>
                                <div className="text-[10px] text-slate-500">
                                  {item.week_start ? new Date(item.week_start).getDate() : ''}-{item.week_end ? new Date(item.week_end).getDate() : ''}
                                </div>
                              </div> :
                              <div>
                                <div className="font-bold text-sm">{new Date(item.month).toLocaleDateString('en-IN', { month: 'short' })}</div>
                                <div className="text-[10px] text-slate-500">{new Date(item.month).getFullYear()}</div>
                              </div>
                            }
                          </div>
                          
                          {/* Enhanced Tooltip */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20">
                            <div className="bg-slate-900 text-white p-4 rounded-xl shadow-2xl whitespace-nowrap min-w-[240px]">
                              <div className="font-semibold text-sm border-b border-slate-700 pb-2 mb-2">
                                {timeRange === 'day' ? formatDate(item.date) :
                                 timeRange === 'week' ? `Week ${item.week_number}` :
                                 formatDate(item.month)}
                              </div>
                              <div className="space-y-2 text-xs">
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-400">Revenue:</span>
                                  <span className="font-medium text-green-400">{formatCurrency(revenue)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-400">Sales:</span>
                                  <span className="font-medium text-blue-400">{salesCount}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-400">Average:</span>
                                  <span className="font-medium text-purple-400">{salesCount > 0 ? formatCurrency(revenue / salesCount) : '₹0'}</span>
                                </div>
                                <div className={`mt-2 pt-2 border-t border-slate-700 flex items-center justify-between ${
                                  isPositive ? 'text-green-400' : 'text-red-400'
                                }`}>
                                  <span className="flex items-center">
                                    {isPositive ? '📈' : '📉'} {isPositive ? 'Above' : 'Below'} Average
                                  </span>
                                  <span className="font-bold">
                                    {Math.abs(performancePercent).toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex justify-center space-x-8 mt-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-t from-green-500 via-emerald-500 to-green-400 rounded-t-lg shadow-md"></div>
                <span className="text-slate-700 font-medium">Above Average Revenue</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-t from-red-500 via-orange-500 to-red-400 rounded-t-lg shadow-md"></div>
                <span className="text-slate-700 font-medium">Below Average Revenue</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-t from-blue-500 via-purple-500 to-blue-400 rounded-t-lg shadow-md"></div>
                <span className="text-slate-700 font-medium">Sales Volume</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Staff Chart Modal Component
  const renderStaffChartModal = () => {
    if (!staffChartModalOpen || !selectedStaff) return null;

    const chartData = staffDetailedSales.map(item => ({
      date: item.created_at,
      sales: 1,
      customers: 1
    }));

    const maxSales = Math.max(...chartData.map(d => d.sales), 1);
    const maxCustomers = Math.max(...chartData.map(d => d.customers), 1);
    const avgDailySales = chartData.reduce((sum, item) => sum + item.sales, 0) / chartData.length;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col">
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-700 text-white p-6 flex-shrink-0">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Daily Performance Column Chart - Detailed View</h2>
                <p className="text-blue-300 mt-1">
                  {selectedStaff.name} - Individual Performance Metrics
                </p>
              </div>
              <button
                onClick={() => setStaffChartModalOpen(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 text-white">
                <div className="text-sm opacity-90">Total Sales</div>
                <div className="text-2xl font-bold">{chartData.length}</div>
              </div>
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-4 text-white">
                <div className="text-sm opacity-90">Total Customers</div>
                <div className="text-2xl font-bold">{chartData.length}</div>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-4 text-white">
                <div className="text-sm opacity-90">Average Daily</div>
                <div className="text-2xl font-bold">{avgDailySales.toFixed(1)}</div>
              </div>
            </div>

            {/* Large Chart */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="relative h-96 overflow-x-auto overflow-y-hidden">
                {/* Chart Container with proper alignment */}
                <div className="relative h-full min-w-max" style={{ width: '100%', minWidth: `${Math.max(800, chartData.length * 120)}px` }}>
                  {/* Enhanced grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="border-b border-slate-200/30" />
                    ))}
                  </div>
                  
                  {/* Enhanced Y-axis labels */}
                  <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-slate-600 -ml-16 pr-2">
                    <div className="font-semibold text-right">{maxSales}</div>
                    <div className="text-right">{Math.round(maxSales * 0.8)}</div>
                    <div className="text-right">{Math.round(maxSales * 0.6)}</div>
                    <div className="text-right">{Math.round(maxSales * 0.4)}</div>
                    <div className="text-right">{Math.round(maxSales * 0.2)}</div>
                    <div className="font-semibold text-right">0</div>
                  </div>
                  
                  {/* Enhanced column chart with proper alignment */}
                  <div className="relative h-full flex items-end justify-start px-20" style={{ height: '100%' }}>
                    {chartData.map((item, index) => {
                      const salesCount = item.sales;
                      const customerCount = item.customers;
                      const salesHeight = maxSales > 0 ? (salesCount / maxSales) * 320 : 0;
                      const customersHeight = maxCustomers > 0 ? (customerCount / maxCustomers) * 320 : 0;
                      
                      // Determine column color based on performance
                      const isPositive = salesCount > avgDailySales;
                      const performancePercent = avgDailySales > 0 ? ((salesCount - avgDailySales) / avgDailySales) * 100 : 0;
                      
                      return (
                        <div 
                          key={index} 
                          className="relative flex flex-col items-center group" 
                          style={{ 
                            width: '80px',
                            marginRight: '20px',
                            flexShrink: 0
                          }}
                        >
                          {/* Sales Count Column */}
                          <div className="relative flex flex-col items-center justify-end mb-2" style={{ height: '320px' }}>
                            <div 
                              className={`w-14 rounded-t-lg transition-all duration-1000 ease-out shadow-lg transform hover:scale-105 ${
                                isPositive 
                                  ? 'bg-gradient-to-t from-green-500 via-emerald-500 to-green-400' 
                                  : 'bg-gradient-to-t from-red-500 via-orange-500 to-red-400'
                              }`}
                              style={{ 
                                height: `${salesHeight}px`,
                                animationDelay: `${index * 100}ms`,
                                animation: 'slideUp 0.8s ease-out forwards',
                                opacity: 0
                              }}
                            >
                              {/* Performance indicator on column */}
                              <div className="absolute top-2 left-2 right-2 text-center">
                                <span className={`text-xs font-bold text-white drop-shadow-md`}>
                                  {performancePercent > 0 ? '+' : ''}{performancePercent.toFixed(0)}%
                                </span>
                              </div>
                            </div>
                            
                            {/* Customer Count Column */}
                            <div 
                              className="w-12 rounded-t-lg transition-all duration-1000 ease-out shadow-lg transform hover:scale-105 bg-gradient-to-t from-blue-500 via-purple-500 to-blue-400 mt-2"
                              style={{ 
                                height: `${customersHeight}px`,
                                animationDelay: `${index * 150}ms`,
                                animation: 'slideUp 0.8s ease-out forwards',
                                opacity: 0
                              }}
                            >
                              <div className="absolute top-1 left-1 right-1 text-center">
                                <span className="text-xs font-bold text-white drop-shadow-md">
                                  {customerCount}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Enhanced X-axis label */}
                          <div className="mt-3 text-xs text-slate-700 text-center font-medium min-w-[80px]">
                            <div>
                              <div className="font-bold text-sm">{new Date(item.date).getDate()}</div>
                              <div className="text-[10px] text-slate-500">{new Date(item.date).toLocaleDateString('en-IN', { month: 'short' })}</div>
                            </div>
                          </div>
                          
                          {/* Enhanced Tooltip */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20">
                            <div className="bg-slate-900 text-white p-4 rounded-xl shadow-2xl whitespace-nowrap min-w-[240px]">
                              <div className="font-semibold text-sm border-b border-slate-700 pb-2 mb-2">
                                {formatDate(item.date)}
                              </div>
                              <div className="space-y-2 text-xs">
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-400">Sales:</span>
                                  <span className="font-medium text-green-400">{salesCount}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-400">Customers:</span>
                                  <span className="font-medium text-blue-400">{customerCount}</span>
                                </div>
                                <div className={`mt-2 pt-2 border-t border-slate-700 flex items-center justify-between ${
                                  isPositive ? 'text-green-400' : 'text-red-400'
                                }`}>
                                  <span className="flex items-center">
                                    {isPositive ? '📈' : '📉'} {isPositive ? 'Above' : 'Below'} Average
                                  </span>
                                  <span className="font-bold">
                                    {Math.abs(performancePercent).toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex justify-center space-x-8 mt-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-t from-green-500 via-emerald-500 to-green-400 rounded-t-lg shadow-md"></div>
                <span className="text-slate-700 font-medium">Above Average Sales</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-t from-red-500 via-orange-500 to-red-400 rounded-t-lg shadow-md"></div>
                <span className="text-slate-700 font-medium">Below Average Sales</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-t from-blue-500 via-purple-500 to-blue-400 rounded-t-lg shadow-md"></div>
                <span className="text-slate-700 font-medium">Customer Count</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-orange-50 via-peach-50 to-pink-50">
      {/* Enhanced Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating orbs - slow movement */}
        {[...Array(6)].map((_, i) => (
          <div
            key={`float-slow-${i}`}
            className="absolute rounded-full bg-gradient-to-br from-orange-200/20 to-pink-200/20 blur-3xl animate-float-slow"
            style={{
              width: `${200 + i * 40}px`,
              height: `${200 + i * 40}px`,
              left: `${-10 + i * 20}%`,
              top: `${-10 + i * 18}%`,
              animationDelay: `${i * 3}s`,
              animationDuration: `${25 + i * 5}s`
            }}
          />
        ))}
        
        {/* Floating orbs - medium movement */}
        {[...Array(4)].map((_, i) => (
          <div
            key={`float-medium-${i}`}
            className="absolute rounded-full bg-gradient-to-br from-blue-200/15 to-purple-200/15 blur-2xl animate-float-medium"
            style={{
              width: `${150 + i * 30}px`,
              height: `${150 + i * 30}px`,
              right: `${-5 + i * 15}%`,
              bottom: `${-5 + i * 12}%`,
              animationDelay: `${i * 2}s`,
              animationDuration: `${15 + i * 3}s`
            }}
          />
        ))}
        
        {/* Fast moving small orbs */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`float-fast-${i}`}
            className="absolute rounded-full bg-gradient-to-br from-yellow-200/10 to-red-200/10 blur-xl animate-float-fast"
            style={{
              width: `${60 + i * 15}px`,
              height: `${60 + i * 15}px`,
              left: `${i * 12}%`,
              top: `${i * 10}%`,
              animationDelay: `${i * 1.5}s`,
              animationDuration: `${8 + i * 2}s`
            }}
          />
        ))}
        
        {/* Diagonal sliding elements */}
        {[...Array(3)].map((_, i) => (
          <div
            key={`slide-${i}`}
            className="absolute w-32 h-32 bg-gradient-to-br from-green-200/10 to-emerald-200/10 rounded-full blur-2xl animate-slide-diagonal"
            style={{
              animationDelay: `${i * 7}s`,
              animationDuration: `${20 + i * 3}s`
            }}
          />
        ))}
        
        {/* Pulsing glow spots */}
        {[...Array(5)].map((_, i) => (
          <div
            key={`pulse-${i}`}
            className="absolute rounded-full bg-gradient-to-br from-indigo-200/15 to-pink-200/15 blur-3xl animate-pulse-glow"
            style={{
              width: `${120 + i * 25}px`,
              height: `${120 + i * 25}px`,
              left: `${15 + i * 18}%`,
              top: `${20 + i * 15}%`,
              animationDelay: `${i * 1.2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6">
        {/* Enhanced Header */}
        <div className="mb-10 animate-slide-up">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
              <p className="mt-2 text-lg text-orange-600">Interactive staff performance and revenue insights</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Live indicator */}
              <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">Live Data</span>
              </div>
              
              {/* Time Range Selector */}
              <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-1">
                {['day', 'week', 'month'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      timeRange === range
                        ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md'
                        : 'text-gray-600 hover:bg-orange-100 hover:text-orange-600'
                    }`}
                  >
                    {range === 'day' ? 'Today' : range === 'week' ? 'This Week' : 'This Month'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {error ? (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 animate-shake">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-8 8 8 8 0 01-8-8zM2 10a8 8 0 1116 0 8 8 0 01-16 0z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        ) : null}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="text-center">
              <div className="relative">
                <LoadingSpinner size="xl" />
                <div className="absolute inset-0 animate-ping">
                  <LoadingSpinner size="xl" />
                </div>
              </div>
              <p className="mt-4 text-lg text-orange-600 animate-pulse">Loading analytics data...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            {renderStaffSelector()}
            {/* Enhanced Time Sales Chart */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 animate-scale-in" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Revenue & Sales Trends</h2>
                <button
                  onClick={() => setChartModalOpen(true)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-2 rounded-xl hover:from-orange-600 hover:to-pink-600 transform transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="font-medium">View Detailed Chart</span>
                </button>
              </div>
              
              {renderTimeSalesChart()}
            </div>

            {/* Individual Staff Chart */}
            {selectedStaff && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 animate-scale-in" style={{ animationDelay: '400ms' }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Individual Staff Performance</h2>
                  <button
                    onClick={() => setStaffChartModalOpen(true)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl hover:from-purple-600 hover:to-pink-600 transform transition-all duration-200 hover:scale-105 shadow-lg"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="font-medium">Detailed Analysis</span>
                  </button>
                </div>
                
                {renderIndividualStaffChart()}
              </div>
            )}
          </div>
        )}
        
        {/* Modals */}
        {renderChartModal()}
        {renderStaffChartModal()}
      </div>
    </div>
  );
}
