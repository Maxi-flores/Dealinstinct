'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Card, CardHeader, CardContent, Badge, StatusBadge, Button } from '@/components/ui';

// Mock dashboard data
const stats = [
  {
    title: 'Total Revenue',
    value: '€47,520',
    change: '+12.5%',
    trend: 'up',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'primary',
  },
  {
    title: 'Orders',
    value: '324',
    change: '+8.2%',
    trend: 'up',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
    color: 'accent',
  },
  {
    title: 'Customers',
    value: '1,247',
    change: '+5.1%',
    trend: 'up',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    color: 'green',
  },
  {
    title: 'Products',
    value: '89',
    change: '-2 low stock',
    trend: 'warning',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    color: 'yellow',
  },
];

const recentOrders = [
  { id: 'ORD-001', customer: 'John Doe', total: 299.99, status: 'pending', date: '2 min ago' },
  { id: 'ORD-002', customer: 'Jane Smith', total: 549.00, status: 'paid', date: '15 min ago' },
  { id: 'ORD-003', customer: 'Mike Johnson', total: 89.00, status: 'shipped', date: '1 hour ago' },
  { id: 'ORD-004', customer: 'Sarah Wilson', total: 199.99, status: 'delivered', date: '3 hours ago' },
  { id: 'ORD-005', customer: 'Tom Brown', total: 449.00, status: 'paid', date: '5 hours ago' },
];

const stockAlerts = [
  { id: '1', product: 'Premium Wireless Headphones', sku: 'PROD-001', stock: 3, status: 'low_stock' },
  { id: '2', product: 'Smart Watch Pro', sku: 'PROD-002', stock: 0, status: 'out_of_stock' },
  { id: '3', product: 'Designer Backpack', sku: 'PROD-003', stock: 5, status: 'low_stock' },
];

const topProducts = [
  { name: 'Premium Wireless Headphones', sales: 45, revenue: 13499.55 },
  { name: 'Smart Watch Pro', sales: 32, revenue: 14368.00 },
  { name: 'Ceramic Coffee Set', sales: 28, revenue: 2492.00 },
  { name: 'Designer Backpack', sales: 24, revenue: 3096.00 },
];

const colorMap: Record<string, string> = {
  primary: 'bg-primary-500',
  accent: 'bg-accent-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4 },
  }),
};

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
            Dashboard
          </h1>
          <p className="text-surface-500 dark:text-surface-400">
            Welcome back! Here&apos;s what&apos;s happening with your store.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </Button>
          <Button>
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            custom={index}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-surface-500 dark:text-surface-400">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-surface-900 dark:text-surface-100 mt-1">
                    {stat.value}
                  </p>
                  <p className={`text-sm mt-1 ${
                    stat.trend === 'up' ? 'text-green-600' :
                    stat.trend === 'warning' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${colorMap[stat.color]} bg-opacity-10`}>
                  <span className={`${colorMap[stat.color].replace('bg-', 'text-')}`}>
                    {stat.icon}
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader
              title="Recent Orders"
              subtitle="Latest customer orders"
              action={
                <Link href="/admin/orders">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              }
            />
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-surface-200 dark:border-surface-700">
                      <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider py-3">Order</th>
                      <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider py-3">Customer</th>
                      <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider py-3">Total</th>
                      <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider py-3">Status</th>
                      <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50">
                        <td className="py-3">
                          <span className="font-medium text-surface-900 dark:text-surface-100">
                            {order.id}
                          </span>
                        </td>
                        <td className="py-3 text-surface-600 dark:text-surface-400">
                          {order.customer}
                        </td>
                        <td className="py-3 font-medium text-surface-900 dark:text-surface-100">
                          €{order.total.toFixed(2)}
                        </td>
                        <td className="py-3">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="py-3 text-sm text-surface-500 dark:text-surface-400">
                          {order.date}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stock Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader
              title="Stock Alerts"
              subtitle="Items needing attention"
              action={
                <Link href="/admin/inventory/alerts">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              }
            />
            <CardContent>
              <div className="space-y-4">
                {stockAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-surface-50 dark:bg-surface-800/50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-surface-900 dark:text-surface-100 truncate">
                        {alert.product}
                      </p>
                      <p className="text-xs text-surface-500 dark:text-surface-400">
                        SKU: {alert.sku}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
                        {alert.stock} left
                      </span>
                      <StatusBadge status={alert.status} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader
              title="Top Products"
              subtitle="Best selling items this month"
            />
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center gap-4">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-100 dark:bg-surface-700 text-sm font-medium text-surface-600 dark:text-surface-400">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-surface-900 dark:text-surface-100 truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-surface-500 dark:text-surface-400">
                        {product.sales} sales
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-surface-900 dark:text-surface-100">
                      €{product.revenue.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader
              title="Quick Actions"
              subtitle="Common tasks"
            />
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/admin/products/new">
                  <Button variant="outline" fullWidth className="h-auto py-4 flex-col gap-2">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Product
                  </Button>
                </Link>
                <Link href="/admin/inventory">
                  <Button variant="outline" fullWidth className="h-auto py-4 flex-col gap-2">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Update Stock
                  </Button>
                </Link>
                <Link href="/admin/orders">
                  <Button variant="outline" fullWidth className="h-auto py-4 flex-col gap-2">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Process Orders
                  </Button>
                </Link>
                <Link href="/admin/display">
                  <Button variant="outline" fullWidth className="h-auto py-4 flex-col gap-2">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                    Edit Display
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
