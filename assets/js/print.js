/**
 * وحدة طباعة المنتجات - تضيف إمكانية طباعة قائمة المنتجات بتنسيق مناسب للطباعة
 * يمكن طباعة جميع المنتجات أو المنتجات المفلترة حسب البحث
 */
(function() {
    // إضافة زر الطباعة إلى واجهة المستخدم
    function addPrintButton() {
        // إنشاء زر الطباعة
        const printBtn = document.createElement('button');
        printBtn.className = 'btn btn-secondary btn-sm me-2';
        printBtn.id = 'printBtn';
        printBtn.innerHTML = '<i class="fas fa-print"></i> طباعة';
        printBtn.addEventListener('click', printProducts);
        
        // إضافة الزر إلى واجهة المستخدم (بجانب أزرار التصدير والحذف)
        const deleteAllBtn = document.getElementById('deleteAllBtn');
        if (deleteAllBtn) {
            deleteAllBtn.parentNode.insertBefore(printBtn, deleteAllBtn);
        }
    }

    // دالة طباعة المنتجات
    function printProducts() {
        // الحصول على البيانات المعروضة حاليًا (سواء كانت البيانات كاملة أو نتائج البحث)
        const visibleRows = document.querySelectorAll('#productTable tr');
        
        // التحقق من وجود منتجات للطباعة
        if (visibleRows.length === 0 || (visibleRows.length === 1 && visibleRows[0].querySelector('td[colspan]'))) {
            showAlert('لا توجد منتجات للطباعة', 'warning');
            return;
        }
        
        // الحصول على عنوان للتقرير (مثل "جميع المنتجات" أو "نتائج البحث")
        const searchInput = document.getElementById('searchInput');
        const reportTitle = searchInput && searchInput.value 
            ? `نتائج البحث: ${searchInput.value}` 
            : 'قائمة المنتجات';
        
        // إنشاء نافذة الطباعة
        const printWindow = window.open('', '', 'width=1000,height=600');
        
        // تحديد محتوى نافذة الطباعة مع تضمين CSS للتنسيق
        printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <title>${reportTitle}</title>
                <style>
                    @media print {
                        @page {
                            size: A4;
                            margin: 1cm;
                        }
                    }
                    
                    body {
                        font-family: Arial, Tahoma, sans-serif;
                        line-height: 1.5;
                        color: #000;
                        direction: rtl;
                    }
                    
                    .container {
                        max-width: 100%;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    
                    .print-header {
                        text-align: center;
                        margin-bottom: 20px;
                        padding-bottom: 15px;
                        border-bottom: 1px solid #ddd;
                    }
                    
                    h1 {
                        font-size: 24px;
                        margin-bottom: 5px;
                    }
                    
                    .print-date {
                        font-size: 14px;
                        color: #666;
                    }
                    
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 30px;
                        page-break-inside: auto;
                    }
                    
                    tr {
                        page-break-inside: avoid;
                        page-break-after: auto;
                    }
                    
                    th, td {
                        border: 1px solid #ddd;
                        padding: 8px;
                        text-align: right;
                    }
                    
                    th {
                        background-color: #f2f2f2;
                        font-weight: bold;
                    }
                    
                    .summary {
                        margin-top: 20px;
                        padding-top: 10px;
                        border-top: 1px solid #ddd;
                    }
                    
                    .print-footer {
                        text-align: center;
                        margin-top: 30px;
                        font-size: 12px;
                        color: #666;
                    }
                    
                    .watermark {
                        position: fixed;
                        bottom: 10px;
                        left: 10px;
                        opacity: 0.1;
                        font-size: 40px;
                        transform: rotate(-45deg);
                        z-index: -1;
                    }
                    
                    /* إخفاء عمود الإجراءات من الطباعة */
                    .no-print {
                        display: none;
                    }
                    
                    /* تنسيق خاص للطباعة */
                    .total-column {
                        font-weight: bold;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="print-header">
                        <h1>${reportTitle}</h1>
                        <div class="print-date">تاريخ الطباعة: ${new Date().toLocaleDateString('ar-SA')}</div>
                    </div>
                    
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>اسم المنتج</th>
                                <th>السعر</th>
                                <th>الضرائب</th>
                                <th>الإعلان</th>
                                <th>الخصم</th>
                                <th class="total-column">الإجمالي</th>
                                <th>الفئة</th>
                            </tr>
                        </thead>
                        <tbody>
        `);
        
        // إضافة جميع صفوف المنتجات
        let totalAmount = 0;
        let i = 1;
        
        visibleRows.forEach(row => {
            // تجاهل صف "لا توجد منتجات" إذا كان موجودًا
            if (row.querySelector('td[colspan]')) return;
            
            const cells = row.querySelectorAll('td');
            
            // التأكد من أن هذا صف منتج وليس صف رسالة
            if (cells.length > 7) {
                const total = parseFloat(cells[6].textContent);
                totalAmount += isNaN(total) ? 0 : total;
                
                printWindow.document.write(`
                    <tr>
                        <td>${i}</td>
                        <td>${cells[1].textContent}</td>
                        <td>${cells[2].textContent}</td>
                        <td>${cells[3].textContent}</td>
                        <td>${cells[4].textContent}</td>
                        <td>${cells[5].textContent}</td>
                        <td class="total-column">${cells[6].textContent}</td>
                        <td>${cells[7].textContent}</td>
                    </tr>
                `);
                i++;
            }
        });
        
        // إكمال المستند وإضافة معلومات ملخصة
        printWindow.document.write(`
                        </tbody>
                    </table>
                    
                    <div class="summary">
                        <p><strong>إجمالي عدد المنتجات:</strong> ${i - 1}</p>
                        <p><strong>إجمالي قيمة المنتجات:</strong> ${totalAmount.toFixed(2)}</p>
                    </div>
                    
                    <div class="print-footer">
                        تم إنشاء هذا التقرير بواسطة نظام إدارة المنتجات
                    </div>
                    
                    <div class="watermark">نظام إدارة المنتجات</div>
                </div>
                
                <script>
                    // طباعة تلقائية بعد تحميل الصفحة
                    window.onload = function() {
                        setTimeout(function() {
                            window.print();
                            // إغلاق النافذة بعد الطباعة (على أنظمة ويندوز)
                            // في بعض المتصفحات قد لا يعمل هذا الأمر لأسباب أمنية
                            // window.close();
                        }, 500);
                    };
                </script>
            </body>
            </html>
        `);
        
        printWindow.document.close();
    }
    
    // دالة طباعة منتج واحد بالتفاصيل
    function printProductDetails(productIndex) {
        // الحصول على بيانات المنتجات
        const productData = JSON.parse(localStorage.getItem('productData')) || [];
        
        // التحقق من وجود المنتج
        if (!productData[productIndex]) {
            showAlert('المنتج غير موجود', 'danger');
            return;
        }
        
        const product = productData[productIndex];
        
        // إنشاء نافذة الطباعة
        const printWindow = window.open('', '', 'width=800,height=600');
        
        // تحديد محتوى نافذة الطباعة
        printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <title>تفاصيل المنتج: ${product.title}</title>
                <style>
                    @media print {
                        @page {
                            size: A5;
                            margin: 1cm;
                        }
                    }
                    
                    body {
                        font-family: Arial, Tahoma, sans-serif;
                        line-height: 1.5;
                        color: #000;
                        direction: rtl;
                    }
                    
                    .container {
                        max-width: 100%;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    
                    .print-header {
                        text-align: center;
                        margin-bottom: 30px;
                    }
                    
                    h1 {
                        font-size: 22px;
                        margin-bottom: 5px;
                    }
                    
                    .product-card {
                        border: 1px solid #ddd;
                        border-radius: 5px;
                        padding: 20px;
                        margin-bottom: 20px;
                    }
                    
                    .product-title {
                        font-size: 18px;
                        font-weight: bold;
                        margin-bottom: 15px;
                        padding-bottom: 10px;
                        border-bottom: 1px solid #eee;
                    }
                    
                    .product-detail {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 10px;
                        margin-bottom: 20px;
                    }
                    
                    .detail-item {
                        padding: 8px;
                        border-bottom: 1px dashed #eee;
                    }
                    
                    .detail-label {
                        font-weight: bold;
                        color: #555;
                    }
                    
                    .total-price {
                        font-size: 18px;
                        font-weight: bold;
                        text-align: center;
                        padding: 10px;
                        margin-top: 20px;
                        background-color: #f9f9f9;
                        border-radius: 5px;
                    }
                    
                    .print-footer {
                        text-align: center;
                        margin-top: 30px;
                        font-size: 12px;
                        color: #666;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="print-header">
                        <h1>بطاقة منتج</h1>
                    </div>
                    
                    <div class="product-card">
                        <div class="product-title">${product.title}</div>
                        
                        <div class="product-detail">
                            <div class="detail-item">
                                <span class="detail-label">الفئة:</span>
                                <span>${product.category || 'غير مصنف'}</span>
                            </div>
                            
                            <div class="detail-item">
                                <span class="detail-label">السعر الأساسي:</span>
                                <span>${product.price}</span>
                            </div>
                            
                            <div class="detail-item">
                                <span class="detail-label">الضرائب:</span>
                                <span>${product.taxes}</span>
                            </div>
                            
                            <div class="detail-item">
                                <span class="detail-label">مصاريف الإعلان:</span>
                                <span>${product.ads}</span>
                            </div>
                            
                            <div class="detail-item">
                                <span class="detail-label">الخصم:</span>
                                <span>${product.discount}</span>
                            </div>
                        </div>
                        
                        <div class="total-price">السعر الإجمالي: ${product.total}</div>
                    </div>
                    
                    <div class="print-footer">
                        تم إنشاء هذه البطاقة بواسطة نظام إدارة المنتجات - ${new Date().toLocaleDateString('ar-SA')}
                    </div>
                </div>
                
                <script>
                    // طباعة تلقائية بعد تحميل الصفحة
                    window.onload = function() {
                        setTimeout(function() {
                            window.print();
                        }, 500);
                    };
                </script>
            </body>
            </html>
        `);
        
        printWindow.document.close();
    }
    
    // إضافة زر طباعة لكل منتج
    function addPrintButtonToProducts() {
        // نستخدم تقنية التفويض للأحداث لإضافة وظيفة الطباعة لكل منتج
        document.addEventListener('click', function(e) {
            // البحث عن زر تعديل المنتج (نستخدمه للحصول على مؤشر المنتج)
            const editBtn = e.target.closest('.btn-primary');
            if (editBtn && editBtn.getAttribute('onclick') && editBtn.getAttribute('onclick').includes('editProduct')) {
                // استخراج مؤشر المنتج من الدالة
                const onclickAttr = editBtn.getAttribute('onclick');
                const matches = onclickAttr.match(/editProduct\((\d+)\)/);
                
                if (matches && matches[1]) {
                    const productIndex = parseInt(matches[1]);
                    
                    // التحقق مما إذا كان زر الطباعة موجود بالفعل
                    const parentCell = editBtn.parentNode;
                    if (!parentCell.querySelector('.print-product-btn')) {
                        // إنشاء زر طباعة المنتج
                        const printProductBtn = document.createElement('button');
                        printProductBtn.className = 'btn btn-sm btn-secondary print-product-btn mx-1';
                        printProductBtn.innerHTML = '<i class="fas fa-print"></i>';
                        printProductBtn.title = 'طباعة بطاقة المنتج';
                        printProductBtn.onclick = function(event) {
                            event.preventDefault();
                            event.stopPropagation();
                            printProductDetails(productIndex);
                        };
                        
                        // إضافة الزر بعد زر التعديل
                        parentCell.insertBefore(printProductBtn, editBtn.nextSibling);
                    }
                }
            }
        });
    }
    
    // إضافة زر طباعة المنتج المحدد في نموذج التعديل
    function addPrintButtonToForm() {
        const form = document.getElementById('productForm');
        const submitBtn = document.getElementById('submitBtn');
        
        if (form && submitBtn) {
            // إنشاء زر الطباعة
            const printCurrentBtn = document.createElement('button');
            printCurrentBtn.className = 'btn btn-outline-secondary mt-2';
            printCurrentBtn.type = 'button';
            printCurrentBtn.id = 'printCurrentBtn';
            printCurrentBtn.innerHTML = '<i class="fas fa-print"></i> طباعة بطاقة المنتج';
            printCurrentBtn.style.display = 'none'; // إخفاء الزر مبدئيًا
            
            // إضافة زر الطباعة إلى النموذج
            submitBtn.parentNode.appendChild(printCurrentBtn);
            
            // إضافة مستمع حدث لزر الطباعة
            printCurrentBtn.addEventListener('click', function() {
                // العثور على مؤشر المنتج الحالي
                if (window.tmp !== undefined && window.mode === 'update') {
                    printProductDetails(window.tmp);
                } else {
                    showAlert('يجب اختيار منتج للطباعة أولًا', 'warning');
                }
            });
            
            // مراقبة تغيير وضع التحرير لإظهار/إخفاء زر الطباعة
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.target === submitBtn && mutation.type === 'childList') {
                        // إذا كان النص يحتوي على "تحديث"، فهذا يعني أننا في وضع التحرير
                        printCurrentBtn.style.display = submitBtn.textContent.includes('تحديث') ? 'block' : 'none';
                    }
                });
            });
            
            // تكوين المراقب لمراقبة التغييرات في محتوى زر الإرسال
            observer.observe(submitBtn, { childList: true });
            
            // التحقق من الحالة الأولية
            printCurrentBtn.style.display = submitBtn.textContent.includes('تحديث') ? 'block' : 'none';
        }
    }
    
    // دالة مساعدة لعرض الإشعارات
    function showAlert(message, type) {
        // استخدام دالة showAlert الموجودة في الملف الرئيسي
        if (window.showAlert) {
            window.showAlert(message, type);
        } else {
            alert(message);
        }
    }
    
    // تهيئة الوحدة عند تحميل الصفحة
    window.addEventListener('load', function() {
        addPrintButton();
        addPrintButtonToProducts();
        addPrintButtonToForm();
    });
})();