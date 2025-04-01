// Product Management System - Optimized JavaScript
(() => {
    'use strict';
    
    // DOM Elements - cached for performance
    const elements = {
        form: document.getElementById('productForm'),
        productId: document.getElementById('productId'),
        title: document.getElementById('title'),
        price: document.getElementById('price'),
        taxes: document.getElementById('taxes'),
        ads: document.getElementById('ads'),
        discount: document.getElementById('discount'),
        total: document.getElementById('total'),
        count: document.getElementById('count'),
        category: document.getElementById('category'),
        submitBtn: document.getElementById('submitBtn'),
        clearBtn: document.getElementById('clearBtn'),
        searchInput: document.getElementById('searchInput'),
        searchAll: document.getElementById('searchAll'),
        searchTitle: document.getElementById('searchTitle'),
        searchCategory: document.getElementById('searchCategory'),
        deleteAllBtn: document.getElementById('deleteAllBtn'),
        productCount: document.getElementById('productCount'),
        productTable: document.getElementById('productTable'),
        calcInputs: document.querySelectorAll('.calc-input'),
        alertContainer: document.getElementById('alertContainer')
    };
    
    // Application state
    let state = {
        products: JSON.parse(localStorage.getItem('products')) || [],
        currentIndex: null,
        editMode: false
    };
    
    // Helper functions
    const helpers = {
        calculateTotal() {
            const price = parseFloat(elements.price.value) || 0;
            const taxes = parseFloat(elements.taxes.value) || 0;
            const ads = parseFloat(elements.ads.value) || 0;
            const discount = parseFloat(elements.discount.value) || 0;
            
            const total = price + taxes + ads - discount;
            elements.total.textContent = `السعر الإجمالي: ${total.toFixed(2)}`;
            
            elements.total.classList.toggle('text-success', total > 0);
            elements.total.classList.toggle('text-danger', total <= 0);
        },
        
        showAlert(message, type = 'info') {
            const alertId = `alert-${Date.now()}`;
            
            const alertHTML = `
                <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show" role="alert">
                    ${message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            `;
            
            elements.alertContainer.insertAdjacentHTML('beforeend', alertHTML);
            
            // Remove alert after 3 seconds
            setTimeout(() => {
                const alertElement = document.getElementById(alertId);
                if (alertElement) {
                    alertElement.classList.remove('show');
                    setTimeout(() => alertElement.remove(), 300);
                }
            }, 3000);
        },
        
        saveToStorage() {
            try {
                localStorage.setItem('products', JSON.stringify(state.products));
            } catch (e) {
                helpers.showAlert('حدث خطأ أثناء حفظ البيانات', 'danger');
                console.error('Storage error:', e);
            }
        }
    };
    
    // Core functions
    const app = {
        init() {
            app.displayProducts();
            app.updateProductCount();
            helpers.calculateTotal();
            app.setupEventListeners();
        },
        
        createProduct(e) {
            e.preventDefault();
            
            // Validate data
            if (!elements.title.value || !elements.price.value) {
                helpers.showAlert('يرجى إدخال اسم المنتج والسعر على الأقل', 'danger');
                return;
            }
            
            // Calculate total price
            const price = parseFloat(elements.price.value) || 0;
            const taxes = parseFloat(elements.taxes.value) || 0;
            const ads = parseFloat(elements.ads.value) || 0;
            const discount = parseFloat(elements.discount.value) || 0;
            const total = price + taxes + ads - discount;
            
            // Create product object
            const product = {
                title: elements.title.value.trim(),
                price,
                taxes,
                ads,
                discount,
                total,
                category: elements.category.value.trim() || 'بدون فئة'
            };
            
            // Update or create products
            if (state.editMode) {
                state.products[state.currentIndex] = product;
                helpers.showAlert('تم تحديث المنتج بنجاح', 'success');
                state.editMode = false;
                elements.submitBtn.textContent = 'إنشاء منتج جديد';
            } else {
                const count = parseInt(elements.count.value) || 1;
                
                if (count > 1) {
                    for (let i = 0; i < count; i++) {
                        state.products.push({...product});
                    }
                    helpers.showAlert(`تم إنشاء ${count} منتجات بنجاح`, 'success');
                } else {
                    state.products.push(product);
                    helpers.showAlert('تم إنشاء المنتج بنجاح', 'success');
                }
            }
            
            // Save data and refresh display
            helpers.saveToStorage();
            app.displayProducts();
            app.updateProductCount();
            app.clearForm();
        },
        
        displayProducts(products = state.products) {
            if (products.length === 0) {
                elements.productTable.innerHTML = `
                    <tr class="text-center">
                        <td colspan="9" class="py-4 text-muted">لا توجد منتجات لعرضها</td>
                    </tr>
                `;
                elements.deleteAllBtn.disabled = true;
                return;
            }
            
            elements.deleteAllBtn.disabled = false;
            
            // Use document fragment for better performance
            const fragment = document.createDocumentFragment();
            
            products.forEach((product, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${product.title}</td>
                    <td>${product.price.toFixed(2)}</td>
                    <td>${product.taxes.toFixed(2)}</td>
                    <td>${product.ads.toFixed(2)}</td>
                    <td>${product.discount.toFixed(2)}</td>
                    <td class="fw-bold">${product.total.toFixed(2)}</td>
                    <td>${product.category}</td>
                    <td class="table-actions">
                        <button class="btn btn-sm btn-outline-primary update-btn" data-index="${index}">
                            <i class="bi bi-pencil"></i> تعديل
                        </button>
                        <button class="btn btn-sm btn-outline-danger ms-1 delete-btn" data-index="${index}">
                            <i class="bi bi-trash"></i> حذف
                        </button>
                    </td>
                `;
                fragment.appendChild(row);
            });
            
            elements.productTable.innerHTML = '';
            elements.productTable.appendChild(fragment);
            
            // Use event delegation instead of adding event listeners to each button
            elements.productTable.addEventListener('click', app.handleTableActions);
        },
        
        handleTableActions(e) {
            const target = e.target.closest('button');
            if (!target) return;
            
            const index = parseInt(target.dataset.index);
            
            if (target.classList.contains('update-btn')) {
                app.updateProduct(index);
            } else if (target.classList.contains('delete-btn')) {
                app.deleteProduct(index);
            }
        },
        
        updateProductCount() {
            elements.productCount.textContent = `عدد المنتجات: ${state.products.length}`;
        },
        
        updateProduct(index) {
            const product = state.products[index];
            
            elements.title.value = product.title;
            elements.price.value = product.price;
            elements.taxes.value = product.taxes;
            elements.ads.value = product.ads;
            elements.discount.value = product.discount;
            elements.category.value = product.category === 'بدون فئة' ? '' : product.category;
            elements.count.value = 1;
            
            helpers.calculateTotal();
            
            elements.submitBtn.textContent = 'تحديث المنتج';
            state.currentIndex = index;
            state.editMode = true;
            
            // Scroll to form
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        },
        
        deleteProduct(index) {
            if (confirm(`هل أنت متأكد من حذف المنتج "${state.products[index].title}"؟`)) {
                state.products.splice(index, 1);
                helpers.saveToStorage();
                app.displayProducts();
                app.updateProductCount();
                helpers.showAlert('تم حذف المنتج بنجاح', 'success');
            }
        },
        
        deleteAllProducts() {
            if (state.products.length === 0) return;
            
            if (confirm(`هل أنت متأكد من حذف جميع المنتجات (${state.products.length})؟`)) {
                state.products = [];
                helpers.saveToStorage();
                app.displayProducts();
                app.updateProductCount();
                helpers.showAlert('تم حذف جميع المنتجات بنجاح', 'success');
            }
        },
        
        searchProducts() {
            const searchText = elements.searchInput.value.trim().toLowerCase();
            
            if (!searchText) {
                app.displayProducts(state.products);
                return;
            }
            
            let filteredProducts;
            
            if (elements.searchTitle.checked) {
                filteredProducts = state.products.filter(product => 
                    product.title.toLowerCase().includes(searchText)
                );
            } else if (elements.searchCategory.checked) {
                filteredProducts = state.products.filter(product => 
                    product.category.toLowerCase().includes(searchText)
                );
            } else {
                filteredProducts = state.products.filter(product => 
                    product.title.toLowerCase().includes(searchText) || 
                    product.category.toLowerCase().includes(searchText)
                );
            }
            
            app.displayProducts(filteredProducts);
        },
        
        clearForm() {
            elements.form.reset();
            helpers.calculateTotal();
            state.editMode = false;
            elements.submitBtn.textContent = 'إنشاء منتج جديد';
        },
        
        setupEventListeners() {
            // Use passive event listeners where possible for better performance
            elements.calcInputs.forEach(input => {
                input.addEventListener('input', helpers.calculateTotal, { passive: true });
            });
            
            elements.form.addEventListener('submit', app.createProduct);
            elements.clearBtn.addEventListener('click', app.clearForm);
            elements.searchInput.addEventListener('input', app.searchProducts, { passive: true });
            elements.searchAll.addEventListener('change', app.searchProducts, { passive: true });
            elements.searchTitle.addEventListener('change', app.searchProducts, { passive: true });
            elements.searchCategory.addEventListener('change', app.searchProducts, { passive: true });
            elements.deleteAllBtn.addEventListener('click', app.deleteAllProducts);
            
            // Replace unload with pagehide
            window.addEventListener('pagehide', helpers.saveToStorage);
        }
    };
    
    // Initialize the application when DOM is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', app.init);
    } else {
        app.init();
    }
})();