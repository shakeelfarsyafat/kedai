import { Order } from '@/types/coffee';
import { formatRupiah } from './utils';

export function printThermalReceipt(order: Order, baristaName: string = 'Barista Shift A') {
  const isPaid = order.paymentStatus === 'paid';
  const orderDate = new Date(order.createdAt);
  const formattedDate = orderDate.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const formattedTime = orderDate.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // Build items rows HTML
  const itemsHtml = order.items
    .map((item) => {
      let customHtml = '';
      if (item.customization) {
        const parts: string[] = [];
        if (item.customization.sugarLevel && item.customization.sugarLevel !== 'normal') {
          parts.push(`Gula: ${item.customization.sugarLevel}`);
        }
        if (item.customization.iceLevel && item.customization.iceLevel !== 'normal') {
          parts.push(`Es: ${item.customization.iceLevel}`);
        }
        if (item.customization.milkOption && item.customization.milkOption !== 'dairy') {
          parts.push(`Susu: ${item.customization.milkOption}`);
        }
        if (item.customization.selectedAddOns?.length) {
          parts.push(`Add-on: ${item.customization.selectedAddOns.join(', ')}`);
        }
        if (parts.length > 0) {
          customHtml += `<div class="item-custom">${parts.join(' | ')}</div>`;
        }
        if (item.customization.notes) {
          customHtml += `<div class="item-notes">Catatan: "${item.customization.notes}"</div>`;
        }
      }

      return `
        <div class="item-row">
          <div class="item-main">
            <span class="item-name">${item.quantity}x ${item.menuItem.name}</span>
            <span class="item-price">${formatRupiah(item.totalPrice)}</span>
          </div>
          ${customHtml}
        </div>
      `;
    })
    .join('');

  const receiptHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Struk Brew Bean - ${order.id}</title>
  <style>
    @page {
      size: 80mm auto;
      margin: 4mm;
    }
    @media print {
      body {
        width: 72mm;
        margin: 0;
        padding: 0;
      }
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Courier New', Courier, monospace, monospace;
      font-size: 11px;
      line-height: 1.35;
      color: #000000;
      background: #ffffff;
      width: 72mm;
      max-width: 100%;
      margin: 0 auto;
      padding: 6px 2px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .header {
      text-align: center;
      margin-bottom: 8px;
    }
    .logo-img {
      width: 44px;
      height: 44px;
      object-fit: contain;
      margin: 0 auto 4px auto;
      display: block;
    }
    .store-title {
      font-size: 15px;
      font-weight: 900;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .store-sub {
      font-size: 9px;
      color: #333;
    }
    .divider-double {
      border-top: 1px dashed #000;
      border-bottom: 1px dashed #000;
      height: 3px;
      margin: 6px 0;
    }
    .divider-single {
      border-top: 1px dashed #000;
      margin: 6px 0;
    }
    .meta-table {
      width: 100%;
      font-size: 10.5px;
      margin-bottom: 4px;
    }
    .meta-table tr td {
      padding: 1px 0;
      vertical-align: top;
    }
    .meta-table td:first-child {
      color: #444;
      width: 35%;
    }
    .meta-table td:last-child {
      text-align: right;
      font-weight: 600;
    }
    .item-row {
      margin-bottom: 5px;
    }
    .item-main {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      font-weight: 700;
      font-size: 11px;
    }
    .item-name {
      flex: 1;
      padding-right: 6px;
      word-break: break-word;
    }
    .item-price {
      white-space: nowrap;
    }
    .item-custom {
      font-size: 9px;
      color: #555;
      padding-left: 12px;
      margin-top: 1px;
    }
    .item-notes {
      font-size: 8.5px;
      font-style: italic;
      color: #444;
      padding-left: 12px;
      margin-top: 1px;
    }
    .totals-table {
      width: 100%;
      font-size: 10.5px;
    }
    .totals-table tr td {
      padding: 1.5px 0;
    }
    .totals-table td:last-child {
      text-align: right;
    }
    .total-highlight {
      font-size: 13px;
      font-weight: 900;
      border-top: 1px dashed #000;
      border-bottom: 1px dashed #000;
      padding: 4px 0 !important;
    }
    .status-box {
      border: 1.5px solid #000;
      text-align: center;
      padding: 4px 0;
      margin: 8px 0;
      font-size: 12px;
      font-weight: 900;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .status-unpaid {
      border: 1.5px dashed #000;
    }
    .footer {
      text-align: center;
      font-size: 9px;
      color: #333;
      margin-top: 8px;
      line-height: 1.35;
    }
    .footer-bold {
      font-weight: 700;
      font-size: 9.5px;
      margin-bottom: 2px;
    }
  </style>
</head>
<body>
  <div class="header">
    <img src="/images/icon-brew-bean.png" class="logo-img" alt="Brew Bean Logo" />
    <div class="store-title">BREW BEAN</div>
    <div class="store-sub">Temukan Teman Harimu</div>
    <div class="store-sub">Jl. Kopi Harapan No. 10</div>
    <div class="store-sub">Telp: 0812-3456-7890</div>
  </div>

  <div class="divider-double"></div>

  <table class="meta-table">
    <tr>
      <td>No. Order</td>
      <td><strong>${order.id}</strong></td>
    </tr>
    <tr>
      <td>Waktu</td>
      <td>${formattedDate} ${formattedTime}</td>
    </tr>
    <tr>
      <td>Kasir</td>
      <td>${baristaName}</td>
    </tr>
    <tr>
      <td>Pelanggan</td>
      <td><strong>${order.customerName}</strong></td>
    </tr>
    <tr>
      <td>Tipe Pesanan</td>
      <td><strong>${order.orderType === 'dine_in' ? `DINE IN (${order.tableNumber || 'Meja'})` : 'TAKEAWAY'}</strong></td>
    </tr>
  </table>

  <div class="divider-single"></div>

  <div class="items-container">
    ${itemsHtml}
  </div>

  <div class="divider-single"></div>

  <table class="totals-table">
    <tr>
      <td>Subtotal</td>
      <td>${formatRupiah(order.subtotal)}</td>
    </tr>
    <tr>
      <td>PB1 (10%)</td>
      <td>${formatRupiah(order.tax)}</td>
    </tr>
    <tr class="total-highlight">
      <td><strong>TOTAL</strong></td>
      <td><strong>${formatRupiah(order.total)}</strong></td>
    </tr>
    <tr>
      <td>Metode Bayar</td>
      <td><strong>${order.paymentMethod.toUpperCase()}</strong></td>
    </tr>
  </table>

  <div class="status-box ${isPaid ? '' : 'status-unpaid'}">
    ${isPaid ? '*** LUNAS (DIBAYAR) ***' : '*** BELUM DIBAYAR ***'}
  </div>

  ${order.notes ? `<div style="font-size: 9px; text-align: center; margin-bottom: 4px; font-style: italic;">Catatan: ${order.notes}</div>` : ''}

  <div class="divider-double"></div>

  <div class="footer">
    <div class="footer-bold">Terima Kasih Telah Berkunjung!</div>
    <div>Follow Instagram: @brewbean.coffee</div>
    <div style="font-size: 8px; margin-top: 3px; color: #555;">Simpan struk ini sebagai bukti transaksi sah</div>
  </div>
</body>
</html>
  `;

  // Use hidden iframe to trigger print without altering main page DOM
  let iframe = document.getElementById('receipt-print-frame') as HTMLIFrameElement | null;
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.id = 'receipt-print-frame';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.style.zIndex = '-9999';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);
  }

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (!doc) {
    // Fallback: popup window if iframe document inaccessible
    const win = window.open('', '_blank', 'width=350,height=600');
    if (win) {
      win.document.write(receiptHtml);
      win.document.close();
      win.focus();
      setTimeout(() => {
        win.print();
        win.close();
      }, 350);
    }
    return;
  }

  doc.open();
  doc.write(receiptHtml);
  doc.close();

  // Ensure images and fonts are loaded before triggering print dialog
  const printWindow = iframe.contentWindow;
  if (printWindow) {
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 250);
  }
}
