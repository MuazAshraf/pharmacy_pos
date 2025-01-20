import { NextResponse } from 'next/server';
import { getReport } from '@/lib/dbOperations';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const format = searchParams.get('format') || 'json';

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    // Format dates to include time
    const formattedStartDate = `${startDate} 00:00:00`;
    const formattedEndDate = `${endDate} 23:59:59`;

    const report = await getReport(formattedStartDate, formattedEndDate);

    if (format === 'pdf') {
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(20);
      doc.text('Sales and Purchase Report', doc.internal.pageSize.width / 2, 20, { align: 'center' });
      doc.setFontSize(12);
      doc.text(`Period: ${startDate} to ${endDate}`, doc.internal.pageSize.width / 2, 30, { align: 'center' });

      // Sales Summary
      doc.setFontSize(16);
      doc.text('Sales Summary', 14, 45);
      doc.setFontSize(12);
      doc.text(`Total Sales: PKR ${report.sales.summary.totalSales.toFixed(2)}`, 14, 55);
      doc.text(`Total Items Sold: ${report.sales.summary.totalItems}`, 14, 62);
      doc.text(`Unique Medicines: ${report.sales.summary.uniqueMedicines}`, 14, 69);

      // Sales Details Table
      (doc as any).autoTable({
        startY: 80,
        head: [['Medicine', 'Quantity', 'Amount', 'Date']],
        body: report.sales.data.map((sale: any) => [
          `${sale.brandName}\n(${sale.saltName})`,
          `${sale.totalQuantity} ${sale.unit}`,
          `PKR ${sale.totalSales.toFixed(2)}`,
          new Date(sale.saleDate).toLocaleDateString()
        ]),
      });

      // Purchase Summary
      const purchaseStartY = (doc as any).lastAutoTable.finalY + 20;
      doc.setFontSize(16);
      doc.text('Purchase Summary', 14, purchaseStartY);
      doc.setFontSize(12);
      doc.text(`Total Cost: PKR ${report.purchases.summary.totalCost.toFixed(2)}`, 14, purchaseStartY + 10);
      doc.text(`Total Items Purchased: ${report.purchases.summary.totalItems}`, 14, purchaseStartY + 17);
      doc.text(`Unique Medicines: ${report.purchases.summary.uniqueMedicines}`, 14, purchaseStartY + 24);

      // Purchase Details Table
      (doc as any).autoTable({
        startY: purchaseStartY + 35,
        head: [['Medicine', 'Quantity', 'Cost', 'Date']],
        body: report.purchases.data.map((purchase: any) => [
          `${purchase.brandName}\n(${purchase.saltName})`,
          `${purchase.purchaseQuantity} ${purchase.unit}`,
          `PKR ${purchase.totalCost.toFixed(2)}`,
          new Date(purchase.purchaseDate).toLocaleDateString()
        ]),
      });

      // Convert PDF to bytes
      const pdfBytes = doc.output('arraybuffer');

      return new Response(pdfBytes, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename=report-${startDate}-to-${endDate}.pdf`
        }
      });
    }

    return NextResponse.json(report);
  } catch (error: any) {
    console.error('Error in reports API:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

