'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Input,
  Badge,
  StatusBadge,
  Modal,
  ModalFooter,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from '@/components/ui';
import type { InventoryItem } from '@/lib/types';

// Mock inventory data
const inventoryItems: (InventoryItem & { productName: string; productImage?: string })[] = [
  {
    productId: '1',
    productName: 'Premium Wireless Headphones',
    sku: 'PROD-001',
    quantity: 45,
    reservedQuantity: 5,
    availableQuantity: 40,
    lowStockThreshold: 10,
    location: 'Warehouse A',
    updatedAt: new Date().toISOString(),
  },
  {
    productId: '2',
    productName: 'Smart Watch Pro',
    sku: 'PROD-002',
    quantity: 3,
    reservedQuantity: 1,
    availableQuantity: 2,
    lowStockThreshold: 10,
    location: 'Warehouse A',
    updatedAt: new Date().toISOString(),
  },
  {
    productId: '3',
    productName: 'Designer Backpack',
    sku: 'PROD-003',
    quantity: 0,
    reservedQuantity: 0,
    availableQuantity: 0,
    lowStockThreshold: 5,
    location: 'Warehouse B',
    updatedAt: new Date().toISOString(),
  },
  {
    productId: '4',
    productName: 'Ceramic Coffee Set',
    sku: 'PROD-004',
    quantity: 120,
    reservedQuantity: 8,
    availableQuantity: 112,
    lowStockThreshold: 20,
    location: 'Warehouse A',
    updatedAt: new Date().toISOString(),
  },
  {
    productId: '5',
    productName: 'Minimalist Desk Lamp',
    sku: 'PROD-005',
    quantity: 67,
    reservedQuantity: 3,
    availableQuantity: 64,
    lowStockThreshold: 15,
    location: 'Warehouse B',
    updatedAt: new Date().toISOString(),
  },
  {
    productId: '6',
    productName: 'Leather Wallet',
    sku: 'PROD-006',
    quantity: 8,
    reservedQuantity: 2,
    availableQuantity: 6,
    lowStockThreshold: 10,
    location: 'Warehouse A',
    updatedAt: new Date().toISOString(),
  },
];

const stats = [
  { label: 'Total SKUs', value: inventoryItems.length },
  { label: 'Low Stock', value: inventoryItems.filter(i => i.availableQuantity <= i.lowStockThreshold && i.availableQuantity > 0).length },
  { label: 'Out of Stock', value: inventoryItems.filter(i => i.availableQuantity === 0).length },
  { label: 'Total Units', value: inventoryItems.reduce((sum, i) => sum + i.quantity, 0) },
];

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'low' | 'out'>('all');
  const [selectedItem, setSelectedItem] = useState<typeof inventoryItems[0] | null>(null);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustQuantity, setAdjustQuantity] = useState('');
  const [adjustReason, setAdjustReason] = useState('');

  // Filter inventory
  const filteredInventory = inventoryItems.filter((item) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !item.productName.toLowerCase().includes(query) &&
        !item.sku.toLowerCase().includes(query)
      ) {
        return false;
      }
    }

    // Status filter
    if (filterStatus === 'low' && (item.availableQuantity > item.lowStockThreshold || item.availableQuantity === 0)) {
      return false;
    }
    if (filterStatus === 'out' && item.availableQuantity !== 0) {
      return false;
    }

    return true;
  });

  const getStockStatus = (item: typeof inventoryItems[0]) => {
    if (item.availableQuantity === 0) return 'out_of_stock';
    if (item.availableQuantity <= item.lowStockThreshold) return 'low_stock';
    return 'in_stock';
  };

  const handleAdjustStock = () => {
    console.log('Adjusting stock:', {
      item: selectedItem,
      quantity: adjustQuantity,
      reason: adjustReason,
    });
    setIsAdjustModalOpen(false);
    setSelectedItem(null);
    setAdjustQuantity('');
    setAdjustReason('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
            Inventory Management
          </h1>
          <p className="text-surface-500 dark:text-surface-400">
            Track and manage your product stock levels
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Import
          </Button>
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
            Bulk Restock
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} padding="sm">
            <p className="text-sm text-surface-500 dark:text-surface-400">{stat.label}</p>
            <p className="text-2xl font-bold text-surface-900 dark:text-surface-100">{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by product name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-surface-500">Filter:</span>
            <div className="flex gap-1">
              {[
                { value: 'all', label: 'All' },
                { value: 'low', label: 'Low Stock' },
                { value: 'out', label: 'Out of Stock' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilterStatus(option.value as typeof filterStatus)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    filterStatus === option.value
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                      : 'text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Inventory Table */}
      <Card padding="none">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Product</TableHeaderCell>
              <TableHeaderCell>SKU</TableHeaderCell>
              <TableHeaderCell>Available</TableHeaderCell>
              <TableHeaderCell>Reserved</TableHeaderCell>
              <TableHeaderCell>Total</TableHeaderCell>
              <TableHeaderCell>Threshold</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Location</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredInventory.map((item) => (
              <TableRow key={item.productId}>
                <TableCell>
                  <span className="font-medium text-surface-900 dark:text-surface-100">
                    {item.productName}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-surface-500 dark:text-surface-400 font-mono text-sm">
                    {item.sku}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`font-semibold ${
                    item.availableQuantity === 0 ? 'text-red-600' :
                    item.availableQuantity <= item.lowStockThreshold ? 'text-yellow-600' : 'text-surface-900 dark:text-surface-100'
                  }`}>
                    {item.availableQuantity}
                  </span>
                </TableCell>
                <TableCell>{item.reservedQuantity}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.lowStockThreshold}</TableCell>
                <TableCell>
                  <StatusBadge status={getStockStatus(item)} />
                </TableCell>
                <TableCell>
                  <span className="text-sm text-surface-500">{item.location}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setIsAdjustModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-surface-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                      title="Adjust Stock"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      className="p-1.5 rounded-lg text-surface-500 hover:text-surface-700 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                      title="View History"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Adjust Stock Modal */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => {
          setIsAdjustModalOpen(false);
          setSelectedItem(null);
          setAdjustQuantity('');
          setAdjustReason('');
        }}
        title="Adjust Stock"
        description={selectedItem ? `Adjust stock for ${selectedItem.productName}` : ''}
      >
        <div className="space-y-4">
          <div className="p-4 bg-surface-50 dark:bg-surface-800 rounded-lg">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-surface-500">Current Stock</span>
              <span className="font-semibold">{selectedItem?.quantity}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-surface-500">Reserved</span>
              <span className="font-semibold">{selectedItem?.reservedQuantity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-surface-500">Available</span>
              <span className="font-semibold">{selectedItem?.availableQuantity}</span>
            </div>
          </div>

          <Input
            label="Quantity Change"
            type="number"
            placeholder="e.g., +10 or -5"
            value={adjustQuantity}
            onChange={(e) => setAdjustQuantity(e.target.value)}
            hint="Use positive number to add, negative to subtract"
          />

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Reason
            </label>
            <select
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">Select a reason...</option>
              <option value="restock">Restock / Delivery</option>
              <option value="return">Customer Return</option>
              <option value="damage">Damaged / Lost</option>
              <option value="adjustment">Inventory Adjustment</option>
              <option value="transfer">Warehouse Transfer</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <ModalFooter>
          <Button variant="outline" onClick={() => setIsAdjustModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdjustStock} disabled={!adjustQuantity || !adjustReason}>
            Update Stock
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
