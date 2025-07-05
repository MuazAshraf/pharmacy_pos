import React from 'react';
import Image from 'next/image';
import { Bill, CartItem } from '../types';

interface BillReceiptProps {
  bill: Bill & { id: number };
  billNumber: string;
  onPrint: () => void;
  onClose: () => void;
}

export default function BillReceipt({ bill, billNumber, onPrint, onClose }: BillReceiptProps) {
  const currentDate = new Date();
  const dateString = currentDate.toLocaleDateString('en-GB');
  const timeString = currentDate.toLocaleTimeString('en-GB');
  
  const totalQuantity = bill.items.reduce((sum, item) => sum + item.billQuantity, 0);
  const subtotal = bill.total;
  const salesTax = 0.00; // Medicines typically have 0% GST
  const serviceFee = 1.00;
  const finalTotal = subtotal + serviceFee;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-auto">
        <div className="receipt-content" id="bill-receipt">
          {/* Header */}
          <div className="text-center border-b pb-4 mb-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="relative w-12 h-12 flex-shrink-0">
                <Image
                  src="/muaz_logo.png"
                  alt="Ashraf's Pharmacy Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <h1 className="text-xl font-bold">ASHRAF'S PHARMACY</h1>
            </div>
            <div className="text-xs text-gray-600 mt-2">
              <p>Medical Center - AMP</p>
              <p>45-Main Block Medical Town</p>
              <p>CELL # 0309-4440597</p>
              <p>LICENSE # 05-352-0064-069384P</p>
            </div>
          </div>

          {/* Bill Details */}
          <div className="text-xs mb-4">
            <div className="flex justify-between mb-1">
              <span>Invoice #: {billNumber}</span>
              <span>POS No.: 138305</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>Cashier: MUAZ ASHRAF</span>
              <span>{dateString} {timeString}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>Mode of Payment: CASH</span>
            </div>
            <div className="flex justify-between">
              <span>Customer: WALK-IN CUSTOMER</span>
            </div>
          </div>

          {/* Items Header */}
          <div className="border-t border-b py-2 mb-2">
            <div className="text-xs font-semibold grid grid-cols-12 gap-1">
              <span className="col-span-1">#</span>
              <span className="col-span-5">Description</span>
              <span className="col-span-2">Price</span>
              <span className="col-span-1">Qty</span>
              <span className="col-span-3 text-right">Total</span>
            </div>
          </div>

          {/* Items List */}
          <div className="mb-4">
            {bill.items.map((item, index) => (
              <div key={item.id} className="mb-3">
                <div className="text-xs grid grid-cols-12 gap-1">
                  <span className="col-span-1">{index + 1}</span>
                  <span className="col-span-5 font-medium">
                    {item.brandName}
                    <br />
                    <span className="text-gray-600">({item.saltName})</span>
                  </span>
                  <span className="col-span-2">{item.discountedPrice.toFixed(2)}</span>
                  <span className="col-span-1">{item.billQuantity}</span>
                  <span className="col-span-3 text-right">
                    {(item.discountedPrice * item.billQuantity).toFixed(2)}
                  </span>
                </div>
                <div className="text-xs text-gray-500 ml-6">
                  {item.discountedPrice.toFixed(2)} × {item.billQuantity} = {(item.discountedPrice * item.billQuantity).toFixed(2)} (0% GST)
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="border-t pt-2 mb-4">
            <div className="text-xs">
              <div className="flex justify-between mb-1">
                <span>Total Qty: {totalQuantity}</span>
                <span>Total Amount: {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span></span>
                <span>Sales Tax: {salesTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span></span>
                <span>POS Service Fee: {serviceFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm border-t pt-1">
                <span>Payable:</span>
                <span>{finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-xs text-gray-600 text-center border-t pt-2">
            <p>Opened Tablets, Syrups, Injections, Liquids Are Not Refundable</p>
            <p>Return Medicine Within 15 days With Bill</p>
            <p>Return Fragile Items in 1/2 Hr With Proper Storage & Packing</p>
            <p className="mt-2 text-center">FBR Invoice #:</p>
            <p className="font-mono">{billNumber}250706017420086</p>
            
            <div className="mt-3 text-center">
              <div className="border border-gray-400 p-2 inline-block">
                <div className="text-lg font-bold">QR</div>
                <div className="text-xs">POS</div>
              </div>
            </div>
            
            <p className="mt-2 text-xs">
              Verify this invoice through FBR TaxAsaan MobileApp or<br />
              SMS at 9966 and win exciting prizes in draw
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-6 pt-4 border-t">
          <button
            onClick={onPrint}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Print Receipt
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 