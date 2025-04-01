        // تخزين المنتجات في localStorage
        let productsData = JSON.parse(localStorage.getItem('products')) || [];
        let currentIndex = null;
        let editMode = false;
        
        // عناصر DOM
        const productForm = document.getElementById('productForm');
        const productId = document.getElementById('productId');
        const titleInput = document.getElementById('title');
        const priceInput = document.getElementById('price');
        const taxesInput = document.getElementById('taxes');
        const adsInput = document.getElementById('ads');
        const discountInput = document.getElementById('discount');
        const totalElement = document.getElementById('total');
        const countInput = document.getElementById('count');
        const categoryInput = document.getElementById('category');
        const submitBtn = document.getElementById('submitBtn');
        const clearBtn = document.getElementById('clearBtn');
        const searchInput = document.getElementById('searchInput');
        const searchAll = document.getElementById('searchAll');
        const searchTitle = document.getElementById('searchTitle');
        const searchCategory = document.getElementById('searchCategory');
        const deleteAllBtn = document.getElementById('deleteAllBtn');
        const productCountElement = document.getElementById('productCount');
        const productTable = document.getElementById('productTable');
        const calcInputs = document.querySelectorAll('.calc-input');
        
        // حساب السعر الإجمالي
        function calculateTotal() {
            const price = parseFloat(priceInput.value) || 0;
            const taxes = parseFloat(taxesInput.value) || 0;
            const ads = parseFloat(adsInput.value) || 0;
            const discount = parseFloat(discountInput.value) || 0;
            
            const total = price + taxes + ads - discount;
            totalElement.textContent = `السعر الإجمالي: ${total.toFixed(2)}`;
            
            if (total > 0) {
                totalElement.classList.add('text-success');
                totalElement.classList.remove('text-danger');
            } else {
                totalElement.classList.add('text-danger');
                totalElement.classList.remove('text-success');
            }
        }
        
        // إضافة منتج جديد
        function createProduct(e) {
            e.preventDefault();
            
            // التحقق من البيانات
            if (!titleInput.value || !priceInput.value) {
                showAlert('يرجى إدخال اسم المنتج والسعر على الأقل', 'danger');
                return;
            }
            
            // حساب السعر الإجمالي
            const price = parseFloat(priceInput.value) || 0;
            const taxes = parseFloat(taxesInput.value) || 0;
            const ads = parseFloat(adsInput.value) || 0;
            const discount = parseFloat(discountInput.value) || 0;
            const total = price + taxes + ads - discount;
            
            // إنشاء كائن المنتج
            const product = {
                title: titleInput.value.trim(),
                price: price,
                taxes: taxes,
                ads: ads,
                discount: discount,
                total: total,
                category: categoryInput.value.trim() || 'بدون فئة'
            };
            
            // وضع المنتج في المصفوفة
            if (editMode) {
                // تحديث منتج موجود
                productsData[currentIndex] = product;
                showAlert('تم تحديث المنتج بنجاح', 'success');
                editMode = false;
                submitBtn.textContent = 'إنشاء منتج جديد';
            } else {
                // إنشاء منتجات جديدة
                const count = parseInt(countInput.value) || 1;
                
                if (count > 1) {
                    for (let i = 0; i < count; i++) {
                        productsData.push({...product});
                    }
                    showAlert(`تم إنشاء ${count} منتجات بنجاح`, 'success');
                } else {
                    productsData.push(product);
                    showAlert('تم إنشاء المنتج بنجاح', 'success');
                }
            }
            
            // حفظ البيانات وإعادة عرض المنتجات
            saveAndDisplayProducts();
            clearForm();
        }
        
        // حفظ البيانات وإعادة عرض المنتجات
        function saveAndDisplayProducts() {
            localStorage.setItem('products', JSON.stringify(productsData));
            displayProducts(productsData);
            updateProductCount();
        }
        
        // عرض المنتجات في الجدول
        function displayProducts(products) {
            if (products.length === 0) {
                productTable.innerHTML = `
                    <tr class="text-center">
                        <td colspan="9" class="py-4 text-muted">لا توجد منتجات لعرضها</td>
                    </tr>
                `;
                deleteAllBtn.disabled = true;
                return;
            }
            
            deleteAllBtn.disabled = false;
            productTable.innerHTML = '';
            
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
                productTable.appendChild(row);
            });
            
            // إضافة مستمعي الأحداث للأزرار
            document.querySelectorAll('.update-btn').forEach(btn => {
                btn.addEventListener('click', updateProduct);
            });
            
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', deleteProduct);
            });
        }
        
        // تحديث عدد المنتجات
        function updateProductCount() {
            productCountElement.textContent = `عدد المنتجات: ${productsData.length}`;
        }
        
        // تحديث منتج
        function updateProduct() {
            const index = parseInt(this.dataset.index);
            const product = productsData[index];
            
            titleInput.value = product.title;
            priceInput.value = product.price;
            taxesInput.value = product.taxes;
            adsInput.value = product.ads;
            discountInput.value = product.discount;
            categoryInput.value = product.category === 'بدون فئة' ? '' : product.category;
            countInput.value = 1;
            
            calculateTotal();
            
            submitBtn.textContent = 'تحديث المنتج';
            currentIndex = index;
            editMode = true;
            
            // التمرير إلى نموذج الإدخال
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
        
        // حذف منتج
        function deleteProduct() {
            const index = parseInt(this.dataset.index);
            
            if (confirm(`هل أنت متأكد من حذف المنتج "${productsData[index].title}"؟`)) {
                productsData.splice(index, 1);
                saveAndDisplayProducts();
                showAlert('تم حذف المنتج بنجاح', 'success');
            }
        }
        
        // حذف جميع المنتجات
        function deleteAllProducts() {
            if (productsData.length === 0) return;
            
            if (confirm(`هل أنت متأكد من حذف جميع المنتجات (${productsData.length})؟`)) {
                productsData = [];
                saveAndDisplayProducts();
                showAlert('تم حذف جميع المنتجات بنجاح', 'success');
            }
        }
        
        // البحث عن المنتجات
        function searchProducts() {
            const searchText = searchInput.value.trim().toLowerCase();
            
            if (!searchText) {
                displayProducts(productsData);
                return;
            }
            
            let filteredProducts;
            
            if (searchTitle.checked) {
                filteredProducts = productsData.filter(product => 
                    product.title.toLowerCase().includes(searchText)
                );
            } else if (searchCategory.checked) {
                filteredProducts = productsData.filter(product => 
                    product.category.toLowerCase().includes(searchText)
                );
            } else {
                filteredProducts = productsData.filter(product => 
                    product.title.toLowerCase().includes(searchText) || 
                    product.category.toLowerCase().includes(searchText)
                );
            }
            
            displayProducts(filteredProducts);
        }
        
        // مسح النموذج
        function clearForm() {
            productForm.reset();
            calculateTotal();
            editMode = false;
            submitBtn.textContent = 'إنشاء منتج جديد';
        }
        
        // عرض تنبيه
        function showAlert(message, type = 'info') {
            const alertContainer = document.getElementById('alertContainer');
            const alertId = `alert-${Date.now()}`;
            
            const alertHTML = `
                <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show" role="alert">
                    ${message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            `;
            
            alertContainer.innerHTML += alertHTML;
            
            // إزالة التنبيه بعد 3 ثوانٍ
            setTimeout(() => {
                const alertElement = document.getElementById(alertId);
                if (alertElement) {
                    alertElement.classList.remove('show');
                    setTimeout(() => alertElement.remove(), 300);
                }
            }, 3000);
        }
        
        // مستمعو الأحداث
        window.addEventListener('load', () => {
            displayProducts(productsData);
            updateProductCount();
            calculateTotal();
        });
        
        calcInputs.forEach(input => {
            input.addEventListener('input', calculateTotal);
        });
        
        productForm.addEventListener('submit', createProduct);
        clearBtn.addEventListener('click', clearForm);
        searchInput.addEventListener('input', searchProducts);
        searchAll.addEventListener('change', searchProducts);
        searchTitle.addEventListener('change', searchProducts);
        searchCategory.addEventListener('change', searchProducts);
        deleteAllBtn.addEventListener('click', deleteAllProducts);

