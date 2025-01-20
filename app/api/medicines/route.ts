import { NextResponse } from 'next/server';
import { getMedicines, updateMedicine, addMedicine } from '../../../lib/dbOperations';
import { Medicine } from '../../../types';

export async function GET() {
  try {
    const medicines = await getMedicines();
    console.log('Medicines fetched:', medicines); // Add this line
    return NextResponse.json(medicines);
  } catch (error) {
    console.error('Failed to fetch medicines:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const medicine: Medicine = await request.json();
    await updateMedicine(medicine);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update medicine:', error);
    return NextResponse.json({ error: 'Failed to update medicine' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const medicine: Omit<Medicine, 'id'> = await request.json();
    const newMedicine = await addMedicine(medicine);
    return NextResponse.json(newMedicine);
  } catch (error) {
    console.error('Failed to add medicine:', error);
    return NextResponse.json({ error: 'Failed to add medicine' }, { status: 500 });
  }
}

