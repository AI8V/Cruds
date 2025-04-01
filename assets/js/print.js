/**
 * وحدة طباعة المنتجات - نسخة محسنة وأكثر كفاءة
 * - تدعم طباعة الصور.
 * - تعتمد على بيانات المنتج الأصلية بدلاً من قراءة خلايا الجدول مباشرة.
 * - تحسينات في التنسيق.
 */
(function() {
    'use strict';

    // --- إضافة أزرار الطباعة (لا تغيير هنا) ---
    function addPrintButtons() {
        // زر طباعة القائمة
        if (!document.getElementById('printBtn')) {
            const printBtn = document.createElement('button');
            printBtn.className = 'btn btn-secondary btn-sm me-2';
            printBtn.id = 'printBtn';
            printBtn.innerHTML = '<i class="fas fa-print"></i> طباعة القائمة';
            printBtn.title = 'طباعة القائمة المعروضة حالياً';
            printBtn.addEventListener('click', printProductList);
            const deleteAllBtn = document.getElementById('deleteAllBtn');
            if (deleteAllBtn) {
                deleteAllBtn.parentNode.insertBefore(printBtn, deleteAllBtn);
            }
        }

        // زر طباعة بطاقة المنتج (في النموذج)
        addPrintButtonToForm();

        // إضافة أزرار الطباعة لكل منتج (عبر تفويض الأحداث)
        addPrintButtonsToTableRows();
    }

    // --- طباعة قائمة المنتجات ---
    function printProductList() {
        const visibleRows = document.querySelectorAll('#productTable tr');
        const productData = getProductDataFromLocalStorage(); // قراءة البيانات مرة واحدة

        // فلترة للحصول على بيانات المنتجات المرئية فقط
        const visibleProductsData = getVisibleProductsData(visibleRows, productData);

        if (visibleProductsData.length === 0) {
            showAlert('لا توجد منتجات للطباعة في القائمة الحالية', 'warning');
            return;
        }

        // تحديد عنوان التقرير
        const searchInput = document.getElementById('searchInput');
        const reportTitle = searchInput?.value ? `نتائج البحث: ${searchInput.value}` : 'قائمة جرد المنتجات';

        // جمع بيانات الطباعة
        let totalAmount = 0;
        const printRows = visibleProductsData.map((product, index) => {
            totalAmount += parseFloat(product.total || 0);
            const productId = window.productImagesModule?.generateProductId?.(product); // استخدام الوحدة لجلب ID الصورة
            const imageData = productId ? window.productImagesModule?.getProductImage?.(productId) : null; // جلب الصورة
            return {
                index: index + 1, // رقم تسلسلي للتقرير المطبوع
                image: imageData,
                title: product.title || '',
                price: parseFloat(product.price || 0).toFixed(2),
                taxes: parseFloat(product.taxes || 0).toFixed(2),
                ads: parseFloat(product.ads || 0).toFixed(2),
                discount: parseFloat(product.discount || 0).toFixed(2),
                total: parseFloat(product.total || 0).toFixed(2),
                category: product.category || '-'
            };
        });

        // إنشاء محتوى HTML للطباعة
        const printContent = generateListPrintHTML(reportTitle, printRows, totalAmount);

        // فتح نافذة الطباعة وكتابة المحتوى
        openPrintWindow(printContent);
    }

    // --- طباعة تفاصيل منتج واحد ---
    function printProductDetails(productIndex) {
        const productData = getProductDataFromLocalStorage();

        if (typeof productIndex !== 'number' || !productData[productIndex]) {
            showAlert('المنتج المحدد غير موجود أو المؤشر غير صالح', 'danger');
            return;
        }

        const product = productData[productIndex];
        const productId = window.productImagesModule?.generateProductId?.(product);
        const imageData = productId ? window.productImagesModule?.getProductImage?.(productId) : null;

        // إنشاء محتوى HTML لبطاقة المنتج
        const printContent = generateDetailsPrintHTML(product, imageData);

        // فتح نافذة الطباعة
        openPrintWindow(printContent);
    }

    // --- مساعدة: قراءة بيانات المنتج من التخزين بأمان ---
    function getProductDataFromLocalStorage() {
        try {
            const storedData = localStorage.getItem('productData');
            return storedData ? JSON.parse(storedData) : [];
        } catch (e) {
            console.error("Print.js: خطأ في قراءة بيانات المنتج.", e);
            showAlert('حدث خطأ أثناء قراءة بيانات المنتج للطباعة.', 'danger');
            return [];
        }
    }

    // --- مساعدة: الحصول على بيانات المنتجات المرئية في الجدول ---
    function getVisibleProductsData(visibleRows, allProductData) {
        const visibleProducts = [];
        visibleRows.forEach(row => {
            if (row.querySelector('td[colspan]') || !row.cells || row.cells.length < 8) { // تحقق من عدد الخلايا المتوقع
                return; // تخطي الصفوف غير الصالحة
            }

            // محاولة العثور على المؤشر من زر التعديل (لا يزال يعتمد على onclick)
            const editBtn = row.querySelector('button[onclick*="editProduct"]');
            const match = editBtn?.getAttribute('onclick')?.match(/editProduct\((\d+)\)/);

            if (match && match[1]) {
                const index = parseInt(match[1], 10);
                if (allProductData[index]) {
                    // تحقق إضافي (اختياري): قارن العنوان في الخلية مع البيانات
                    const titleInCell = row.cells[2]?.textContent?.trim(); // العمود الثالث للاسم عادةً
                    if (titleInCell === allProductData[index].title) {
                        visibleProducts.push(allProductData[index]);
                    } else {
                         console.warn("Print.js: عدم تطابق بين بيانات الصف والبيانات المخزنة للمؤشر:", index, row);
                    }
                }
            } else {
                 console.warn("Print.js: لم يتم العثور على مؤشر منتج صالح للصف:", row);
            }
        });
        return visibleProducts;
    }


    // --- مساعدة: إنشاء HTML لطباعة القائمة ---
    function generateListPrintHTML(title, rows, totalAmount) {
        // تحسين CSS قليلاً
        const css = `
            @media print { @page { size: A4; margin: 1cm; } }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; direction: rtl; }
            .container { max-width: 98%; margin: 0 auto; padding: 15px; }
            .print-header { text-align: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid #007bff; }
            h1 { font-size: 22px; color: #0056b3; margin-bottom: 8px; }
            .print-info { display: flex; justify-content: space-between; font-size: 13px; color: #555; margin-bottom: 15px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 25px; page-break-inside: auto; font-size: 12px; }
            tr { page-break-inside: avoid; page-break-after: auto; }
            th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: right; vertical-align: middle; }
            th { background-color: #e9ecef; font-weight: 600; color: #495057; }
            .summary { margin-top: 25px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 14px; }
            .summary p { margin: 5px 0; }
            .print-footer { text-align: center; margin-top: 30px; font-size: 11px; color: #888; }
            .total-column { font-weight: bold; background-color: #f8f9fa; }
            .product-image-print { max-width: 40px; max-height: 40px; object-fit: cover; display: block; margin: auto; border-radius: 3px; }
            .no-image-print { width: 40px; height: 40px; background-color: #f0f0f0; color: #bbb; display: flex; align-items: center; justify-content: center; font-size: 1.1em; margin: auto; border-radius: 3px; }
            td.image-cell { width: 55px; text-align: center; padding: 4px; } /* خلية الصورة */
        `;

        // بناء الجدول
        let tableRowsHTML = '';
        rows.forEach(row => {
            const imageHTML = row.image
                ? `<img src="${row.image}" alt="صورة" class="product-image-print">`
                : `<div class="no-image-print" title="لا توجد صورة">-</div>`;
            tableRowsHTML += `
                <tr>
                    <td>${row.index}</td>
                    <td class="image-cell">${imageHTML}</td>
                    <td>${row.title}</td>
                    <td>${row.price}</td>
                    <td>${row.taxes}</td>
                    <td>${row.ads}</td>
                    <td>${row.discount}</td>
                    <td class="total-column">${row.total}</td>
                    <td>${row.category}</td>
                </tr>
            `;
        });

        // القالب الكامل
        return `
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head><meta charset="UTF-8"><title>${title}</title><style>${css}</style></head>
            <body>
                <div class="container">
                    <div class="print-header">
                        <h1>${title}</h1>
                        <div class="print-info">
                            <span>تاريخ الطباعة: ${new Date().toLocaleDateString('ar-SA', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                            <span>الوقت: ${new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>صورة</th> <!-- عمود الصورة -->
                                <th>اسم المنتج</th>
                                <th>السعر</th>
                                <th>الضرائب</th>
                                <th>الإعلان</th>
                                <th>الخصم</th>
                                <th class="total-column">الإجمالي</th>
                                <th>الفئة</th>
                            </tr>
                        </thead>
                        <tbody>${tableRowsHTML}</tbody>
                    </table>
                    <div class="summary">
                        <p><strong>إجمالي عدد المنتجات:</strong> ${rows.length}</p>
                        <p><strong>إجمالي قيمة المنتجات:</strong> ${totalAmount.toFixed(2)}</p>
                    </div>
                    <div class="print-footer">تم إنشاؤه بواسطة نظام إدارة المنتجات</div>
                </div>
                <script>
                    window.onload = function() { setTimeout(window.print, 500); };
                </script>
            </body></html>
        `;
    }

    // --- مساعدة: إنشاء HTML لبطاقة المنتج ---
    function generateDetailsPrintHTML(product, imageData) {
        const css = `
            @media print { @page { size: A5 landscape; margin: 1cm; } } /* تغيير حجم الصفحة */
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; direction: rtl; }
            .container { max-width: 95%; margin: 0 auto; padding: 15px; }
            .product-card { border: 1px solid #007bff; border-radius: 8px; padding: 20px; display: flex; flex-direction: row; gap: 20px; align-items: flex-start; }
            .product-image-details { width: 150px; height: 150px; object-fit: contain; border: 1px solid #eee; border-radius: 5px; padding: 5px; background-color: #fff; align-self: center; }
            .no-image-details { width: 150px; height: 150px; background-color: #f8f9fa; color: #adb5bd; display: flex; align-items: center; justify-content: center; font-size: 2em; border: 1px solid #eee; border-radius: 5px; align-self: center; }
            .product-info { flex-grow: 1; }
            .product-title { font-size: 20px; font-weight: 600; color: #0056b3; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #eee; }
            .details-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 8px 15px; margin-bottom: 15px; font-size: 13px; }
            .detail-item { padding-bottom: 5px; border-bottom: 1px dotted #ddd; }
            .detail-label { font-weight: 600; color: #555; margin-left: 5px; }
            .total-price { font-size: 18px; font-weight: bold; text-align: center; padding: 10px; margin-top: 15px; background-color: #e9ecef; border-radius: 5px; color: #0056b3; }
            .print-footer { text-align: center; margin-top: 25px; font-size: 11px; color: #999; }
        `;

        const imageHTML = imageData
            ? `<img src="${imageData}" alt="صورة المنتج" class="product-image-details">`
            : `<div class="no-image-details" title="لا توجد صورة">?</div>`;

        return `
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head><meta charset="UTF-8"><title>بطاقة منتج: ${product.title}</title><style>${css}</style></head>
            <body>
                <div class="container">
                    <div class="product-card">
                        ${imageHTML} <!-- وضع الصورة هنا -->
                        <div class="product-info">
                            <div class="product-title">${product.title || 'منتج غير مسمى'}</div>
                            <div class="details-grid">
                                <div class="detail-item"><span class="detail-label">الفئة:</span><span>${product.category || 'غير محدد'}</span></div>
                                <div class="detail-item"><span class="detail-label">السعر:</span><span>${parseFloat(product.price || 0).toFixed(2)}</span></div>
                                <div class="detail-item"><span class="detail-label">الضرائب:</span><span>${parseFloat(product.taxes || 0).toFixed(2)}</span></div>
                                <div class="detail-item"><span class="detail-label">الإعلان:</span><span>${parseFloat(product.ads || 0).toFixed(2)}</span></div>
                                <div class="detail-item"><span class="detail-label">الخصم:</span><span>${parseFloat(product.discount || 0).toFixed(2)}</span></div>
                            </div>
                            <div class="total-price">السعر الإجمالي: ${parseFloat(product.total || 0).toFixed(2)}</div>
                        </div>
                    </div>
                    <div class="print-footer">نظام إدارة المنتجات - ${new Date().toLocaleDateString('ar-SA')}</div>
                </div>
                <script>
                    window.onload = function() { setTimeout(window.print, 500); };
                </script>
            </body></html>
        `;
    }


    // --- مساعدة: فتح نافذة الطباعة ---
    function openPrintWindow(content) {
        try {
            const printWindow = window.open('', '_blank', 'width=1000,height=700,scrollbars=yes,resizable=yes');
            if (!printWindow) {
                 showAlert('فشل فتح نافذة الطباعة. يرجى التأكد من السماح بالنوافذ المنبثقة لهذا الموقع.', 'danger');
                 return;
            }
            printWindow.document.open();
            printWindow.document.write(content);
            printWindow.document.close();
             // لا حاجة لاستدعاء الطباعة من هنا، لأنها تتم عبر window.onload داخل النافذة نفسها
        } catch (e) {
             console.error("Print.js: خطأ في فتح نافذة الطباعة:", e);
             showAlert('حدث خطأ أثناء محاولة فتح نافذة الطباعة.', 'danger');
        }
    }

    // --- مساعدة: إضافة زر الطباعة للمنتج المحدد في نموذج التعديل (لا تغيير) ---
    function addPrintButtonToForm() {
        const form = document.getElementById('productForm');
        const submitBtn = document.getElementById('submitBtn');
        const buttonContainer = submitBtn?.parentNode; // حاوية الأزرار

        if (form && submitBtn && buttonContainer && !document.getElementById('printCurrentBtn')) {
            const printCurrentBtn = document.createElement('button');
            printCurrentBtn.className = 'btn btn-outline-info mt-2'; // تغيير اللون لتمييزه
            printCurrentBtn.type = 'button';
            printCurrentBtn.id = 'printCurrentBtn';
            printCurrentBtn.innerHTML = '<i class="fas fa-id-card"></i> طباعة بطاقة المنتج الحالي';
            printCurrentBtn.style.display = 'none'; // إخفاء مبدئي
            printCurrentBtn.title = 'طباعة تفاصيل المنتج الذي يتم تعديله حالياً';

            buttonContainer.appendChild(printCurrentBtn); // إضافة الزر داخل حاوية الأزرار الأخرى

            printCurrentBtn.addEventListener('click', function() {
                if (window.mode === 'update' && typeof window.tmp === 'number') {
                    printProductDetails(window.tmp);
                } else {
                    showAlert('يجب أن تكون في وضع تعديل منتج لطباعة بطاقته.', 'warning');
                }
            });

            // مراقبة تغيير وضع التحرير
             // استخدام MutationObserver لرصد التغييرات في زر الإرسال (لتحديد وضع التحديث)
             const observerCallback = (mutationsList, observer) => {
                for (const mutation of mutationsList) {
                    // التحقق من تغيير النص أو السمة التي تدل على وضع التحديث
                    // نفترض هنا أن نص الزر يتغير إلى "تحديث المنتج"
                    const isUpdateMode = submitBtn.textContent.includes('تحديث');
                    printCurrentBtn.style.display = isUpdateMode ? 'block' : 'none';
                    // يمكنك إضافة تحققات أخرى إذا لزم الأمر
                    break; // يكفي التحقق من أول تغيير
                }
            };
            const observer = new MutationObserver(observerCallback);
             // مراقبة تغيير النص داخل الزر
            observer.observe(submitBtn, { childList: true, characterData: true, subtree: true });

             // التحقق من الحالة الأولية عند التحميل
             printCurrentBtn.style.display = submitBtn.textContent.includes('تحديث') ? 'block' : 'none';
        }
    }

    // --- مساعدة: إضافة أزرار الطباعة لصفوف الجدول (استخدام تفويض الأحداث) ---
    function addPrintButtonsToTableRows() {
        const tableBody = document.getElementById('productTable');
        if (!tableBody) return;

        tableBody.addEventListener('click', function(e) {
            // استهداف زر طباعة المنتج الصغير إذا تم النقر عليه مباشرة أو على الأيقونة داخله
            const printButton = e.target.closest('.print-product-btn');
            if (printButton) {
                e.preventDefault();
                e.stopPropagation();
                const productIndex = parseInt(printButton.getAttribute('data-product-index') || '-1', 10);
                if (productIndex !== -1) {
                    printProductDetails(productIndex);
                } else {
                    console.error("Print.js: لم يتم العثور على مؤشر المنتج لزر الطباعة.");
                    showAlert('خطأ: لم يتم تحديد المنتج للطباعة.', 'danger');
                }
            }
        });

         // نحتاج أيضًا لتحديث الأزرار عند إعادة رسم الجدول
         // يمكن استخدام نفس MutationObserver الخاص بوحدة الصور أو الشعبية إذا كانت موجودة،
         // أو إنشاء واحد جديد هنا لمراقبة الصفوف وإضافة الأزرار.
         // كحل أبسط، سنضيف الأزرار عند استدعاء showProducts في product-manager.js
         // (يتطلب تعديل بسيط هناك) أو نعتمد على إعادة رسم الجدول بالكامل.
         // الحل الأكثر نظافة هنا هو استخدام Observer.
         const tableObserver = new MutationObserver(injectPrintButtonsIntoRows);
         tableObserver.observe(tableBody, { childList: true });
         // حقن الأزرار في الصفوف الحالية عند التهيئة
         injectPrintButtonsIntoRows([{ target: tableBody }]); // محاكاة حدث أول
    }

     // حقن زر الطباعة في صفوف الجدول
    function injectPrintButtonsIntoRows(mutationsList) {
        const rows = document.querySelectorAll('#productTable tr:not(:has(td[colspan]))'); // استهداف صفوف المنتج فقط
        rows.forEach(row => {
             const actionsCell = row.cells[row.cells.length - 1]; // خلية الإجراءات هي الأخيرة عادة
             if (actionsCell && !actionsCell.querySelector('.print-product-btn')) {
                 // الحصول على المؤشر من زر التعديل
                 const editBtn = actionsCell.querySelector('button[onclick*="editProduct"]');
                 const match = editBtn?.getAttribute('onclick')?.match(/editProduct\((\d+)\)/);
                 if (match && match[1]) {
                     const productIndex = match[1];
                     const printProductBtn = document.createElement('button');
                     printProductBtn.className = 'btn btn-sm btn-outline-secondary print-product-btn mx-1'; // تغيير اللون
                     printProductBtn.innerHTML = '<i class="fas fa-address-card"></i>'; // تغيير الأيقونة
                     printProductBtn.title = 'طباعة بطاقة هذا المنتج';
                     printProductBtn.setAttribute('data-product-index', productIndex); // تخزين المؤشر
                     // يتم التعامل مع النقر عبر event delegation أعلاه

                     // إضافة الزر قبل زر الحذف (إذا وجد) أو في نهاية الخلية
                     const deleteBtn = actionsCell.querySelector('.btn-danger');
                     if (deleteBtn) {
                         actionsCell.insertBefore(printProductBtn, deleteBtn);
                     } else {
                         actionsCell.appendChild(printProductBtn);
                     }
                 }
             }
        });
    }


    // --- مساعدة: عرض التنبيهات (لا تغيير) ---
    function showAlert(message, type = 'info') {
        if (typeof window.showAlert === 'function') {
            window.showAlert(message, type);
        } else {
            console.warn("Print.js: دالة showAlert العامة غير متاحة.", message);
            alert(`${type.toUpperCase()}: ${message}`); // بديل بسيط
        }
    }

    // --- تهيئة الوحدة ---
    // نستخدم DOMContentLoaded لضمان تحميل العناصر الأساسية قبل إضافة الأزرار
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addPrintButtons);
    } else {
        addPrintButtons(); // إذا تم تحميل DOM بالفعل
    }

    // جعل دالة طباعة البطاقة متاحة عالميًا إذا احتاجتها وحدات أخرى (نادرًا ما يكون ضروريًا)
    // window.printProductCard = printProductDetails;

})();