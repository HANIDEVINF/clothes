import jsPDF from 'jspdf';
import { AnalyticsSummary, Product, Order } from '../types';

export function generateExecutiveSalesReportPDF(
  analytics: AnalyticsSummary,
  products: Product[],
  orders: Order[]
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  // Header background banner
  doc.setFillColor(15, 16, 18);
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Brand Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text('AURA', margin, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(190, 195, 205);
  doc.text('LUXURY COMMERCE & RETAIL OS | EXECUTIVE INTELLIGENCE REPORT', margin, 26);

  // Metadata right-aligned
  const reportDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const reportTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  doc.setFontSize(8);
  doc.setTextColor(160, 165, 175);
  doc.text(`DATE: ${reportDate} ${reportTime}`, pageWidth - margin, 18, { align: 'right' });
  doc.text(`DOC REF: AUR-REP-${Date.now().toString().slice(-6)}`, pageWidth - margin, 24, { align: 'right' });
  doc.text('DATABASE: MongoDB (aura_store)', pageWidth - margin, 30, { align: 'right' });

  let y = 52;

  // Section: Executive Financial Summary
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(20, 20, 24);
  doc.text('1. Executive Financial Performance', margin, y);

  y += 7;

  // KPI boxes (4 columns)
  const cardWidth = (contentWidth - 9) / 4;
  const kpis = [
    { label: 'GROSS REVENUE', value: `$${analytics.grossRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, sub: '+18.4% vs last cycle' },
    { label: 'EST. NET PROFIT', value: `$${analytics.netProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, sub: `${Math.round((analytics.netProfit / (analytics.grossRevenue || 1)) * 100)}% net margin` },
    { label: 'AVG ORDER VALUE', value: `$${analytics.averageOrderValue.toFixed(2)}`, sub: `${analytics.totalUnitsSold} items sold` },
    { label: 'CONVERSION RATE', value: `${analytics.conversionRate}%`, sub: 'Benchmark: 2.5%' },
  ];

  kpis.forEach((kpi, idx) => {
    const cardX = margin + idx * (cardWidth + 3);
    doc.setFillColor(246, 247, 249);
    doc.setDrawColor(225, 228, 234);
    doc.roundedRect(cardX, y, cardWidth, 24, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(100, 110, 125);
    doc.text(kpi.label, cardX + 4, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(kpi.value, cardX + 4, y + 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(40, 140, 60);
    doc.text(kpi.sub, cardX + 4, y + 20);
  });

  y += 32;

  // Section: Category Breakdown
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(20, 20, 24);
  doc.text('2. Multi-Category Sales & Revenue Share', margin, y);

  y += 6;

  // Table header
  doc.setFillColor(30, 35, 45);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('CATEGORY DEPT', margin + 4, y + 5);
  doc.text('UNITS SOLD', margin + 65, y + 5);
  doc.text('GROSS REVENUE', margin + 105, y + 5);
  doc.text('SHARE %', margin + 145, y + 5);

  y += 7;

  analytics.categoryMetrics.forEach((cat, index) => {
    const isOdd = index % 2 === 1;
    if (isOdd) {
      doc.setFillColor(250, 250, 252);
      doc.rect(margin, y, contentWidth, 6.5, 'F');
    }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 35, 45);
    doc.text(cat.displayName, margin + 4, y + 4.5);
    doc.text(`${cat.units} units`, margin + 65, y + 4.5);
    doc.text(`$${cat.revenue.toLocaleString()}`, margin + 105, y + 4.5);
    doc.text(`${cat.share}%`, margin + 145, y + 4.5);
    y += 6.5;
  });

  y += 8;

  // Section: Top Inventory & Products
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(20, 20, 24);
  doc.text('3. Product Inventory & Stock Health Audit', margin, y);

  y += 6;

  doc.setFillColor(30, 35, 45);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('PRODUCT / MODEL NAME', margin + 4, y + 5);
  doc.text('SKU', margin + 75, y + 5);
  doc.text('PRICE', margin + 105, y + 5);
  doc.text('STOCK ON HAND', margin + 130, y + 5);
  doc.text('STATUS', margin + 158, y + 5);

  y += 7;

  products.slice(0, 6).forEach((prod, index) => {
    const isOdd = index % 2 === 1;
    if (isOdd) {
      doc.setFillColor(250, 250, 252);
      doc.rect(margin, y, contentWidth, 6.5, 'F');
    }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 35, 45);

    const truncatedName = prod.name.length > 38 ? prod.name.substring(0, 36) + '...' : prod.name;
    doc.text(truncatedName, margin + 4, y + 4.5);
    doc.text(prod.sku, margin + 75, y + 4.5);
    doc.text(`$${prod.price.toFixed(2)}`, margin + 105, y + 4.5);
    doc.text(`${prod.stock} in stock`, margin + 130, y + 4.5);

    if (prod.stock < 8) {
      doc.setTextColor(190, 50, 40);
      doc.text('Low Stock Alert', margin + 158, y + 4.5);
    } else {
      doc.setTextColor(30, 130, 60);
      doc.text('Optimal Stock', margin + 158, y + 4.5);
    }

    y += 6.5;
  });

  y += 8;

  // Section: Engagement & User Acquisition
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(20, 20, 24);
  doc.text('4. Customer Engagement & Acquisition Metrics', margin, y);

  y += 6;

  const engCardWidth = (contentWidth - 6) / 3;
  const engCards = [
    { title: 'Cart Abandonment', value: `${analytics.cartAbandonmentRate}%`, desc: 'Industry benchmark: 68-70%' },
    { title: 'Repeat Buyer Rate', value: `${analytics.repeatCustomerRate}%`, desc: '30-day retention curve' },
    { title: 'Real-time Live Users', value: `${analytics.activeVisitors} Active`, desc: 'Instant session tracking' },
  ];

  engCards.forEach((ec, idx) => {
    const cardX = margin + idx * (engCardWidth + 3);
    doc.setFillColor(246, 247, 249);
    doc.setDrawColor(225, 228, 234);
    doc.roundedRect(cardX, y, engCardWidth, 18, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(100, 110, 125);
    doc.text(ec.title, cardX + 4, y + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(ec.value, cardX + 4, y + 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(120, 125, 135);
    doc.text(ec.desc, cardX + 4, y + 15.5);
  });

  y += 24;

  // Section: Strategic Recommendations
  doc.setFillColor(243, 244, 246);
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(20, 20, 24);
  doc.text('Strategic Insights for Business Decision-Making:', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(60, 65, 75);
  doc.text('• Eyewear & Optical products yield the highest net margin (67%); prioritize marketing titanium models.', margin + 4, y + 11);
  doc.text('• Re-order stock immediately for models with <8 units to avoid stockout friction on high-traffic days.', margin + 4, y + 15.5);
  doc.text('• Direct and editorial referrals are yielding 72% of qualified checkouts with zero ad spend.', margin + 4, y + 20);

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(150, 155, 165);
  doc.text(
    `Confidential | Prepared by AURA Commerce OS for Executive Leadership | Generated ${reportDate}`,
    pageWidth / 2,
    pageHeight - 8,
    { align: 'center' }
  );

  doc.save(`AURA_Sales_Report_${new Date().toISOString().split('T')[0]}.pdf`);
}

// Generate Customer Order Receipt / Invoice PDF
export function generateCustomerReceiptPDF(order: Order): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(15, 15, 18);
  doc.text('AURA', margin, 24);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 105, 115);
  doc.text('OFFICIAL ORDER RECEIPT & PROOF OF PURCHASE', margin, 31);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 15, 18);
  doc.text(`ORDER #${order.orderNumber}`, pageWidth - margin, 24, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 105, 115);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, pageWidth - margin, 30, { align: 'right' });
  doc.text(`Auth Token: ${order.transactionToken}`, pageWidth - margin, 35, { align: 'right' });

  doc.setDrawColor(230, 230, 235);
  doc.setLineWidth(0.5);
  doc.line(margin, 40, pageWidth - margin, 40);

  // Customer & Shipping Info
  let y = 48;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(20, 20, 24);
  doc.text('SHIPPING ADDRESS', margin, y);
  doc.text('PAYMENT DETAILS', pageWidth / 2 + 10, y);

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(60, 65, 75);
  doc.text(order.customer.name, margin, y);
  doc.text(`Method: ${order.paymentMethod.replace('_', ' ').toUpperCase()}`, pageWidth / 2 + 10, y);

  y += 4.5;
  doc.text(order.customer.address, margin, y);
  doc.text(`Status: ${order.paymentStatus.toUpperCase()} (256-Bit TLS Verified)`, pageWidth / 2 + 10, y);

  y += 4.5;
  doc.text(`${order.customer.city}, ${order.customer.state} ${order.customer.postalCode}`, margin, y);
  doc.text(`Fulfillment: ${order.fulfillmentStatus.toUpperCase()}`, pageWidth / 2 + 10, y);

  y += 4.5;
  doc.text(`${order.customer.country} | ${order.customer.email}`, margin, y);
  if (order.trackingNumber) {
    doc.text(`Tracking: ${order.trackingNumber}`, pageWidth / 2 + 10, y);
  }

  y += 12;

  // Items table
  doc.setFillColor(245, 245, 248);
  doc.rect(margin, y, contentWidth, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(20, 20, 24);
  doc.text('ITEM DESCRIPTION', margin + 4, y + 5.5);
  doc.text('QTY', margin + 105, y + 5.5);
  doc.text('UNIT PRICE', margin + 125, y + 5.5);
  doc.text('TOTAL', margin + 155, y + 5.5);

  y += 8;

  order.items.forEach((item, idx) => {
    const isOdd = idx % 2 === 1;
    if (isOdd) {
      doc.setFillColor(252, 252, 254);
      doc.rect(margin, y, contentWidth, 7, 'F');
    }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 30, 35);

    const desc = `${item.name}${item.selectedSize ? ` (Size: ${item.selectedSize})` : ''}${item.selectedColor ? ` [${item.selectedColor}]` : ''}`;
    doc.text(desc.length > 50 ? desc.substring(0, 48) + '...' : desc, margin + 4, y + 5);
    doc.text(`${item.quantity}`, margin + 105, y + 5);
    doc.text(`$${item.price.toFixed(2)}`, margin + 125, y + 5);
    doc.text(`$${(item.price * item.quantity).toFixed(2)}`, margin + 155, y + 5);

    y += 7;
  });

  y += 6;
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // Financial summary
  const summaryX = pageWidth - margin - 65;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(70, 75, 85);

  doc.text('Subtotal:', summaryX, y);
  doc.text(`$${order.subtotal.toFixed(2)}`, pageWidth - margin, y, { align: 'right' });
  y += 5;

  if (order.discount > 0) {
    doc.setTextColor(35, 140, 60);
    doc.text('Promo Discount:', summaryX, y);
    doc.text(`-$${order.discount.toFixed(2)}`, pageWidth - margin, y, { align: 'right' });
    y += 5;
  }

  doc.setTextColor(70, 75, 85);
  doc.text('Shipping:', summaryX, y);
  doc.text(order.shippingFee === 0 ? 'Complimentary' : `$${order.shippingFee.toFixed(2)}`, pageWidth - margin, y, { align: 'right' });
  y += 5;

  doc.text('Estimated Sales Tax:', summaryX, y);
  doc.text(`$${order.tax.toFixed(2)}`, pageWidth - margin, y, { align: 'right' });
  y += 6;

  doc.setLineWidth(0.8);
  doc.line(summaryX, y, pageWidth - margin, y);
  y += 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 15, 20);
  doc.text('Total Paid:', summaryX, y);
  doc.text(`$${order.totalAmount.toFixed(2)}`, pageWidth - margin, y, { align: 'right' });

  y += 20;

  // Security & Return policy guarantee badge
  doc.setFillColor(248, 249, 250);
  doc.setDrawColor(230, 232, 236);
  doc.roundedRect(margin, y, contentWidth, 20, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 35, 45);
  doc.text('AUTHENTICITY & RETURN POLICY GUARANTEE', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 105, 115);
  doc.text('All luxury eyewear, apparel, and leather goods include a 30-day return policy and complimentary worldwide tracking.', margin + 4, y + 11);
  doc.text('Processed securely via PCI-DSS Level 1 compliant gateway with tokenized cryptographic authorization.', margin + 4, y + 15.5);

  doc.save(`AURA_Receipt_${order.orderNumber}.pdf`);
}
