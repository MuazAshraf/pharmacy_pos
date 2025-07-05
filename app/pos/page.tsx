'use client'

import { useState, useEffect } from 'react';
import { Medicine, CartItem, Bill } from '../../types';
import BillReceipt from '../../components/BillReceipt';

export default function POS() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [searchBy, setSearchBy] = useState<'salt' | 'brand'>('salt');
  const [error, setError] = useState<string | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [currentBill, setCurrentBill] = useState<(Bill & { id: number }) | null>(null);
  const [billNumber, setBillNumber] = useState('');

  useEffect(() => {
    fetchMedicines();
  }, []);

  useEffect(() => {
    setFilteredMedicines(
      medicines.filter(medicine => {
        const searchLower = search.toLowerCase();
        if (searchBy === 'salt') {
          return medicine.saltName.toLowerCase().startsWith(searchLower);
        } else {
          return medicine.brandName.toLowerCase().startsWith(searchLower);
        }
      })
    );
  }, [medicines, search, searchBy]);

  useEffect(() => {
    setTotal(cart.reduce((sum, item) => sum + item.discountedPrice * item.billQuantity, 0));
  }, [cart]);

  const fetchMedicines = async () => {
    try {
      const response = await fetch('/api/medicines');
      if (!response.ok) {
        throw new Error('Failed to fetch medicines');
      }
      const data = await response.json();
      console.log('Fetched medicines:', data);
      setMedicines(data);
    } catch (error) {
      console.error('Error fetching medicines:', error);
      setError('Failed to load medicines. Please try again later.');
    }
  };

  const addToCart = (medicine: Medicine) => {
    if (medicine.quantity === 0) {
      alert('This medicine is out of stock');
      return;
    }
    const existingItem = cart.find(item => item.id === medicine.id);
    if (existingItem) {
      if (existingItem.billQuantity >= medicine.quantity) {
        alert('Cannot add more than available stock');
        return;
      }
      setCart(cart.map(item => 
        item.id === medicine.id 
          ? { ...item, billQuantity: item.billQuantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...medicine, billQuantity: 1 }]);
    }
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const createBill = async () => {
    try {
      const bill: Bill = {
        items: cart,
        total,
        createdAt: new Date(),
      };
      const response = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bill),
      });
      if (!response.ok) {
        throw new Error('Failed to create bill');
      }
      
      const result = await response.json();
      
      // Generate bill number (you can customize this format)
      const billNum = `${result.billId.toString().padStart(6, '0')}`;
      setBillNumber(billNum);
      
      // Set current bill for receipt
      setCurrentBill({
        ...bill,
        id: result.billId
      });
      
      // Show receipt
      setShowReceipt(true);
      
      // Clear cart and refresh medicines
      setCart([]);
      fetchMedicines();  // Refresh medicines to update stock
    } catch (error) {
      console.error('Error creating bill:', error);
      alert('Failed to create bill. Please try again.');
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('bill-receipt');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        // Get the absolute URL for the logo
        const logoUrl = `${window.location.origin}/muaz_logo.png`;
        
        printWindow.document.write(`
          <html>
            <head>
              <title>Bill Receipt</title>
              <style>
                * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                }
                
                body { 
                  font-family: 'Courier New', monospace; 
                  font-size: 12px;
                  margin: 0; 
                  padding: 20px;
                  line-height: 1.4;
                }
                
                .receipt-content { 
                  max-width: 300px; 
                  margin: 0 auto;
                }
                
                .text-center { text-align: center; }
                .text-left { text-align: left; }
                .text-right { text-align: right; }
                .font-bold { font-weight: bold; }
                .font-medium { font-weight: 500; }
                .text-xl { font-size: 18px; }
                .text-sm { font-size: 11px; }
                .text-xs { font-size: 10px; }
                .text-gray-600 { color: #6b7280; }
                .text-gray-500 { color: #9ca3af; }
                
                .border-b { border-bottom: 1px solid #000; }
                .border-t { border-top: 1px solid #000; }
                .pb-4 { padding-bottom: 16px; }
                .pt-2 { padding-top: 8px; }
                .pt-4 { padding-top: 16px; }
                .mb-1 { margin-bottom: 4px; }
                .mb-2 { margin-bottom: 8px; }
                .mb-3 { margin-bottom: 12px; }
                .mb-4 { margin-bottom: 16px; }
                .mt-2 { margin-top: 8px; }
                .mt-3 { margin-top: 12px; }
                .ml-6 { margin-left: 24px; }
                .py-2 { padding-top: 8px; padding-bottom: 8px; }
                
                .grid { display: table; width: 100%; }
                .grid-cols-12 { table-layout: fixed; }
                .col-span-1 { display: table-cell; width: 8.33%; }
                .col-span-2 { display: table-cell; width: 16.66%; }
                .col-span-3 { display: table-cell; width: 25%; }
                .col-span-5 { display: table-cell; width: 41.66%; }
                .gap-1 { border-spacing: 2px; }
                
                .flex { display: flex; }
                .justify-between { justify-content: space-between; }
                .items-center { align-items: center; }
                
                img {
                  max-width: 50px;
                  max-height: 50px;
                  display: block;
                  margin: 0 auto 8px auto;
                }
                
                .border {
                  border: 1px solid #000;
                  padding: 8px;
                  display: inline-block;
                  margin: 0 auto;
                }
                
                .font-mono { font-family: 'Courier New', monospace; }
                
                @media print {
                  body { 
                    margin: 0; 
                    padding: 10px;
                    font-size: 11px;
                  }
                  .receipt-content { max-width: none; }
                }
              </style>
            </head>
            <body>
              ${printContent.innerHTML.replace(
                /src="[^"]*"/g, 
                `src="${logoUrl}"`
              )}
            </body>
          </html>
        `);
        printWindow.document.close();
        
        // Wait for images to load before printing
        const images = printWindow.document.querySelectorAll('img');
        let imagesLoaded = 0;
        const totalImages = images.length;
        
        if (totalImages === 0) {
          printWindow.print();
        } else {
          images.forEach(img => {
            if (img.complete) {
              imagesLoaded++;
              if (imagesLoaded === totalImages) {
                setTimeout(() => printWindow.print(), 100);
              }
            } else {
              img.onload = () => {
                imagesLoaded++;
                if (imagesLoaded === totalImages) {
                  setTimeout(() => printWindow.print(), 100);
                }
              };
              img.onerror = () => {
                imagesLoaded++;
                if (imagesLoaded === totalImages) {
                  setTimeout(() => printWindow.print(), 100);
                }
              };
            }
          });
        }
      }
    }
  };

  const handleCloseReceipt = () => {
    setShowReceipt(false);
    setCurrentBill(null);
    setBillNumber('');
  };

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Clinic POS</h1>
      
      {/* Search Section */}
      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Search medicines..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 p-2 border rounded"
        />
        <select
          value={searchBy}
          onChange={(e) => setSearchBy(e.target.value as 'salt' | 'brand')}
          className="p-2 border rounded"
        >
          <option value="salt">Search by Salt Name</option>
          <option value="brand">Search by Brand Name</option>
        </select>
      </div>

      <div className="flex gap-4">
        {/* Medicines List */}
        <div className="w-2/3">
          <h2 className="text-xl font-semibold mb-2">Medicines</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMedicines.map(medicine => (
              <div key={medicine.id} className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="mb-2">
                  <h3 className="font-medium">{medicine.brandName}</h3>
                  <p className="text-sm text-gray-600">{medicine.saltName}</p>
                  <p className="text-xs text-gray-500">Shelf: {medicine.shelfNo}</p>
                </div>
                <div className="text-sm">
                  <p>Price: {medicine.discountedPrice.toFixed(2)} PKR</p>
                  <p>Stock: {medicine.quantity} {medicine.unit}</p>
                  <p>Expires: {new Date(medicine.expiryDate).toLocaleDateString()}</p>
                </div>
                <button 
                  onClick={() => addToCart(medicine)}
                  className={`w-full mt-2 px-4 py-2 rounded text-white ${
                    medicine.quantity === 0 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : medicine.quantity <= 5
                      ? 'bg-yellow-500 hover:bg-yellow-600'
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                  disabled={medicine.quantity === 0}
                >
                  {medicine.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Cart */}
        <div className="w-1/3">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-xl font-semibold mb-4">Cart</h2>
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-start border-b pb-2">
                  <div>
                    <p className="font-medium">{item.brandName}</p>
                    <p className="text-sm text-gray-600">{item.saltName}</p>
                    <p className="text-sm">
                      {item.billQuantity} x {item.discountedPrice.toFixed(2)} PKR
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-4">
                      {(item.discountedPrice * item.billQuantity).toFixed(2)} PKR
                    </span>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <div className="text-xl font-bold mb-4">
                Total: {total.toFixed(2)} PKR
              </div>
              <button 
                onClick={createBill}
                className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
                disabled={cart.length === 0}
              >
                Create and Print Bill
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bill Receipt Modal */}
      {showReceipt && currentBill && (
        <BillReceipt
          bill={currentBill}
          billNumber={billNumber}
          onPrint={handlePrint}
          onClose={handleCloseReceipt}
        />
      )}
    </div>
  );
}

