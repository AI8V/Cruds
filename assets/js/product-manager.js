// Global variables
let productData = [];
let tmp;
let mode = 'create';

// DOM Elements
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

// Load products from localStorage on page load
window.onload = function() {
    if(localStorage.productData) {
        productData = JSON.parse(localStorage.productData);
        showProducts();
    }
    
    // Add event listeners to price calculation fields
    const calcInputs = document.querySelectorAll('.calc-input');
    calcInputs.forEach(input => {
        input.addEventListener('input', calculateTotal);
    });
};

// Calculate total price
function calculateTotal() {
    if(price.value) {
        let result = (+price.value + +taxes.value + +ads.value) - +discount.value;
        total.innerHTML = `<span>السعر الإجمالي: ${result}</span>`;
        total.style.backgroundColor = '#198754';
        total.style.color = 'white';
    } else {
        total.innerHTML = `<span>السعر الإجمالي: 0</span>`;
        total.style.backgroundColor = '#f8f9fa';
        total.style.color = '#198754';
    }
}

// Create new product(s)
form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    let newProduct = {
        title: title.value,
        price: price.value,
        taxes: taxes.value || 0,
        ads: ads.value || 0, 
        discount: discount.value || 0,
        total: calculateItemTotal(),
        category: category.value,
    };
    
    // Validation
    if(!title.value || !price.value) {
        showAlert('يرجى إدخال اسم المنتج والسعر على الأقل', 'danger');
        return;
    }
    
    // Update existing product
    if(mode === 'update') {
        productData[tmp] = newProduct;
        count.value = 1;
        submitBtn.innerHTML = 'إنشاء منتج جديد';
        mode = 'create';
        showAlert('تم تحديث المنتج بنجاح', 'success');
    } 
    // Create new products
    else {
        if(+count.value > 1) {
            // Create multiple products
            for(let i = 0; i < count.value; i++) {
                productData.unshift({...newProduct});
            }
            showAlert(`تم إنشاء ${count.value} منتجات بنجاح`, 'success');
        } else {
            // Create single product
            productData.unshift(newProduct);
            showAlert('تم إنشاء المنتج بنجاح', 'success');
        }
    }
    
    // Save to localStorage and clear form
    saveData();
    clearForm();
    showProducts();
});

// Calculate individual item total
function calculateItemTotal() {
    return (+price.value + +taxes.value + +ads.value) - +discount.value;
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('productData', JSON.stringify(productData));
}

// Clear form data
clearBtn.addEventListener('click', clearForm);

function clearForm() {
    form.reset();
    calculateTotal();
    mode = 'create';
    submitBtn.innerHTML = 'إنشاء منتج جديد';
}

// Show all products in table
function showProducts(items = productData) {
    if(items.length === 0) {
        productTable.innerHTML = `
            <tr class="text-center">
                <td class="text-muted py-4" colspan="9">لا توجد منتجات لعرضها</td>
            </tr>
        `;
        productCount.innerHTML = `عدد المنتجات: 0`;
        deleteAllBtn.style.display = 'none';
        return;
    }
    
    deleteAllBtn.style.display = 'block';
    productCount.innerHTML = `عدد المنتجات: ${items.length}`;
    
    let tableContent = '';
    for(let i = 0; i < items.length; i++) {
        tableContent += `
            <tr>
                <td>${i + 1}</td>
                <td>${items[i].title}</td>
                <td>${items[i].price}</td>
                <td>${items[i].taxes}</td>
                <td>${items[i].ads}</td>
                <td>${items[i].discount}</td>
                <td>${items[i].total}</td>
                <td>${items[i].category || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editProduct(${productData.indexOf(items[i])})">تعديل</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteProduct(${productData.indexOf(items[i])})">حذف</button>
                </td>
            </tr>
        `;
    }
    
    productTable.innerHTML = tableContent;
}

// Delete a single product
function deleteProduct(i) {
    if(confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
        productData.splice(i, 1);
        saveData();
        showProducts();
        showAlert('تم حذف المنتج بنجاح', 'success');
    }
}

// Edit a product
function editProduct(i) {
    mode = 'update';
    tmp = i;
    
    // Fill form with product data
    title.value = productData[i].title;
    price.value = productData[i].price;
    taxes.value = productData[i].taxes;
    ads.value = productData[i].ads;
    discount.value = productData[i].discount;
    category.value = productData[i].category;
    count.value = 1;
    
    calculateTotal();
    submitBtn.innerHTML = 'تحديث المنتج';
    
    // Scroll to form
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Delete all products
deleteAllBtn.addEventListener('click', function() {
    if(confirm(`هل أنت متأكد من حذف جميع المنتجات (${productData.length})؟`)) {
        productData = [];
        saveData();
        showProducts();
        showAlert('تم حذف جميع المنتجات بنجاح', 'success');
    }
});

// Search functionality
searchInput.addEventListener('input', function() {
    const searchValue = this.value.toLowerCase();
    let searchResult;
    
    if(searchValue) {
        if(searchTitle.checked) {
            searchResult = productData.filter(item => 
                item.title.toLowerCase().includes(searchValue)
            );
        } else if(searchCategory.checked) {
            searchResult = productData.filter(item => 
                item.category && item.category.toLowerCase().includes(searchValue)
            );
        } else {
            searchResult = productData.filter(item => 
                item.title.toLowerCase().includes(searchValue) || 
                (item.category && item.category.toLowerCase().includes(searchValue))
            );
        }
        showProducts(searchResult);
    } else {
        showProducts();
    }
});

// Search type switching
document.querySelectorAll('[name="searchType"]').forEach(radio => {
    radio.addEventListener('change', function() {
        if(searchInput.value) {
            searchInput.dispatchEvent(new Event('input'));
        }
    });
});

// Show alert message
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    const alertContainer = document.getElementById('alertContainer');
    alertContainer.appendChild(alertDiv);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => {
            alertDiv.remove();
        }, 150);
    }, 3000);
}
