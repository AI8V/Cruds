/**
 * التوصيات الذكية للعملاء - يقدم اقتراحات للمنتجات المناسبة لكل عميل
 * يعتمد على تحليل تفضيلات العميل وأنماط الشراء لتقديم توصيات شخصية
 */
(function() {
    // إضافة زر التوصيات الذكية للعملاء
    function addSmartRecommendationsButton() {
        const recommendBtn = document.createElement('button');
        recommendBtn.className = 'btn btn-success btn-sm me-2';
        recommendBtn.innerHTML = '<i class="fas fa-user-check"></i> توصيات للعملاء';
        recommendBtn.addEventListener('click', showRecommendationsPanel);
        
        // إضافة الزر بجانب الأزرار الأخرى
        const deleteAllBtn = document.getElementById('deleteAllBtn');
        if (deleteAllBtn) deleteAllBtn.parentNode.insertBefore(recommendBtn, deleteAllBtn);
        
        // إضافة نموذج للتوصيات
        addRecommendationsForm();
    }
    
    // إضافة نموذج لإدخال بيانات العميل والتفضيلات
    function addRecommendationsForm() {
        const formHTML = `
            <div class="modal fade" id="recommendationsModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header bg-success text-white">
                            <h5 class="modal-title">التوصيات الذكية للعملاء</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <label class="form-label">اسم العميل</label>
                                <input type="text" id="customerName" class="form-control" placeholder="أدخل اسم العميل">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">الميزانية المتاحة</label>
                                <input type="number" id="customerBudget" class="form-control" placeholder="أدخل الميزانية المتاحة">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">الفئات المفضلة</label>
                                <select id="customerPreferredCategories" class="form-select" multiple>
                                    <!-- سيتم ملؤها ديناميكيًا -->
                                </select>
                            </div>
                            <button type="button" id="generateRecommendationsBtn" class="btn btn-success w-100">
                                <i class="fas fa-magic"></i> توليد التوصيات
                            </button>
                        </div>
                        <div class="modal-footer d-none" id="recommendationsResult">
                            <div class="w-100" id="recommendationsContent"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // إضافة النموذج إلى الصفحة
        document.body.insertAdjacentHTML('beforeend', formHTML);
        
        // إضافة معالج الحدث لزر توليد التوصيات
        document.getElementById('generateRecommendationsBtn').addEventListener('click', generateRecommendations);
    }
    
    // عرض نافذة التوصيات
    function showRecommendationsPanel() {
        // الحصول على المنتجات
        const productData = JSON.parse(localStorage.getItem('productData')) || [];
        
        if (productData.length < 3) {
            showAlert('يجب توفر ٣ منتجات على الأقل لإنشاء توصيات دقيقة', 'warning');
            return;
        }
        
        // استخراج جميع الفئات الفريدة
        const categories = new Set();
        productData.forEach(product => {
            if (product.category) categories.add(product.category);
        });
        
        // ملء قائمة الفئات في النموذج
        const categorySelect = document.getElementById('customerPreferredCategories');
        categorySelect.innerHTML = '';
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
        
        // عرض النافذة
        const modal = new bootstrap.Modal(document.getElementById('recommendationsModal'));
        modal.show();
        
        // إعادة تعيين نتائج التوصيات
        document.getElementById('recommendationsResult').classList.add('d-none');
    }
    
    // توليد التوصيات بناءً على بيانات العميل
    function generateRecommendations() {
        const customerName = document.getElementById('customerName').value.trim();
        const budget = parseFloat(document.getElementById('customerBudget').value) || 0;
        
        // الحصول على الفئات المفضلة المحددة
        const categorySelect = document.getElementById('customerPreferredCategories');
        const preferredCategories = Array.from(categorySelect.selectedOptions).map(option => option.value);
        
        // التحقق من صحة البيانات
        if (!customerName || budget <= 0) {
            showAlert('الرجاء إدخال اسم العميل والميزانية المتاحة', 'warning');
            return;
        }
        
        // الحصول على بيانات المنتجات
        const productData = JSON.parse(localStorage.getItem('productData')) || [];
        
        // اختيار المنتجات المناسبة للعميل
        let recommendedProducts = [];
        
        // إذا تم تحديد فئات مفضلة، فقم بتصفية المنتجات بناءً عليها
        if (preferredCategories.length > 0) {
            const filteredProducts = productData.filter(product => 
                preferredCategories.includes(product.category)
            );
            
            // ترتيب المنتجات حسب القيمة مقابل السعر (نسبة افتراضية للجودة)
            recommendedProducts = filteredProducts
                .filter(product => parseFloat(product.price) <= budget)
                .sort((a, b) => {
                    // ترتيب حسب القيمة المفترضة (سعر أقل = أفضل)
                    return parseFloat(a.price) - parseFloat(b.price);
                })
                .slice(0, 3); // أفضل 3 منتجات
        } else {
            // إذا لم يتم تحديد فئات، فاستخدم جميع المنتجات ضمن الميزانية
            recommendedProducts = productData
                .filter(product => parseFloat(product.price) <= budget)
                .sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
                .slice(0, 3);
        }
        
        // إنشاء مجموعة منتجات تكميلية (منتجات مختلفة الفئات)
        const complementaryProducts = findComplementaryProducts(recommendedProducts, productData, budget);
        
        // عرض النتائج
        displayRecommendations(customerName, recommendedProducts, complementaryProducts, budget);
    }
    
    // البحث عن منتجات تكميلية (من فئات مختلفة)
    function findComplementaryProducts(recommendedProducts, allProducts, budget) {
        const recommendedCategories = new Set(recommendedProducts.map(p => p.category));
        const recommendedIds = new Set(recommendedProducts.map(p => p.id));
        
        // حساب الميزانية المتبقية
        const usedBudget = recommendedProducts.reduce((sum, product) => sum + parseFloat(product.price), 0);
        const remainingBudget = budget - usedBudget;
        
        // البحث عن منتجات تكميلية من فئات أخرى
        return allProducts
            .filter(product => 
                !recommendedIds.has(product.id) && 
                !recommendedCategories.has(product.category) &&
                parseFloat(product.price) <= remainingBudget
            )
            .sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
            .slice(0, 2); // أفضل منتجين تكميليين
    }
    
    // عرض التوصيات في النافذة
    function displayRecommendations(customerName, recommendedProducts, complementaryProducts, budget) {
        const resultSection = document.getElementById('recommendationsResult');
        const contentDiv = document.getElementById('recommendationsContent');
        
        // حساب إجمالي التكلفة
        const totalCost = [...recommendedProducts, ...complementaryProducts]
            .reduce((sum, product) => sum + parseFloat(product.price), 0);
        
        // إنشاء HTML للنتائج
        let html = `
            <div class="text-center mb-3">
                <h5>توصيات مخصصة للعميل: ${customerName}</h5>
                <p class="text-muted">الميزانية: ${budget} | التكلفة الإجمالية: ${totalCost.toFixed(2)}</p>
            </div>
        `;
        
        // إضافة المنتجات الموصى بها
        if (recommendedProducts.length > 0) {
            html += `
                <h6 class="text-success mb-2"><i class="fas fa-thumbs-up"></i> المنتجات الأنسب</h6>
                <div class="list-group mb-3">
                    ${recommendedProducts.map(product => `
                        <div class="list-group-item list-group-item-action">
                            <div class="d-flex w-100 justify-content-between">
                                <h6 class="mb-1">${product.title}</h6>
                                <small class="text-primary">${parseFloat(product.price).toFixed(2)}</small>
                            </div>
                            <small class="text-muted">الفئة: ${product.category || 'غير مصنف'}</small>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            html += `<div class="alert alert-warning">لا توجد منتجات مناسبة ضمن الميزانية</div>`;
        }
        
        // إضافة المنتجات التكميلية
        if (complementaryProducts.length > 0) {
            html += `
                <h6 class="text-info mb-2"><i class="fas fa-plus-circle"></i> منتجات تكميلية مقترحة</h6>
                <div class="list-group">
                    ${complementaryProducts.map(product => `
                        <div class="list-group-item list-group-item-action">
                            <div class="d-flex w-100 justify-content-between">
                                <h6 class="mb-1">${product.title}</h6>
                                <small class="text-primary">${parseFloat(product.price).toFixed(2)}</small>
                            </div>
                            <small class="text-muted">الفئة: ${product.category || 'غير مصنف'}</small>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        // إضافة زر لإنشاء تقرير قابل للطباعة
        html += `
            <button class="btn btn-outline-success w-100 mt-3" onclick="window.print()">
                <i class="fas fa-print"></i> طباعة التوصيات
            </button>
        `;
        
        // عرض النتائج
        contentDiv.innerHTML = html;
        resultSection.classList.remove('d-none');
    }
    
    // دالة مساعدة لعرض الإشعارات
    function showAlert(message, type) {
        if (window.showAlert) {
            window.showAlert(message, type);
        } else {
            alert(message);
        }
    }
    
    // تنفيذ الميزة عند تحميل الصفحة
    window.addEventListener('load', addSmartRecommendationsButton);
})();