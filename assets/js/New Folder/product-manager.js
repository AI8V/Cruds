let productData = [];
let tmp;
let mode = 'create';

const form = document.getElementById('productForm');
const title = document.getElementById('title');
const price = document.getElementById('price');
const taxes = document.getElementById('taxes');
const ads = document.getElementById('ads');
const discount = document.getElementById('discount');
const total = document.getElementById('total');
const count = document.getElementById('count');
const category = document.getElementById('category');
const submitBtn = document.getElementById('submitBtn');
const searchInput = document.getElementById('searchInput');
const searchAll = document.getElementById('searchAll');
const searchTitle = document.getElementById('searchTitle');
const searchCategory = document.getElementById('searchCategory');
const productTable = document.getElementById('productTable');
const productCount = document.getElementById('productCount');
const deleteAllBtn = document.getElementById('deleteAllBtn');
const clearBtn = document.getElementById('clearBtn');
const productId = document.getElementById('productId');

window.onload = function() {
    if(localStorage.productData) {
        try {
            productData = JSON.parse(localStorage.productData);
            showProducts();
            if (typeof window.notifyDashboardOfDataChange === 'function') {
                window.notifyDashboardOfDataChange();
            }
        } catch (e) {
             console.error("Error parsing product data from localStorage:", e);
             localStorage.removeItem('productData'); // Clear corrupted data
             productData = [];
              if (typeof window.notifyDashboardOfDataChange === 'function') {
                 window.notifyDashboardOfDataChange();
             }
        }
    } else {
        if (typeof window.notifyDashboardOfDataChange === 'function') {
             window.notifyDashboardOfDataChange();
        }
    }

    const calcInputs = document.querySelectorAll('.calc-input');
    calcInputs.forEach(input => {
        input.addEventListener('input', calculateTotal);
    });
};

function calculateTotal() {
    const numPrice = parseFloat(price.value) || 0;
    const numTaxes = parseFloat(taxes.value) || 0;
    const numAds = parseFloat(ads.value) || 0;
    const numDiscount = parseFloat(discount.value) || 0;
    const result = (numPrice + numTaxes + numAds) - numDiscount;

    if(numPrice > 0) {
        total.innerHTML = `<span>السعر الإجمالي: ${result.toFixed(2)}</span>`; // Format total
        total.style.backgroundColor = '#198754';
        total.style.color = 'white';
    } else {
        total.innerHTML = `<span>السعر الإجمالي: 0.00</span>`;
        total.style.backgroundColor = '#f8f9fa';
        total.style.color = '#198754'; // Keep text color consistent or adjust as needed
    }
}


form.addEventListener('submit', function(e) {
    e.preventDefault();

    const itemTotal = calculateItemTotal(); // Calculate total first

    let newProduct = {
        title: title.value.trim(),
        price: parseFloat(price.value) || 0,
        taxes: parseFloat(taxes.value) || 0,
        ads: parseFloat(ads.value) || 0,
        discount: parseFloat(discount.value) || 0,
        total: itemTotal,
        category: category.value.trim(),
    };

    if(!newProduct.title || newProduct.price <= 0) { // Ensure title exists and price is positive
        showAlert('يرجى إدخال اسم المنتج وسعر صالح (أكبر من 0)', 'warning');
        return;
    }

    if(mode === 'update' && typeof tmp !== 'undefined') {
        if (tmp >= 0 && tmp < productData.length) {
            productData[tmp] = newProduct;
            showAlert('تم تحديث المنتج بنجاح', 'success');
        } else {
             showAlert('خطأ: لم يتم العثور على المنتج للتحديث.', 'danger');
             clearForm(); // Reset form if index was invalid
             return; // Prevent further execution like saveData
        }
    }
    else {
        const numCount = parseInt(count.value, 10) || 1;
        if(numCount > 0) {
            for(let i = 0; i < numCount; i++) {
                 // Create a distinct object for each product, especially if IDs or timestamps were added later
                productData.push({...newProduct});
            }
             if (numCount > 1) {
                 showAlert(`تم إنشاء ${numCount} منتجات بنجاح`, 'success');
             } else {
                 showAlert('تم إنشاء المنتج بنجاح', 'success');
             }
        } else {
             showAlert('الرجاء إدخال كمية صالحة (1 أو أكثر).', 'warning');
             return;
        }
    }

    saveData();
    clearForm();
    showProducts();
});

function calculateItemTotal() {
    const numPrice = parseFloat(price.value) || 0;
    const numTaxes = parseFloat(taxes.value) || 0;
    const numAds = parseFloat(ads.value) || 0;
    const numDiscount = parseFloat(discount.value) || 0;
    return (numPrice + numTaxes + numAds) - numDiscount;
}

function saveData() {
    try {
        localStorage.setItem('productData', JSON.stringify(productData));
        if (typeof window.notifyDashboardOfDataChange === 'function') {
            window.notifyDashboardOfDataChange();
        }
    } catch (e) {
        console.error("Error saving data to localStorage:", e);
        showAlert('حدث خطأ أثناء حفظ البيانات. قد تكون مساحة التخزين ممتلئة.', 'danger');
    }
}

clearBtn.addEventListener('click', clearForm);

function clearForm() {
    form.reset();
    calculateTotal();
    mode = 'create';
    submitBtn.innerHTML = 'إنشاء منتج جديد';
    count.disabled = false;
    if(productId) productId.value = '';
    tmp = undefined;
     title.focus(); // Set focus back to the title field
}

function showProducts(items = productData) {
    const tbody = document.getElementById('productTable');
    if (!tbody) {
        console.error("Table body 'productTable' not found.");
        return;
    }

    const displayDeleteAll = items.length > 0;
    deleteAllBtn.style.display = displayDeleteAll ? 'block' : 'none';
    productCount.innerHTML = `عدد المنتجات: ${items.length}`;

    if(items.length === 0) {
        const colspan = tbody.closest('table')?.querySelector('thead tr')?.cells?.length || 9; // Dynamically get colspan
        tbody.innerHTML = `
            <tr class="text-center">
                <td class="text-muted py-4" colspan="${colspan}">لا توجد منتجات لعرضها</td>
            </tr>
        `;
        return;
    }

    let tableContent = '';
    items.forEach(item => {
        // Find the original index reliably, even if item objects were recreated (e.g., via JSON parse)
        // This assumes titles + prices are unique enough for this context, or requires a proper ID later
        // If duplicates exist, findIndex might return the first match.
        const originalIndex = productData.findIndex(p => p.title === item.title && p.price === item.price && p.category === item.category && p.total === item.total);

        // Use originalIndex + 1 for display, but originalIndex for actions
        const displayIndex = originalIndex !== -1 ? originalIndex + 1 : '-'; // Show '-' if somehow not found

        tableContent += `
            <tr>
                <td>${displayIndex}</td>
                <td>${item.title || '-'}</td>
                <td>${(parseFloat(item.price) || 0).toFixed(2)}</td>
                <td>${(parseFloat(item.taxes) || 0).toFixed(2)}</td>
                <td>${(parseFloat(item.ads) || 0).toFixed(2)}</td>
                <td>${(parseFloat(item.discount) || 0).toFixed(2)}</td>
                <td>${(parseFloat(item.total) || 0).toFixed(2)}</td>
                <td>${item.category || '-'}</td>
                <td>
                    ${originalIndex !== -1 ? `
                    <button class="btn btn-sm btn-primary" onclick="editProduct(${originalIndex})" title="تعديل">تعديل</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteProduct(${originalIndex})" title="حذف">حذف</button>
                    ` : '<span class="text-muted small">N/A</span>'}
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = tableContent;
}

function deleteProduct(i) {
    if (i >= 0 && i < productData.length) {
        const productTitle = productData[i].title || 'هذا المنتج';
         if(confirm(`هل أنت متأكد من حذف "${productTitle}"؟`)) {
            productData.splice(i, 1);
            saveData();
            showProducts();
            showAlert(`تم حذف "${productTitle}" بنجاح`, 'success');
        }
    } else {
         showAlert('خطأ: مؤشر المنتج غير صالح للحذف.', 'danger');
    }
}

function editProduct(i) {
     if (i >= 0 && i < productData.length) {
        mode = 'update';
        tmp = i;

        const product = productData[i];
        title.value = product.title || '';
        price.value = product.price || '';
        taxes.value = product.taxes || '';
        ads.value = product.ads || '';
        discount.value = product.discount || '';
        category.value = product.category || '';
        count.value = 1;
        count.disabled = true;

        calculateTotal();
        submitBtn.innerHTML = 'تحديث المنتج';

        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        title.focus(); // Focus on title field for editing
     } else {
         showAlert('خطأ: مؤشر المنتج غير صالح للتعديل.', 'danger');
         mode = 'create'; // Reset mode if index is invalid
         tmp = undefined;
     }
}

deleteAllBtn.addEventListener('click', function() {
    if (productData.length === 0) return;

    if(confirm(`هل أنت متأكد من حذف جميع المنتجات (${productData.length})؟ لا يمكن التراجع عن هذا الإجراء.`)) {
        productData = [];
        saveData();
        showProducts();
        showAlert('تم حذف جميع المنتجات بنجاح', 'success');
    }
});

searchInput.addEventListener('input', function() {
    const searchValue = this.value.trim().toLowerCase();
    let searchResult = productData;

    if(searchValue) {
        const searchTypeElement = document.querySelector('input[name="searchType"]:checked');
        const searchType = searchTypeElement ? searchTypeElement.id : 'searchAll'; // Default to searchAll if somehow null

        if(searchType === 'searchTitle') {
            searchResult = productData.filter(item =>
                item.title && item.title.toLowerCase().includes(searchValue)
            );
        } else if(searchType === 'searchCategory') {
            searchResult = productData.filter(item =>
                item.category && item.category.toLowerCase().includes(searchValue)
            );
        } else {
            searchResult = productData.filter(item =>
                (item.title && item.title.toLowerCase().includes(searchValue)) ||
                (item.category && item.category.toLowerCase().includes(searchValue))
            );
        }
    }
    showProducts(searchResult);
});

document.querySelectorAll('input[name="searchType"]').forEach(radio => {
    radio.addEventListener('change', function() {
        searchInput.dispatchEvent(new Event('input'));
    });
});

function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) {
         console.warn("Alert container not found. Message:", message);
         return;
    }

    const alertId = `alert-${Date.now()}`;
    const alertDiv = document.createElement('div');
    alertDiv.id = alertId;
    alertDiv.className = `alert alert-${type} alert-dismissible fade show m-2`;
    alertDiv.setAttribute('role', 'alert');
    alertDiv.style.display = 'flex'; // Use flex for better alignment
    alertDiv.style.justifyContent = 'space-between';
    alertDiv.style.alignItems = 'center';
    alertDiv.innerHTML = `
        <span>${message}</span>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close" style="margin-left: 0.5rem;"></button>
    `; // Added span for message content

    alertContainer.prepend(alertDiv); // Add new alerts to the top

    // Auto remove using Bootstrap's API if available
     if (typeof bootstrap !== 'undefined' && bootstrap.Alert) {
         setTimeout(() => {
             const currentAlert = document.getElementById(alertId);
             if(currentAlert){
                const bsAlertInstance = bootstrap.Alert.getOrCreateInstance(currentAlert);
                if(bsAlertInstance) {
                    bsAlertInstance.close();
                } else {
                     currentAlert.remove(); // Fallback if instance couldn't be created
                }
             }
         }, 3500); // Slightly longer duration
     } else {
         // Fallback manual removal
         setTimeout(() => {
             const currentAlert = document.getElementById(alertId);
             if (currentAlert) {
                currentAlert.classList.remove('show');
                currentAlert.addEventListener('transitionend', () => currentAlert.remove(), { once: true });
                setTimeout(() => currentAlert.remove(), 3650); // Failsafe
             }
         }, 3500);
     }
}