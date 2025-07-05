import { NextResponse } from 'next/server';
import { createBill } from '../../../lib/dbOperations';
import { Bill } from '../../../types';

export async function POST(request: Request) {
  try {
    const bill: Bill = await request.json();
    console.log('Received bill data:', bill); // Log received data

    // Validate bill data
    if (!bill.total || !bill.items || !Array.isArray(bill.items) || bill.items.length === 0) {
      return NextResponse.json(
        { error: 'Invalid bill data. Missing total, items, or empty items array.' },
        { status: 400 }
      );
    }

    // Create the bill
    const result = await createBill(bill);
    return NextResponse.json({ success: true, billId: result.billId });
  } catch (error: any) {
    console.error('Error creating bill:', error); // Log the error
    return NextResponse.json(
      { error: `Failed to create bill: ${error.message}` },
      { status: 500 }
    );
  }
}

