import pool from './db';
import { Medicine, Bill, User } from '../types';

export async function getMedicines() {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM medicines');
    const medicines = (rows as any[]).map(row => ({
      ...row,
      actualPrice: parseFloat(row.actualPrice),
      discountedPrice: parseFloat(row.discountedPrice),
      quantity: parseInt(row.quantity)
    }));
    console.log('Fetched medicines from DB:', medicines);
    return medicines as Medicine[];
  } catch (error: any) {
    console.error('Database error in getMedicines:', error);
    throw new Error(`Failed to fetch medicines: ${error.message}`);
  } finally {
    if (connection) connection.release();
  }
}

export async function updateMedicine(medicine: Medicine) {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Get current quantity
    const [currentRows] = await connection.query(
      'SELECT quantity FROM medicines WHERE id = ?',
      [medicine.id]
    ) as [any[], any];
    
    const currentQuantity = currentRows[0]?.quantity || 0;
    const quantityDiff = medicine.quantity - currentQuantity;

    // If quantity increased, record as purchase
    if (quantityDiff > 0) {
      await connection.query(
        'INSERT INTO purchases (medicineId, quantity, price, purchaseDate) VALUES (?, ?, ?, ?)',
        [medicine.id, quantityDiff, medicine.actualPrice, new Date()]
      );
    }

    const formattedDate = medicine.expiryDate.split('T')[0];
    await connection.query(
      'UPDATE medicines SET saltName = ?, brandName = ?, actualPrice = ?, discountedPrice = ?, quantity = ?, unit = ?, expiryDate = ?, shelfNo = ? WHERE id = ?',
      [medicine.saltName, medicine.brandName, medicine.actualPrice, medicine.discountedPrice, medicine.quantity, medicine.unit, formattedDate, medicine.shelfNo, medicine.id]
    );

    await connection.commit();
  } catch (error: any) {
    if (connection) await connection.rollback();
    console.error('Database error in updateMedicine:', error);
    throw new Error(`Failed to update medicine: ${error.message}`);
  } finally {
    if (connection) connection.release();
  }
}

export async function addMedicine(medicine: Omit<Medicine, 'id'>) {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const formattedDate = medicine.expiryDate.split('T')[0];
    // Insert medicine
    const [result] = await connection.query(
      'INSERT INTO medicines (saltName, brandName, actualPrice, discountedPrice, quantity, unit, expiryDate, shelfNo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [medicine.saltName, medicine.brandName, medicine.actualPrice, medicine.discountedPrice, medicine.quantity, medicine.unit, formattedDate, medicine.shelfNo]
    );
    const medicineId = (result as any).insertId;

    // Record purchase
    await connection.query(
      'INSERT INTO purchases (medicineId, quantity, price, purchaseDate) VALUES (?, ?, ?, ?)',
      [medicineId, medicine.quantity, medicine.actualPrice, new Date()]
    );

    await connection.commit();
    return { id: medicineId, ...medicine };
  } catch (error: any) {
    if (connection) await connection.rollback();
    console.error('Database error in addMedicine:', error);
    throw new Error(`Failed to add medicine: ${error.message}`);
  } finally {
    if (connection) connection.release();
  }
}

export async function createBill(bill: Bill) {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Insert the bill
    const [result] = await connection.query(
      'INSERT INTO bills (total, createdAt) VALUES (?, ?)',
      [bill.total, new Date()]
    );
    const billId = (result as any).insertId;

    // Insert bill items and update inventory
    for (const item of bill.items) {
      // Check if we have enough stock
      const [rows] = await connection.query(
        'SELECT quantity FROM medicines WHERE id = ?',
        [item.id]
      ) as [any[], any];
      
      const stockResult = rows[0];
      if (!stockResult || stockResult.quantity < item.billQuantity) {
        throw new Error(`Insufficient stock for medicine ID ${item.id}`);
      }

      // Insert bill item
      await connection.query(
        'INSERT INTO bill_items (billId, medicineId, quantity, price) VALUES (?, ?, ?, ?)',
        [billId, item.id, item.billQuantity, item.discountedPrice]
      );

      // Automatically update medicine quantity
      const newQuantity = stockResult.quantity - item.billQuantity;
      await connection.query(
        'UPDATE medicines SET quantity = ? WHERE id = ?',
        [newQuantity, item.id]
      );
    }

    await connection.commit();
    return { success: true, billId };
  } catch (error: any) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error in createBill:', error);
    throw new Error(`Failed to create bill: ${error.message}`);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

export async function createUser(user: { username: string; password: string }) {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [user.username, user.password]
    );
    return (result as any).insertId;
  } finally {
    connection.release();
  }
}

export async function getUser(username: string) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query('SELECT * FROM users WHERE username = ?', [username]);
    return (rows as any[])[0];
  } finally {
    connection.release();
  }
}

export async function getSalesReport(startDate: string, endDate: string) {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.query(`
    SELECT 
      m.saltName,
      m.brandName,
      m.shelfNo,
      SUM(bi.quantity) as totalQuantity, 
      SUM(bi.quantity * bi.price) as totalSales,
      m.unit,
      DATE(b.createdAt) as saleDate
    FROM bill_items bi
    JOIN medicines m ON bi.medicineId = m.id
    JOIN bills b ON bi.billId = b.id
    WHERE b.createdAt BETWEEN ? AND ?
    GROUP BY m.id, m.saltName, m.brandName, m.shelfNo, m.unit, DATE(b.createdAt)
    ORDER BY saleDate DESC, totalSales DESC
    `, [startDate, endDate]);

    return {
      success: true,
      data: rows,
      summary: {
        totalSales: (rows as any[]).reduce((sum, row) => sum + row.totalSales, 0),
        totalItems: (rows as any[]).reduce((sum, row) => sum + row.totalQuantity, 0),
        uniqueMedicines: (rows as any[]).length
      }
    };
  } catch (error: any) {
    console.error('Error generating sales report:', error);
    throw new Error(`Failed to generate report: ${error.message}`);
  } finally {
    if (connection) connection.release();
  }
}

export async function getReport(startDate: string, endDate: string) {
  let connection;
  try {
    connection = await pool.getConnection();
    
    // Get sales data
    const [salesRows] = await connection.query(`
    SELECT 
      m.saltName,
      m.brandName,
      m.shelfNo,
      SUM(bi.quantity) as totalQuantity, 
      SUM(bi.quantity * bi.price) as totalSales,
      m.unit,
      DATE(b.createdAt) as saleDate
    FROM bill_items bi
    JOIN medicines m ON bi.medicineId = m.id
    JOIN bills b ON bi.billId = b.id
    WHERE b.createdAt BETWEEN ? AND ?
    GROUP BY m.id, m.saltName, m.brandName, m.shelfNo, m.unit, DATE(b.createdAt)
    ORDER BY saleDate DESC, totalSales DESC
    `, [startDate, endDate]);

    // Get purchase data
    const [purchaseRows] = await connection.query(`
    SELECT 
      m.saltName,
      m.brandName,
      m.shelfNo,
      p.quantity as purchaseQuantity,
      p.price as purchasePrice,
      m.unit,
      DATE(p.purchaseDate) as purchaseDate,
      (p.quantity * p.price) as totalCost
    FROM purchases p
    JOIN medicines m ON p.medicineId = m.id
    WHERE p.purchaseDate BETWEEN ? AND ?
    ORDER BY p.purchaseDate DESC
    `, [startDate, endDate]);

    // Parse numeric values
    const parsedSalesRows = (salesRows as any[]).map(row => ({
      ...row,
      totalQuantity: parseInt(row.totalQuantity),
      totalSales: parseFloat(row.totalSales)
    }));

    const parsedPurchaseRows = (purchaseRows as any[]).map(row => ({
      ...row,
      purchaseQuantity: parseInt(row.purchaseQuantity),
      purchasePrice: parseFloat(row.purchasePrice),
      totalCost: parseFloat(row.totalCost)
    }));

    return {
      success: true,
      sales: {
        data: parsedSalesRows,
        summary: {
          totalSales: parsedSalesRows.reduce((sum, row) => sum + (row.totalSales || 0), 0),
          totalItems: parsedSalesRows.reduce((sum, row) => sum + (row.totalQuantity || 0), 0),
          uniqueMedicines: parsedSalesRows.length
        }
      },
      purchases: {
        data: parsedPurchaseRows,
        summary: {
          totalCost: parsedPurchaseRows.reduce((sum, row) => sum + (row.totalCost || 0), 0),
          totalItems: parsedPurchaseRows.reduce((sum, row) => sum + (row.purchaseQuantity || 0), 0),
          uniqueMedicines: parsedPurchaseRows.length
        }
      }
    };
  } catch (error: any) {
    console.error('Error generating report:', error);
    throw new Error(`Failed to generate report: ${error.message}`);
  } finally {
    if (connection) connection.release();
  }
}

