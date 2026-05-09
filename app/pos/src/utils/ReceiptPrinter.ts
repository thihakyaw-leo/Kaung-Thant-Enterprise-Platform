export const generateReceiptHTML = (data: any) => {
  return `
    <div style="font-family: 'Courier New', monospace; width: 300px; padding: 10px; font-size: 12px; color: #000; background: #fff;">
      <div style="text-align: center; font-weight: bold; font-size: 16px;">${data.shopName}</div>
      <div style="text-align: center;">${data.address || 'Yangon, Myanmar'}</div>
      <div style="text-align: center;">Tel: ${data.phone || '09...'}</div>
      
      <div style="margin: 10px 0; border-top: 1px dashed #000;"></div>
      
      <div style="display: flex; justify-content: space-between;">
        <span>Inv: ${data.invoiceNo}</span>
      </div>
      <div>Date: ${new Date(data.date * 1000).toLocaleString()}</div>
      
      <div style="margin: 10px 0; border-top: 1px dashed #000;"></div>
      
      <table style="width: 100%; border-collapse: collapse;">
        ${data.items.map((item: any) => `
          <tr>
            <td colspan="2" style="padding-top: 5px;">${item.name}</td>
          </tr>
          <tr>
            <td style="padding-left: 10px;">${item.qty} x ${item.price.toLocaleString()}</td>
            <td style="text-align: right;">${(item.qty * item.price).toLocaleString()}</td>
          </tr>
        `).join('')}
      </table>
      
      <div style="margin: 10px 0; border-top: 1px dashed #000;"></div>
      
      <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 14px;">
        <span>TOTAL</span>
        <span>${data.total.toLocaleString()} MMK</span>
      </div>
      
      <div style="margin-top: 5px; display: flex; justify-content: space-between;">
        <span>Payment:</span>
        <span style="text-transform: uppercase;">${data.paymentMethod}</span>
      </div>

      <div style="margin-top: 20px; text-align: center;">
        --- Thank You! Come Again ---
      </div>
      <div style="text-align: center; font-size: 10px; margin-top: 5px;">
        Powered by Kaung Thant Enterprise
      </div>
    </div>
  `;
};

export const printReceipt = (data: any) => {
  const html = generateReceiptHTML(data);
  const printWindow = window.open('', '_blank', 'width=350,height=600');
  if (printWindow) {
    printWindow.document.write('<html><head><title>Print Receipt</title></head><body style="margin:0;">');
    printWindow.document.write(html);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  }
};
