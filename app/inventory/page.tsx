'use client'

import { useState, useEffect } from 'react';
import { Medicine } from '../../types';

export default function Inventory() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState<'salt' | 'brand'>('salt');
  const [newMedicine, setNewMedicine] = useState<Omit<Medicine, 'id'>>({
    saltName: '',
    brandName: '',
    actualPrice: 0,
    discountedPrice: 0,
    quantity: 0,
    unit: 'tablets',
    expiryDate: new Date().toISOString().split('T')[0],
    shelfNo: ''
  });

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/medicines');
      if (!response.ok) {
        throw new Error('Failed to fetch medicines');
      }
      const data = await response.json();
      setMedicines(data);
    } catch (error) {
      console.error('Error fetching medicines:', error);
      setError('Failed to load medicines. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMedicines = medicines.filter(medicine => {
    const searchLower = searchTerm.toLowerCase();
    if (searchBy === 'salt') {
      return medicine.saltName.toLowerCase().includes(searchLower);
    } else {
      return medicine.brandName.toLowerCase().includes(searchLower);
    }
  });

  // Group medicines by salt name for easy viewing
  const groupedMedicines = filteredMedicines.reduce((acc, medicine) => {
    if (!acc[medicine.saltName]) {
      acc[medicine.saltName] = [];
    }
    acc[medicine.saltName].push(medicine);
    return acc;
  }, {} as Record<string, Medicine[]>);

  const addMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/medicines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMedicine),
      });
      if (!response.ok) {
        throw new Error('Failed to add medicine');
      }
      const addedMedicine = await response.json();
      setMedicines([...medicines, addedMedicine]);
      setNewMedicine({
        saltName: '',
        brandName: '',
        actualPrice: 0,
        discountedPrice: 0,
        quantity: 0,
        unit: 'tablets',
        expiryDate: new Date().toISOString().split('T')[0],
        shelfNo: ''
      });
      alert('Medicine added successfully!');
    } catch (error) {
      console.error('Error adding medicine:', error);
      alert('Failed to add medicine');
    }
  };

  const updateMedicine = async (medicine: Medicine) => {
    try {
      const response = await fetch('/api/medicines', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(medicine),
      });
      if (!response.ok) {
        throw new Error('Failed to update medicine');
      }
      setMedicines(medicines.map(m => m.id === medicine.id ? medicine : m));
      alert('Medicine updated successfully!');
    } catch (error) {
      console.error('Error updating medicine:', error);
      alert('Failed to update medicine');
    }
  };

  if (isLoading) return <div className="container mx-auto p-4">Loading...</div>;
  if (error) return <div className="container mx-auto p-4 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Inventory Management</h1>
      
      {/* Add New Medicine Form */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Add New Medicine</h2>
        <form onSubmit={addMedicine} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Salt Name</label>
            <input
              type="text"
              value={newMedicine.saltName}
              onChange={(e) => setNewMedicine({...newMedicine, saltName: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Brand Name</label>
            <input
              type="text"
              value={newMedicine.brandName}
              onChange={(e) => setNewMedicine({...newMedicine, brandName: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Shelf Number</label>
            <input
              type="text"
              value={newMedicine.shelfNo}
              onChange={(e) => setNewMedicine({...newMedicine, shelfNo: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., A1, B2, C3"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Actual Price (PKR)</label>
            <input
              type="number"
              value={newMedicine.actualPrice}
              onChange={(e) => setNewMedicine({...newMedicine, actualPrice: parseFloat(e.target.value)})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Discounted Price (PKR)</label>
            <input
              type="number"
              value={newMedicine.discountedPrice}
              onChange={(e) => setNewMedicine({...newMedicine, discountedPrice: parseFloat(e.target.value)})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Quantity</label>
            <input
              type="number"
              value={newMedicine.quantity}
              onChange={(e) => setNewMedicine({...newMedicine, quantity: parseInt(e.target.value)})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Unit</label>
            <input
              type="text"
              value={newMedicine.unit}
              onChange={(e) => setNewMedicine({...newMedicine, unit: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
            <input
              type="date"
              value={newMedicine.expiryDate}
              onChange={(e) => setNewMedicine({...newMedicine, expiryDate: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Add Medicine
            </button>
          </div>
        </form>
      </div>

      {/* Search Section */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search medicines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Search by:</label>
            <select
              value={searchBy}
              onChange={(e) => setSearchBy(e.target.value as 'salt' | 'brand')}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="salt">Salt Name</option>
              <option value="brand">Brand Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Medicines List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salt Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shelf No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price (PKR)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(groupedMedicines).map(([saltName, medicines]) => (
                medicines.map((medicine, index) => (
                  <tr key={medicine.id} className={index === 0 ? 'bg-gray-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{medicine.saltName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{medicine.brandName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{medicine.shelfNo}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{medicine.discountedPrice.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">{medicine.actualPrice.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {medicine.quantity} {medicine.unit}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(medicine.expiryDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          const newPrice = prompt('Enter new discounted price:', medicine.discountedPrice.toString());
                          if (newPrice) {
                            const parsedPrice = parseFloat(newPrice);
                            if (isNaN(parsedPrice)) {
                              alert('Please enter a valid number for price');
                              return;
                            }
                            updateMedicine({ ...medicine, discountedPrice: parsedPrice });
                          }
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Update Price
                      </button>
                      <button
                        onClick={() => {
                          const newShelfNo = prompt('Enter new shelf number:', medicine.shelfNo);
                          if (newShelfNo) {
                            if (newShelfNo.trim() === '') {
                              alert('Shelf number cannot be empty');
                              return;
                            }
                            updateMedicine({ ...medicine, shelfNo: newShelfNo });
                          }
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Update Shelf
                      </button>
                    </td>
                  </tr>
                ))
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

