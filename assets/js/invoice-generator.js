(function() {
    'use strict';

    let currentInvoiceItems = [];
    let invoiceModalInstance = null;
    const productDataKey = 'productData';

    function getProductData() {
        try {
            const data = localStorage.getItem(productDataKey);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error("Error reading product data:", e);
            return [];
        }
    }

    function formatCurrency(amount) {
        return parseFloat(amount || 0).toFixed(2);
    }

    function calculateLineTotal(price, quantity) {
        return formatCurrency(parseFloat(price || 0) * parseInt(quantity || 1, 10));
    }

    function updateInvoiceTotal() {
        const total = currentInvoiceItems.reduce((sum, item) => {
            return sum + parseFloat(calculateLineTotal(item.product.total, item.quantity));
        }, 0);
        const totalElement = document.getElementById('invoiceTotalAmount');
        if (totalElement) {
            totalElement.textContent = formatCurrency(total);
        }
    }

    function renderInvoiceItemsTable() {
        const tableBody = document.getElementById('invoiceItemsTableBody');
        if (!tableBody) return;
        tableBody.innerHTML = '';
        currentInvoiceItems.forEach((item, index) => {
            const row = document.createElement('tr');
            row.setAttribute('data-index', index);
            row.innerHTML = `
                <td>${item.product.title}</td>
                <td>${formatCurrency(item.product.total)}</td>
                <td><input type="number" class="form-control form-control-sm quantity-input" value="${item.quantity}" min="1" style="width: 70px;"></td>
                <td class="line-total">${calculateLineTotal(item.product.total, item.quantity)}</td>
                <td><button class="btn btn-danger btn-sm remove-item-btn">×</button></td>
            `;
            tableBody.appendChild(row);
        });
        updateInvoiceTotal();
    }

    function addProductToInvoice() {
        const productSelect = document.getElementById('invoiceProductSelect');
        const quantityInput = document.getElementById('invoiceQuantityInput');
        const selectedOption = productSelect.options[productSelect.selectedIndex];

        if (!selectedOption || !selectedOption.value) {
            alert('يرجى اختيار منتج.');
            return;
        }

        const productIndex = parseInt(selectedOption.value, 10);
        const allProducts = getProductData();
        const product = allProducts[productIndex];
        const quantity = parseInt(quantityInput.value || 1, 10);

        if (product && quantity > 0) {
            const existingItemIndex = currentInvoiceItems.findIndex(item => item.product === product);
            if (existingItemIndex > -1) {
                currentInvoiceItems[existingItemIndex].quantity += quantity;
            } else {
                currentInvoiceItems.push({ product: product, quantity: quantity });
            }
            renderInvoiceItemsTable();
            quantityInput.value = '1';
            productSelect.selectedIndex = 0;
        } else {
             alert('الكمية غير صالحة أو المنتج غير موجود.');
        }
    }

    function handleItemUpdate(e) {
        if (e.target.classList.contains('quantity-input')) {
            const row = e.target.closest('tr');
            const index = parseInt(row.getAttribute('data-index'), 10);
            const newQuantity = parseInt(e.target.value, 10);

            if (!isNaN(newQuantity) && newQuantity >= 1 && currentInvoiceItems[index]) {
                currentInvoiceItems[index].quantity = newQuantity;
                const lineTotalCell = row.querySelector('.line-total');
                lineTotalCell.textContent = calculateLineTotal(currentInvoiceItems[index].product.total, newQuantity);
                updateInvoiceTotal();
            } else {
                 e.target.value = currentInvoiceItems[index]?.quantity || 1;
                 alert('الرجاء إدخال كمية صالحة (1 أو أكثر).');
            }
        } else if (e.target.classList.contains('remove-item-btn')) {
            const row = e.target.closest('tr');
            const index = parseInt(row.getAttribute('data-index'), 10);
            if (currentInvoiceItems[index]) {
                currentInvoiceItems.splice(index, 1);
                renderInvoiceItemsTable();
            }
        }
    }


    function generateInvoiceHTML(customerName) {
        const now = new Date();
        const invoiceDate = now.toLocaleDateString('ar-SA');
        const invoiceTime = now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
        const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

        let itemsHTML = '';
        currentInvoiceItems.forEach((item, index) => {
            itemsHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${item.product.title}</td>
                    <td>${formatCurrency(item.product.total)}</td>
                    <td>${item.quantity}</td>
                    <td>${calculateLineTotal(item.product.total, item.quantity)}</td>
                </tr>
            `;
        });

        const totalAmount = formatCurrency(currentInvoiceItems.reduce((sum, item) => {
            return sum + parseFloat(calculateLineTotal(item.product.total, item.quantity));
        }, 0));

        const css = `
            body { font-family: sans-serif; direction: rtl; margin: 20px; }
            .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, .15); font-size: 16px; line-height: 24px; color: #555; }
            .invoice-box table { width: 100%; line-height: inherit; text-align: right; border-collapse: collapse; }
            .invoice-box table td { padding: 5px; vertical-align: top; }
            .invoice-box table tr td:nth-child(n+2) { text-align: left; }
            .invoice-box table tr.top table td { padding-bottom: 20px; }
            .invoice-box table tr.top table td.title { font-size: 45px; line-height: 45px; color: #333; }
            .invoice-box table tr.information table td { padding-bottom: 40px; }
            .invoice-box table tr.heading td { background: #eee; border-bottom: 1px solid #ddd; font-weight: bold; text-align: right; }
            .invoice-box table tr.details td { padding-bottom: 20px; text-align: right; }
            .invoice-box table tr.item td { border-bottom: 1px solid #eee; text-align: right; }
             .invoice-box table tr.item.last td { border-bottom: none; }
            .invoice-box table tr.total td { border-top: 2px solid #eee; font-weight: bold; text-align: left;}
            .invoice-box table tr.item td:nth-child(1), .invoice-box table tr.heading td:nth-child(1) { text-align: right; width: 5%;} /* SN */
            .invoice-box table tr.item td:nth-child(2), .invoice-box table tr.heading td:nth-child(2) { text-align: right; width: 50%;} /* Desc */
            .invoice-box table tr.item td:nth-child(3), .invoice-box table tr.heading td:nth-child(3) { text-align: center; width: 15%;} /* Price */
            .invoice-box table tr.item td:nth-child(4), .invoice-box table tr.heading td:nth-child(4) { text-align: center; width: 10%;} /* Qty */
            .invoice-box table tr.item td:nth-child(5), .invoice-box table tr.heading td:nth-child(5) { text-align: left; width: 20%;} /* Total */

            @media print {
                .invoice-box { box-shadow: none; border: none; }
                body { margin: 0; }
                 @page { margin: 0.5cm; }
            }
        `;

        return `
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <title>فاتورة ${invoiceNumber}</title>
                <style>${css}</style>
            </head>
            <body>
                <div class="invoice-box">
                    <table>
                        <tr class="top">
                            <td colspan="5">
                                <table>
                                    <tr>
                                        <td class="title">
                                            فاتورة
                                        </td>
                                        <td>
                                            رقم الفاتورة: ${invoiceNumber}<br>
                                            تاريخ الإنشاء: ${invoiceDate} ${invoiceTime}<br>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr class="information">
                            <td colspan="5">
                                <table>
                                    <tr>
                                        <td>
                                            <strong>فاتورة إلى:</strong><br>
                                            ${customerName || 'عميل نقدي'}
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr class="heading">
                            <td>#</td>
                            <td>المنتج</td>
                            <td>السعر</td>
                            <td>الكمية</td>
                            <td>الإجمالي</td>
                        </tr>
                        ${itemsHTML}
                         <tr class="total">
                            <td colspan="4"></td>
                             <td><strong>المجموع: ${totalAmount}</strong></td>
                         </tr>
                    </table>
                </div>
                <script>window.onload = () => { setTimeout(window.print, 500); };</script>
            </body>
            </html>
        `;
    }


    function showFinalInvoice() {
        const customerNameInput = document.getElementById('invoiceCustomerName');
        const customerName = customerNameInput ? customerNameInput.value.trim() : '';

        if (currentInvoiceItems.length === 0) {
            alert('الرجاء إضافة منتجات إلى الفاتورة أولاً.');
            return;
        }

        const invoiceHTML = generateInvoiceHTML(customerName);
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        if(printWindow){
            printWindow.document.open();
            printWindow.document.write(invoiceHTML);
            printWindow.document.close();
        } else {
             alert('فشل فتح نافذة الطباعة. يرجى السماح بالنوافذ المنبثقة.');
        }


        invoiceModalInstance.hide();
    }

    function populateProductSelector() {
        const select = document.getElementById('invoiceProductSelect');
        if (!select) return;
        select.innerHTML = '<option value="" selected disabled>-- اختر منتج --</option>';
        const products = getProductData();
        products.forEach((product, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${product.title} (${formatCurrency(product.total)})`;
            select.appendChild(option);
        });
    }

    function resetInvoiceModal() {
        currentInvoiceItems = [];
        const customerNameInput = document.getElementById('invoiceCustomerName');
        const productSelect = document.getElementById('invoiceProductSelect');
        const quantityInput = document.getElementById('invoiceQuantityInput');
        const tableBody = document.getElementById('invoiceItemsTableBody');
        const totalElement = document.getElementById('invoiceTotalAmount');

        if(customerNameInput) customerNameInput.value = '';
        if(productSelect) productSelect.selectedIndex = 0;
        if(quantityInput) quantityInput.value = '1';
        if(tableBody) tableBody.innerHTML = '';
        if(totalElement) totalElement.textContent = '0.00';
    }

    function createInvoiceModal() {
        if (document.getElementById('invoiceGeneratorModal')) return;

        const modalHTML = `
            <div class="modal fade" id="invoiceGeneratorModal" tabindex="-1" aria-labelledby="invoiceModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg modal-dialog-scrollable">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="invoiceModalLabel">إنشاء فاتورة جديدة</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <label for="invoiceCustomerName" class="form-label">اسم العميل (اختياري)</label>
                                <input type="text" class="form-control" id="invoiceCustomerName" placeholder="أدخل اسم العميل">
                            </div>
                            <hr>
                            <h6>إضافة منتجات للفاتورة</h6>
                            <div class="row g-2 mb-3 align-items-end">
                                <div class="col-md-6">
                                    <label for="invoiceProductSelect" class="form-label">المنتج</label>
                                    <select class="form-select" id="invoiceProductSelect"></select>
                                </div>
                                <div class="col-md-3">
                                    <label for="invoiceQuantityInput" class="form-label">الكمية</label>
                                    <input type="number" class="form-control" id="invoiceQuantityInput" value="1" min="1">
                                </div>
                                <div class="col-md-3">
                                    <button type="button" class="btn btn-success w-100" id="addProductToInvoiceBtn">إضافة</button>
                                </div>
                            </div>
                            <hr>
                            <h6>المنتجات في الفاتورة</h6>
                            <div class="table-responsive">
                                <table class="table table-sm table-bordered">
                                    <thead class="table-light">
                                        <tr>
                                            <th>المنتج</th>
                                            <th>السعر</th>
                                            <th>الكمية</th>
                                            <th>الإجمالي</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody id="invoiceItemsTableBody">
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colspan="3" class="text-end"><strong>المجموع الكلي:</strong></td>
                                            <td id="invoiceTotalAmount" class="fw-bold">0.00</td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إغلاق</button>
                            <button type="button" class="btn btn-primary" id="generateInvoiceBtn">إنشاء وطباعة الفاتورة</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const modalElement = document.getElementById('invoiceGeneratorModal');
        invoiceModalInstance = new bootstrap.Modal(modalElement);

        modalElement.addEventListener('show.bs.modal', populateProductSelector);
        modalElement.addEventListener('hidden.bs.modal', resetInvoiceModal);

        document.getElementById('addProductToInvoiceBtn')?.addEventListener('click', addProductToInvoice);
        document.getElementById('generateInvoiceBtn')?.addEventListener('click', showFinalInvoice);
        document.getElementById('invoiceItemsTableBody')?.addEventListener('click', handleItemUpdate);
         document.getElementById('invoiceItemsTableBody')?.addEventListener('input', handleItemUpdate);

    }

    function addInvoiceButton() {
        const targetContainer = document.querySelector('.card-body .d-flex.justify-content-between');
        if (!targetContainer || document.getElementById('createInvoiceBtn')) return;

        const createInvoiceBtn = document.createElement('button');
        createInvoiceBtn.className = 'btn btn-info btn-sm me-2';
        createInvoiceBtn.id = 'createInvoiceBtn';
        createInvoiceBtn.innerHTML = '<i class="fas fa-file-invoice"></i> إنشاء فاتورة';
        createInvoiceBtn.title = 'إنشاء فاتورة عميل جديدة';
        createInvoiceBtn.addEventListener('click', () => {
             if (invoiceModalInstance) {
                invoiceModalInstance.show();
             } else {
                console.error("Invoice modal not initialized");
             }
        });

        const deleteAllBtn = document.getElementById('deleteAllBtn');
        if(deleteAllBtn) {
             deleteAllBtn.parentNode.insertBefore(createInvoiceBtn, deleteAllBtn);
        } else {
             targetContainer.insertBefore(createInvoiceBtn, targetContainer.firstChild);
        }


        createInvoiceModal();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addInvoiceButton);
    } else {
        addInvoiceButton();
    }

})();