// إضافة زر التصدير إلى واجهة المستخدم
function addExportButton() {
    // إنشاء زر التصدير بجانب زر حذف الكل
    const exportBtn = document.createElement('button');
    exportBtn.className = 'btn btn-success btn-sm me-2';
    exportBtn.id = 'exportBtn';
    exportBtn.innerHTML = 'تصدير إلى Excel';
    exportBtn.addEventListener('click', exportToExcel);
    
    // إضافة الزر إلى واجهة المستخدم
    const deleteAllBtn = document.getElementById('deleteAllBtn');
    deleteAllBtn.parentNode.insertBefore(exportBtn, deleteAllBtn);
}

// دالة تصدير البيانات كملف CSV (يمكن فتحه بواسطة Excel)
function exportToCSV() {
    // التأكد من وجود بيانات
    if (productData.length === 0) {
        showAlert('لا توجد بيانات للتصدير', 'warning');
        return;
    }
    
    // تحديد رؤوس الأعمدة
    const headers = ['الرقم', 'اسم المنتج', 'السعر', 'الضرائب', 'الإعلان', 'الخصم', 'الإجمالي', 'الفئة'];
    
    // إنشاء محتوى CSV
    let csvContent = headers.join(',') + '\n';
    
    // إضافة كل صف من البيانات
    productData.forEach((item, index) => {
        const row = [
            index + 1,
            '"' + item.title.replace(/"/g, '""') + '"', // تحييد علامات الاقتباس
            item.price,
            item.taxes,
            item.ads,
            item.discount,
            item.total,
            '"' + (item.category || '-').replace(/"/g, '""') + '"'  // تحييد علامات الاقتباس
        ];
        csvContent += row.join(',') + '\n';
    });
    
    // إنشاء رابط تنزيل وتشغيله
    const encodedUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent('\uFEFF' + csvContent); // إضافة BOM للدعم العربي
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'منتجات_' + new Date().toLocaleDateString() + '.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showAlert('تم تصدير البيانات بنجاح إلى CSV', 'success');
}

// دالة تصدير البيانات مباشرة كملف Excel (XLSX) باستخدام مكتبة SheetJS
function exportToExcel() {
    // التأكد من وجود بيانات
    if (productData.length === 0) {
        showAlert('لا توجد بيانات للتصدير', 'warning');
        return;
    }
    
    // إذا كانت مكتبة SheetJS غير محملة، استخدم طريقة CSV البديلة
    if (typeof XLSX === 'undefined') {
        // تحميل مكتبة SheetJS (XLSX) ديناميكيًا
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
        script.onload = function() {
            createAndDownloadExcel();
        };
        script.onerror = function() {
            // استخدام طريقة CSV البديلة إذا فشل تحميل المكتبة
            console.log('فشل تحميل مكتبة XLSX، جاري استخدام طريقة CSV البديلة');
            exportToCSV();
        };
        document.body.appendChild(script);
    } else {
        createAndDownloadExcel();
    }
}

// دالة إنشاء وتنزيل ملف Excel
function createAndDownloadExcel() {
    // إنشاء مصفوفة للبيانات
    const excelData = [
        ['الرقم', 'اسم المنتج', 'السعر', 'الضرائب', 'الإعلان', 'الخصم', 'الإجمالي', 'الفئة'] // رؤوس الأعمدة
    ];
    
    // إضافة بيانات المنتجات
    productData.forEach((item, index) => {
        excelData.push([
            index + 1,
            item.title,
            parseFloat(item.price),
            parseFloat(item.taxes),
            parseFloat(item.ads),
            parseFloat(item.discount),
            parseFloat(item.total),
            item.category || '-'
        ]);
    });
    
    // إنشاء ورقة عمل جديدة
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    
    // تحسين عرض الأعمدة
    const wscols = [
        { wch: 5 },  // رقم
        { wch: 30 }, // اسم المنتج
        { wch: 10 }, // السعر
        { wch: 10 }, // الضرائب
        { wch: 10 }, // الإعلان
        { wch: 10 }, // الخصم
        { wch: 10 }, // الإجمالي
        { wch: 15 }  // الفئة
    ];
    ws['!cols'] = wscols;
    
    // إنشاء مصنف جديد وإضافة ورقة العمل
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'المنتجات');
    
    // تصدير المصنف كملف Excel
    XLSX.writeFile(wb, 'منتجات_' + new Date().toLocaleDateString() + '.xlsx');
    
    showAlert('تم تصدير البيانات بنجاح إلى Excel', 'success');
}

// إضافة وظيفة استيراد البيانات من ملف Excel
function setupImportFeature() {
    // إنشاء زر الاستيراد
    const importBtn = document.createElement('button');
    importBtn.className = 'btn btn-info btn-sm me-2';
    importBtn.id = 'importBtn';
    importBtn.innerHTML = 'استيراد من Excel';
    
    // إنشاء عنصر إدخال الملف المخفي
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = 'excelFileInput';
    fileInput.accept = '.xlsx, .xls, .csv';
    fileInput.style.display = 'none';
    fileInput.addEventListener('change', importFromExcel);
    
    // ربط زر الاستيراد بعنصر إدخال الملف
    importBtn.addEventListener('click', function() {
        fileInput.click();
    });
    
    // إضافة العناصر إلى واجهة المستخدم
    const deleteAllBtn = document.getElementById('deleteAllBtn');
    deleteAllBtn.parentNode.insertBefore(importBtn, deleteAllBtn);
    document.body.appendChild(fileInput);
}

// دالة استيراد البيانات من ملف Excel
function importFromExcel(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // التحقق من امتداد الملف
    const fileExt = file.name.split('.').pop().toLowerCase();
    if (fileExt !== 'xlsx' && fileExt !== 'xls' && fileExt !== 'csv') {
        showAlert('الرجاء اختيار ملف Excel صالح (.xlsx, .xls) أو CSV', 'danger');
        return;
    }
    
    // تحميل مكتبة SheetJS إذا لم تكن محملة
    if (typeof XLSX === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
        script.onload = function() {
            processExcelFile(file);
        };
        script.onerror = function() {
            showAlert('فشل تحميل مكتبة معالجة Excel', 'danger');
        };
        document.body.appendChild(script);
    } else {
        processExcelFile(file);
    }
}

// معالجة ملف Excel للاستيراد
function processExcelFile(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            // الحصول على الورقة الأولى
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // تحويل البيانات إلى مصفوفة JS
            const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            // تجاهل صف العناوين (الصف الأول)
            if (excelData.length <= 1) {
                showAlert('الملف لا يحتوي على بيانات كافية', 'warning');
                return;
            }
            
            // تحليل البيانات واستيرادها
            const importedProducts = [];
            
            // البدء من الصف الثاني (بعد العناوين)
            for (let i = 1; i < excelData.length; i++) {
                const row = excelData[i];
                
                // التأكد من وجود بيانات في الصف
                if (row.length < 3 || !row[1]) continue;
                
                const product = {
                    title: row[1].toString(),
                    price: parseFloat(row[2]) || 0,
                    taxes: parseFloat(row[3]) || 0,
                    ads: parseFloat(row[4]) || 0,
                    discount: parseFloat(row[5]) || 0,
                    total: parseFloat(row[6]) || 0,
                    category: row[7] ? row[7].toString() : ''
                };
                
                // حساب الإجمالي إذا لم يكن موجودًا
                if (!product.total) {
                    product.total = (product.price + product.taxes + product.ads) - product.discount;
                }
                
                importedProducts.push(product);
            }
            
            if (importedProducts.length === 0) {
                showAlert('لم يتم العثور على بيانات صالحة للاستيراد', 'warning');
                return;
            }
            
            // سؤال المستخدم عن كيفية الاستيراد
            if (confirm(`تم العثور على ${importedProducts.length} منتج. هل ترغب في إضافتها إلى القائمة الحالية؟ اختر "نعم" للإضافة أو "لا" لاستبدال البيانات الحالية.`)) {
                // إضافة المنتجات الجديدة إلى القائمة الحالية
                productData = [...productData, ...importedProducts];
            } else {
                // استبدال البيانات الحالية بالبيانات المستوردة
                productData = importedProducts;
            }
            
            // حفظ البيانات وتحديث العرض
            saveData();
            showProducts();
            showAlert(`تم استيراد ${importedProducts.length} منتج بنجاح`, 'success');
            
        } catch (error) {
            console.error('خطأ في معالجة الملف:', error);
            showAlert('حدث خطأ أثناء معالجة الملف', 'danger');
        }
    };
    
    reader.onerror = function() {
        showAlert('حدث خطأ أثناء قراءة الملف', 'danger');
    };
    
    reader.readAsArrayBuffer(file);
}

// إضافة زر التصدير والاستيراد عند تحميل الصفحة
window.addEventListener('load', function() {
    addExportButton();
    setupImportFeature();
});