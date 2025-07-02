import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { motion } from "framer-motion";
import { 
  FaUsers,
  FaBoxOpen,
  FaRocket,
  FaShoppingBag,
  FaPrint,
  FaMoneyBillWave,
  FaClock,
  FaExclamationTriangle,
  FaCheckCircle,
  FaUserPlus,
  FaArrowUp,
  FaArrowDown,
  FaBell
} from "react-icons/fa";
import { MdCategory, MdRefresh, MdDashboard } from "react-icons/md";
import { RiQuestionnaireFill } from "react-icons/ri";
import {
  Card,
  Text,
  Group,
  Title,
  SegmentedControl,
  Avatar,
  Badge,
  ActionIcon,
  Loader,
  Alert,
  Tooltip,
  Skeleton,
  SimpleGrid,
  Stack,
  ThemeIcon,
  Paper,
  Center,
} from "@mantine/core";
const Bar = lazy(() => import('react-chartjs-2').then(m => ({ default: m.Bar })));
const Doughnut = lazy(() => import('react-chartjs-2').then(m => ({ default: m.Doughnut })));
const Line = lazy(() => import('react-chartjs-2').then(m => ({ default: m.Line })));
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title as ChartTitle,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
  Filler,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ChartTitle,
  ChartTooltip,
  Legend,
  ArcElement,
  Filler
);

import { getDashboardData } from '../../utils/supabaseApi';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
};

export default function Dashboard() {
  const { currentUser } = useAdminAuth();
  const [timeframe, setTimeframe] = useState("monthly");
  
  // Real-time stats state
  const [stats, setStats] = useState({
    users: 0,
    customers: 0,
    products: 0,
    custom_prints: 0,
    revenue: 0,
    categories: 0,
    enquiries: 0
  });
  
  // Previous period stats for comparison
  const [previousStats, setPreviousStats] = useState({
    users: 0,
    customers: 0,
    products: 0,
    custom_prints: 0,
    revenue: 0,
    categories: 0,
    enquiries: 0
  });
  
  // UI state management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  // Data state
  const [latestUsers, setLatestUsers] = useState([]);
  const [latestCustomPrints, setLatestCustomPrints] = useState([]);
  const [categorySales, setCategorySales] = useState([]);
  const [customPrintStatusData, setCustomPrintStatusData] = useState([]);
  const [customPrintTypes, setCustomPrintTypes] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [userActivity, setUserActivity] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [enquiryData, setEnquiryData] = useState([]);
  const [enquiryStatus, setEnquiryStatus] = useState([]);
  
  // Basic analytics data
  const [avgOrderValue, setAvgOrderValue] = useState(0);

  // Calculate growth percentages
  const calculateGrowth = useCallback((current, previous) => {
    if (!previous || previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous * 100).toFixed(1);
  }, []);

  // Generate alerts based on data
  const generateAlerts = useCallback((stats, customPrintStatusData) => {
    const alerts = [];
    
    // Low stock or urgent enquiries
    if (stats.enquiries > 10) {
      alerts.push({
        type: 'warning',
        title: 'High Enquiry Volume',
        message: `${stats.enquiries} pending enquiries need attention`,
        icon: <FaExclamationTriangle />
      });
    }
    
    // Custom print status alerts
    const pendingPrints = customPrintStatusData.find(item => item.status === 'Pending')?.count || 0;
    if (pendingPrints > 5) {
      alerts.push({
        type: 'error',
        title: 'Pending Print Requests',
        message: `${pendingPrints} print requests awaiting approval`,
        icon: <FaClock />
      });
    }
    
    // Growth alerts
    const currentUsers = stats.users;
    if (currentUsers === 0) {
      alerts.push({
        type: 'info',
        title: 'Welcome!',
        message: 'Set up your first products and categories to get started',
        icon: <FaRocket />
      });
    }
    
    setAlerts(alerts);
  }, []);

  // Fetch dashboard data (stats, latest lists, sales, revenue)
  const fetchDashboardData = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      setRefreshing(true);
      
      // Fetch current period data
      const res = await getDashboardData(timeframe);
      if (!res.success) throw new Error(res.error);
      
      const { 
        stats, 
        latestUsers, 
        latestCustomPrints, 
        categorySales, 
        revenueData, 
        userActivity,
        customPrintTypes,
        customPrintStatus,
        enquiryData,
        enquiryStatus
      } = res;
      
      // Fetch previous period for comparison
      const previousTimeframe = timeframe === 'daily' ? 'weekly' : 
                               timeframe === 'weekly' ? 'monthly' : 
                               timeframe === 'monthly' ? 'yearly' : 'yearly';
      const prevRes = await getDashboardData(previousTimeframe);
      
      // Set current data
      setStats(stats || {});
      setLatestUsers(latestUsers || []);
      setLatestCustomPrints(latestCustomPrints || []);
      setCategorySales(categorySales || []);
      setRevenueData(revenueData || []);
      setUserActivity(userActivity || []);
      setCustomPrintTypes(customPrintTypes || []);
      setCustomPrintStatusData(customPrintStatus || []);
      setEnquiryData(enquiryData || []);
      setEnquiryStatus(enquiryStatus || []);
      
      // Calculate average order value from actual data
      const avgOrderCalc = (stats?.revenue || 0) / (stats?.custom_prints || 1);
      setAvgOrderValue(avgOrderCalc);
      
      // Set previous data for comparison
      if (prevRes.success) {
        setPreviousStats(prevRes.stats || {});
      }
      
      // Generate alerts
      generateAlerts(stats || {}, customPrintStatus || []);
      
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Dashboard error', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { 
    fetchDashboardData(true); 
  }, [timeframe]);

  // Auto refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData(false);
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [timeframe]);

  // Function to manually refresh data
  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  // Enhanced statsCards with growth indicators and new metrics
  const statsCards = useMemo(() => [
    { 
      title: "Total Users", 
      value: stats.users || 0, 
      previous: previousStats.users || 0,
      icon: <FaUsers size={24}/>, 
      color: "blue", 
      description: "Overall registered users",
      trend: "up"
    },
    { 
      title: "Active Customers", 
      value: stats.customers || 0, 
      previous: previousStats.customers || 0,
      icon: <FaUserPlus size={24}/>, 
      color: "teal", 
      description: "Customer role users",
      trend: "up"
    },
    { 
      title: "Products Listed", 
      value: stats.products || 0, 
      previous: previousStats.products || 0,
      icon: <FaBoxOpen size={24}/>, 
      color: "purple", 
      description: "Active products",
      trend: "up"
    },
    { 
      title: "Print Requests", 
      value: stats.custom_prints || 0, 
      previous: previousStats.custom_prints || 0,
      icon: <FaPrint size={24}/>, 
      color: "green", 
      description: "Custom print orders",
      trend: "up"
    },
    { 
      title: "Total Revenue", 
      value: stats.revenue || 0, 
      previous: previousStats.revenue || 0,
      icon: <FaMoneyBillWave size={24}/>, 
      color: "cyan", 
      description: "Revenue generated",
      trend: "up",
      isAmount: true
    },
    { 
      title: "Categories", 
      value: stats.categories || 0, 
      previous: previousStats.categories || 0,
      icon: <MdCategory size={24}/>, 
      color: "orange", 
      description: "Product categories",
      trend: "neutral"
    },
    { 
      title: "Pending Enquiries", 
      value: stats.enquiries || 0, 
      previous: previousStats.enquiries || 0,
      icon: <RiQuestionnaireFill size={24}/>, 
      color: "red", 
      description: "Need attention",
      trend: "down"
    }
  ], [stats, previousStats]);

  // Prepare chart data using real dynamic data
  const customPrintTypesData = useMemo(() => {
    if (!customPrintTypes || customPrintTypes.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{
          label: 'Print Requests',
          data: [1],
          backgroundColor: ['rgba(200,200,200,0.6)'],
          borderColor: ['rgba(200,200,200,1)'],
          borderWidth: 1
        }]
      };
    }
    
    return {
      labels: customPrintTypes.map(item => item.product_type || 'Unknown'),
      datasets: [{
        label: 'Print Requests',
        data: customPrintTypes.map(item => item.count || 0),
        backgroundColor: [
          'rgba(75,192,192,0.8)',
          'rgba(255,99,132,0.8)',
          'rgba(54,162,235,0.8)',
          'rgba(255,206,86,0.8)',
          'rgba(153,102,255,0.8)',
          'rgba(255,159,64,0.8)'
        ],
        borderColor: [
          'rgba(75,192,192,1)',
          'rgba(255,99,132,1)',
          'rgba(54,162,235,1)',
          'rgba(255,206,86,1)',
          'rgba(153,102,255,1)',
          'rgba(255,159,64,1)'
        ],
        borderWidth: 2
      }]
    };
  }, [customPrintTypes]);
  
  const revenueChartData = useMemo(() => {
    if (!revenueData || revenueData.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [
          { label: 'Revenue', data: [0], backgroundColor: 'rgba(53,162,235,0.2)', borderColor: 'rgba(53,162,235,1)', fill: true }
        ]
      };
    }
    
    return {
      labels: revenueData.map(r => r.month || 'Unknown'),
      datasets: [
        { 
          label: 'Revenue (₹)', 
          data: revenueData.map(r => r.revenue || 0), 
          backgroundColor: 'rgba(53,162,235,0.2)', 
          borderColor: 'rgba(53,162,235,1)', 
          fill: true,
          tension: 0.4
        }
      ]
    };
  }, [revenueData]);
  
  const customPrintStatusChartData = useMemo(() => {
    if (!customPrintStatusData || customPrintStatusData.length === 0) {
      return {
        labels: ['No Requests'],
        datasets: [{
          label: 'Print Requests',
          data: [1],
          backgroundColor: ['rgba(200,200,200,0.6)'],
          borderColor: ['rgba(200,200,200,1)'],
          borderWidth: 1
        }]
      };
    }
    
    return {
      labels: customPrintStatusData.map(c => c.status || 'Unknown'),
      datasets: [{
        label: 'Print Requests',
        data: customPrintStatusData.map(c => c.count || 0),
        backgroundColor: [
          'rgba(255,206,86,0.8)',
          'rgba(75,192,192,0.8)',
          'rgba(54,162,235,0.8)',
          'rgba(76,175,80,0.8)',
          'rgba(255,99,132,0.8)'
        ],
        borderColor: [
          'rgba(255,206,86,1)',
          'rgba(75,192,192,1)',
          'rgba(54,162,235,1)',
          'rgba(76,175,80,1)',
          'rgba(255,99,132,1)'
        ],
        borderWidth: 2
      }]
    };
  }, [customPrintStatusData]);

  // Category performance data
  const categoryPerformanceData = useMemo(() => {
    if (!categorySales || categorySales.length === 0) {
      return {
        labels: ['No Categories'],
        datasets: [{
          label: 'Products',
          data: [0],
          backgroundColor: 'rgba(200,200,200,0.6)'
        }]
      };
    }
    
    return {
      labels: categorySales.map(cat => cat.category || 'Unknown'),
      datasets: [{
        label: 'Products Listed',
        data: categorySales.map(cat => cat.sales || 0),
        backgroundColor: [
          'rgba(255,99,132,0.8)',
          'rgba(54,162,235,0.8)',
          'rgba(255,206,86,0.8)',
          'rgba(75,192,192,0.8)',
          'rgba(153,102,255,0.8)',
          'rgba(255,159,64,0.8)'
        ]
      }]
    };
  }, [categorySales]);

  return (
    <motion.div 
      className="p-6 space-y-6 min-h-screen mantine-bg"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header with Real-time Updates */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <MdDashboard className="text-blue-600" />
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back{currentUser ? `, ${currentUser.displayName || currentUser.email}` : ''} to your admin dashboard
          </p>
          <Text size="xs" color="dimmed" className="flex items-center gap-1 mt-1">
            <FaClock size={12} />
            Last updated: {lastUpdated.toLocaleTimeString()}
          </Text>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <SegmentedControl
            value={timeframe}
            onChange={setTimeframe}
            data={[
              { label: 'Daily', value: 'daily' },
              { label: 'Weekly', value: 'weekly' },
              { label: 'Monthly', value: 'monthly' },
              { label: 'Yearly', value: 'yearly' },
            ]}
            className="bg-white shadow-sm"
          />
          <Tooltip label="Refresh Dashboard">
            <ActionIcon 
              variant="filled" 
              size="lg" 
              onClick={handleRefresh}
              loading={refreshing}
              color="blue"
            >
              <MdRefresh />
            </ActionIcon>
          </Tooltip>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert color="red" variant="light" className="mb-4">
          {error}
        </Alert>
      )}

      {/* System Alerts */}
      {alerts.length > 0 && (
        <motion.div variants={itemVariants} className="mb-6">
          <Card shadow="sm" padding="lg" radius="md" className="border-l-4 border-orange-400">
            <Title order={4} className="mb-3 flex items-center gap-2">
              <FaBell className="text-orange-500" />
              System Alerts
            </Title>
            <Stack spacing="sm">
              {alerts.map((alert, index) => (
                <Alert 
                  key={index}
                  color={alert.type === 'error' ? 'red' : alert.type === 'warning' ? 'yellow' : 'blue'}
                  variant="light"
                  icon={alert.icon}
                >
                  <strong>{alert.title}:</strong> {alert.message}
                </Alert>
              ))}
            </Stack>
          </Card>
        </motion.div>
      )}

      {/* Enhanced Stats Cards with Growth Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => {
          const growth = calculateGrowth(stat.value, stat.previous);
          const isPositive = parseFloat(growth) > 0;
          const isNegative = parseFloat(growth) < 0;
          
          return (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <Card
                shadow="sm"
                padding="lg"
                radius="md"
                className="mantine-card hover:shadow-lg transition-all duration-300 h-full border-l-4"
                style={{ borderLeftColor: `var(--mantine-color-${stat.color}-6)` }}
              >
                <Group position="apart" className="mb-3">
                  <ThemeIcon 
                    color={stat.color} 
                    variant="light" 
                    size="lg"
                    radius="md"
                  >
                    {stat.icon}
                  </ThemeIcon>
                  {stat.previous > 0 && (
                    <Badge 
                      color={isPositive ? "green" : isNegative ? "red" : "gray"}
                      variant="light"
                      size="sm"
                      leftSection={
                        isPositive ? <FaArrowUp size={8} /> : 
                        isNegative ? <FaArrowDown size={8} /> : null
                      }
                    >
                      {growth}%
                    </Badge>
                  )}
                </Group>
                <Text size="sm" weight={500} color="dimmed" className="mb-1">
                  {stat.title}
                </Text>
                <Title order={2} className="text-2xl font-bold mb-1">
                  {loading ? <Skeleton height={24} width={60} /> : stat.isAmount ? `₹${stat.value.toLocaleString()}` : stat.isPercentage ? `${stat.value}%` : stat.value.toLocaleString()}
                </Title>
                <Text size="xs" color="dimmed">
                  {stat.description}
                </Text>
                {stat.previous > 0 && (
                  <Text size="xs" color="dimmed" className="mt-1">
                    vs {stat.isAmount ? `₹${stat.previous.toLocaleString()}` : stat.previous.toLocaleString()} previously
                  </Text>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Enhanced Charts Section with Dynamic Data */}
      <motion.div variants={itemVariants} className="space-y-6">
        {/* Revenue Trend Chart */}
        <Card shadow="sm" padding="lg" radius="md" className="mantine-card">
          <Group position="apart" className="mb-4">
            <Title order={3} className="flex items-center">
              <FaMoneyBillWave className="mr-2 text-green-500" /> 
              Revenue Trends
            </Title>
            <Badge color="green" variant="light">
              {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
            </Badge>
          </Group>
          <div className="h-80">
            {loading ? (
              <Center className="h-full">
                <Loader size="lg" />
              </Center>
            ) : (
              <Suspense fallback={<Loader />}>
                <Line 
                  data={revenueChartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                      tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                          label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.raw || 0;
                            if (label.includes('Revenue')) {
                              return `${label}: ₹${value.toLocaleString()}`;
                            }
                            return `${label}: ${value}`;
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function(value) {
                            return '₹' + value.toLocaleString();
                          }
                        }
                      }
                    }
                  }} 
                />
              </Suspense>
            )}
          </div>
        </Card>

        {/* Category Performance Chart */}
        <Card shadow="sm" padding="lg" radius="md" className="mantine-card">
          <Title order={3} className="mb-4 flex items-center">
            <MdCategory className="mr-2 text-purple-500" />
            Category Performance
          </Title>
          <div className="h-80">
            {loading ? (
              <Center className="h-full">
                <Loader size="lg" />
              </Center>
            ) : (
              <Suspense fallback={<Loader />}>
                <Bar 
                  data={categoryPerformanceData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          drawBorder: false,
                        },
                      },
                      x: {
                        grid: {
                          display: false,
                        },
                      },
                    },
                  }}
                />
              </Suspense>
            )}
          </div>
        </Card>

        {/* Print Request Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card shadow="sm" padding="lg" radius="md" className="mantine-card">
            <Title order={3} className="mb-4 flex items-center">
              <FaPrint className="mr-2 text-indigo-500" />
              Print Request Types
            </Title>
            <div className="h-80">
              {loading ? (
                <Center className="h-full">
                  <Loader size="lg" />
                </Center>
              ) : (
                <Suspense fallback={<Loader />}>
                  <Doughnut 
                    data={customPrintTypesData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                        },
                      },
                    }}
                  />
                </Suspense>
              )}
            </div>
          </Card>

          <Card shadow="sm" padding="lg" radius="md" className="mantine-card">
            <Title order={3} className="mb-4 flex items-center">
              <FaRocket className="mr-2 text-red-500" />
              Print Request Status
            </Title>
            <div className="h-80">
              {loading ? (
                <Center className="h-full">
                  <Loader size="lg" />
                </Center>
              ) : (
                <Suspense fallback={<Loader />}>
                  <Bar 
                    data={customPrintStatusChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            drawBorder: false,
                          },
                        },
                        x: {
                          grid: {
                            display: false,
                          },
                        },
                      },
                    }}
                  />
                </Suspense>
              )}
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Enquiry Analytics Section */}
      <motion.div variants={itemVariants} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Enquiry Status Chart */}
          <Card shadow="sm" padding="lg" radius="md" className="mantine-card">
            <Title order={3} className="mb-4 flex items-center">
              <RiQuestionnaireFill className="mr-2 text-cyan-500" />
              Enquiry Status Distribution
            </Title>
            <div className="h-80">
              {loading ? (
                <Center className="h-full">
                  <Loader size="lg" />
                </Center>
              ) : enquiryStatus && enquiryStatus.length > 0 ? (
                <Suspense fallback={<Loader />}>
                  <Doughnut 
                    data={{
                      labels: enquiryStatus.map(e => e.status || 'Unknown'),
                      datasets: [{
                        data: enquiryStatus.map(e => e.count || 0),
                        backgroundColor: [
                          'rgba(255, 193, 7, 0.8)',
                          'rgba(40, 167, 69, 0.8)',
                          'rgba(220, 53, 69, 0.8)',
                          'rgba(108, 117, 125, 0.8)'
                        ],
                        borderColor: [
                          'rgba(255, 193, 7, 1)',
                          'rgba(40, 167, 69, 1)',
                          'rgba(220, 53, 69, 1)',
                          'rgba(108, 117, 125, 1)'
                        ],
                        borderWidth: 2
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                        },
                      },
                    }}
                  />
                </Suspense>
              ) : (
                <Center className="h-full">
                  <Stack align="center" spacing="xs">
                    <RiQuestionnaireFill size={48} className="text-gray-300" />
                    <Text size="sm" color="dimmed" weight={500}>No Enquiry Data</Text>
                    <Text size="xs" color="dimmed" align="center">
                      No customer enquiries found for the selected timeframe. 
                      Enquiry analytics will appear here once customers start submitting enquiries.
                    </Text>
                  </Stack>
                </Center>
              )}
            </div>
          </Card>

          {/* Recent Enquiries List */}
          <Card shadow="sm" padding="lg" radius="md" className="mantine-card">
            <Title order={3} className="mb-4 flex items-center">
              <RiQuestionnaireFill className="mr-2 text-cyan-500" />
              Recent Enquiries
            </Title>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {loading ? (
                <Stack spacing="xs">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} height={60} />
                  ))}
                </Stack>
              ) : enquiryData && enquiryData.length > 0 ? (
                enquiryData.slice(0, 8).map((enquiry, index) => (
                  <Paper key={index} p="sm" className="border border-gray-200 hover:border-cyan-300 transition-colors">
                    <Group position="apart" className="mb-1">
                      <Text weight={500} size="sm">Enquiry #{enquiry.id}</Text>
                      <Badge 
                        color={enquiry.status === 'pending' ? 'yellow' : enquiry.status === 'resolved' ? 'green' : 'red'} 
                        variant="light" 
                        size="sm"
                      >
                        {enquiry.status || 'pending'}
                      </Badge>
                    </Group>
                    <Text size="xs" color="dimmed">
                      Type: {enquiry.enquiry_type || 'General'} • {new Date(enquiry.created_at).toLocaleDateString()}
                    </Text>
                  </Paper>
                ))
              ) : (
                <Center className="h-40">
                  <Stack align="center" spacing="xs">
                    <RiQuestionnaireFill size={48} className="text-gray-300" />
                    <Text size="sm" color="dimmed" weight={500}>No Recent Enquiries</Text>
                    <Text size="xs" color="dimmed" align="center">
                      No customer enquiries found for the selected timeframe.
                      Recent enquiries will appear here once customers start contacting you.
                    </Text>
                  </Stack>
                </Center>
              )}
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Dynamic Activity and Latest Data Section */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Latest Custom Print Requests */}
        <Card shadow="sm" padding="lg" radius="md" className="mantine-card">
          <Title order={3} className="mb-4 flex items-center">
            <FaPrint className="mr-2 text-green-500" /> 
            Latest Print Requests
          </Title>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="p-3 rounded-lg">
                  <Skeleton height={20} mb="xs" />
                  <Skeleton height={16} mb="xs" />
                  <Skeleton height={12} />
                </div>
              ))
            ) : latestCustomPrints && latestCustomPrints.length > 0 ? (
              latestCustomPrints.slice(0, 5).map((request) => (
                <div key={request.id} className="p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <Text weight={500} size="sm">{request.product_type || 'Custom Item'}</Text>
                    <Badge 
                      color={
                        request.status === 'completed' ? 'green' :
                        request.status === 'approved' ? 'blue' :
                        request.status === 'pending' ? 'yellow' :
                        request.status === 'in_progress' ? 'cyan' : 'red'
                      }
                      variant="light"
                      size="sm"
                    >
                      {request.status}
                    </Badge>
                  </div>
                  <Text size="xs" color="dimmed" className="mb-1">
                    Request ID: #{request.id}
                  </Text>
                  {request.estimated_price && (
                    <Text size="sm" weight={600} color="green">
                      ₹{request.estimated_price.toLocaleString()}
                    </Text>
                  )}
                  <Text size="xs" color="dimmed">
                    {new Date(request.created_at).toLocaleDateString()}
                  </Text>
                </div>
              ))
            ) : (
              <Center className="py-8">
                <Stack align="center" spacing="xs">
                  <FaPrint size={24} className="text-gray-400" />
                  <Text size="sm" color="dimmed">No print requests yet</Text>
                </Stack>
              </Center>
            )}
          </div>
        </Card>

        {/* Recent User Activity */}
        <Card shadow="sm" padding="lg" radius="md" className="mantine-card">
          <Title order={3} className="mb-4 flex items-center">
            <FaUsers className="mr-2 text-blue-500" /> 
            Recent User Activity
          </Title>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="flex items-start space-x-3 p-3">
                  <Skeleton height={32} circle />
                  <div className="flex-1">
                    <Skeleton height={16} mb="xs" />
                    <Skeleton height={12} />
                  </div>
                </div>
              ))
            ) : userActivity && userActivity.length > 0 ? (
              userActivity.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <Avatar 
                    src={activity.avatar} 
                    radius="xl" 
                    size="sm"
                    color="blue"
                  >
                    {activity.user?.charAt(0)?.toUpperCase() || 'U'}
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <Text size="sm" weight={500}>{activity.action}</Text>
                      <Text size="xs" color="dimmed">{activity.time}</Text>
                    </div>
                    <Text size="xs" color="dimmed" className="mb-1">
                      {activity.item}
                    </Text>
                    <Text size="xs" color="dimmed">
                      by {activity.user || 'Unknown User'}
                    </Text>
                  </div>
                </div>
              ))
            ) : (
              <Center className="py-8">
                <Stack align="center" spacing="xs">
                  <FaUsers size={24} className="text-gray-400" />
                  <Text size="sm" color="dimmed">No recent activity</Text>
                </Stack>
              </Center>
            )}
          </div>
        </Card>

        {/* Latest Users */}
        <Card shadow="sm" padding="lg" radius="md" className="mantine-card">
          <Title order={3} className="mb-4 flex items-center">
            <FaUserPlus className="mr-2 text-teal-500" /> 
            Recent Registrations
          </Title>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="flex items-center space-x-3 p-3">
                  <Skeleton height={32} circle />
                  <div className="flex-1">
                    <Skeleton height={16} mb="xs" />
                    <Skeleton height={12} />
                  </div>
                </div>
              ))
            ) : latestUsers && latestUsers.length > 0 ? (
              latestUsers.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                  <Avatar 
                    radius="xl" 
                    size="sm"
                    color="teal"
                  >
                    {user.displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                  </Avatar>
                  <div className="flex-1">
                    <Text size="sm" weight={500}>
                      {user.displayName || 'New User'}
                    </Text>
                    <Text size="xs" color="dimmed" className="mb-1">
                      {user.email}
                    </Text>
                    <Text size="xs" color="dimmed">
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </Text>
                  </div>
                </div>
              ))
            ) : (
              <Center className="py-8">
                <Stack align="center" spacing="xs">
                  <FaUserPlus size={24} className="text-gray-400" />
                  <Text size="sm" color="dimmed">No new users yet</Text>
                </Stack>
              </Center>
            )}
          </div>
        </Card>
      </motion.div>

      {/* System Overview & Quick Actions */}
      <motion.div variants={itemVariants}>
        <Card shadow="sm" padding="lg" radius="md" className="mantine-card">
          <Group position="apart" className="mb-4">
            <Title order={3} className="flex items-center">
              <MdDashboard className="mr-2 text-indigo-500" /> 
              System Overview & Quick Actions
            </Title>
            <Group>
              <Badge color="green" variant="light" leftSection={<FaCheckCircle size={12} />}>
                System Online
              </Badge>
            </Group>
          </Group>
          
          <SimpleGrid cols={4} breakpoints={[
            { maxWidth: 'md', cols: 2 },
            { maxWidth: 'sm', cols: 1 }
          ]}>
            <Paper p="md" className="text-center border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
              <ThemeIcon size="lg" color="blue" variant="light" className="mx-auto mb-2">
                <FaBoxOpen />
              </ThemeIcon>
              <Text size="sm" weight={500}>Products</Text>
              <Text size="xl" weight={700} color="blue">{stats.products || 0}</Text>
              <Text size="xs" color="dimmed">Total listed</Text>
            </Paper>
            
            <Paper p="md" className="text-center border border-gray-200 hover:border-green-300 transition-colors cursor-pointer">
              <ThemeIcon size="lg" color="green" variant="light" className="mx-auto mb-2">
                <FaPrint />
              </ThemeIcon>
              <Text size="sm" weight={500}>Print Orders</Text>
              <Text size="xl" weight={700} color="green">{stats.custom_prints || 0}</Text>
              <Text size="xs" color="dimmed">This {timeframe}</Text>
            </Paper>
            
            <Paper p="md" className="text-center border border-gray-200 hover:border-orange-300 transition-colors cursor-pointer">
              <ThemeIcon size="lg" color="orange" variant="light" className="mx-auto mb-2">
                <MdCategory />
              </ThemeIcon>
              <Text size="sm" weight={500}>Categories</Text>
              <Text size="xl" weight={700} color="orange">{stats.categories || 0}</Text>
              <Text size="xs" color="dimmed">Available</Text>
            </Paper>
            
            <Paper p="md" className="text-center border border-gray-200 hover:border-red-300 transition-colors cursor-pointer">
              <ThemeIcon size="lg" color="red" variant="light" className="mx-auto mb-2">
                <RiQuestionnaireFill />
              </ThemeIcon>
              <Text size="sm" weight={500}>Enquiries</Text>
              <Text size="xl" weight={700} color="red">{stats.enquiries || 0}</Text>
              <Text size="xs" color="dimmed">Pending</Text>
            </Paper>
          </SimpleGrid>
        </Card>
      </motion.div>
    </motion.div>
  );
}