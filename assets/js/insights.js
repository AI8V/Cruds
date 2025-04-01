/**
 * تحليلات المنتجات الذكية - يقدم رؤى وتوصيات تلقائية للمنتجات
 * يحلل البيانات ويقترح تحسينات للأسعار والمخزون والتصنيفات
 */
(function() {
    // إضافة زر التحليلات إلى الواجهة
    function addInsightsButton() {
        const insightsBtn = document.createElement('button');
        insightsBtn.className = 'btn btn-primary btn-sm me-2';
        insightsBtn.innerHTML = '<i class="fas fa-lightbulb"></i> تحليلات ذكية';
        insightsBtn.addEventListener('click', generateInsights);
        
        // إضافة الزر بجانب أزرار التصدير
        const deleteAllBtn = document.getElementById('deleteAllBtn');
        if (deleteAllBtn) deleteAllBtn.parentNode.insertBefore(insightsBtn, deleteAllBtn);
        
        // إضافة عنصر لعرض التحليلات
        const insightsPanel = document.createElement('div');
        insightsPanel.id = 'insightsPanel';
        insightsPanel.className = 'card shadow-sm mt-4 d-none';
        insightsPanel.innerHTML = `
            <div class="card-header bg-primary text-white">
                <h3 class="h5 mb-0">تحليلات المنتجات والتوصيات</h3>
            </div>
            <div class="card-body" id="insightsContent"></div>
        `;
        
        const container = document.querySelector('.container');
        container.appendChild(insightsPanel);
    }
    
    // توليد التحليلات والتوصيات
    function generateInsights() {
        const productData = JSON.parse(localStorage.getItem('productData')) || [];
        if (productData.length < 3) {
            showInsights('<div class="alert alert-warning">يجب إضافة ٣ منتجات على الأقل للحصول على تحليلات دقيقة</div>');
            return;
        }
        
        // تحليل البيانات
        const categories = {};
        let totalProfit = 0;
        let highestMargin = { value: 0, product: null };
        let lowestMargin = { value: Infinity, product: null };
        
        productData.forEach(product => {
            // حساب هامش الربح (بافتراض أن السعر هو سعر البيع والتكلفة هي السعر - الربح)
            const costEstimate = product.price - (product.price * 0.2); // افتراض هامش ربح 20%
            const profitMargin = ((product.price - costEstimate) / product.price) * 100;
            
            // تجميع حسب الفئة
            if (product.category) {
                if (!categories[product.category]) {
                    categories[product.category] = { count: 0, totalPrice: 0 };
                }
                categories[product.category].count++;
                categories[product.category].totalPrice += parseFloat(product.price);
            }
            
            // تتبع أعلى وأقل هامش ربح
            if (profitMargin > highestMargin.value) {
                highestMargin = { value: profitMargin, product: product };
            }
            if (profitMargin < lowestMargin.value) {
                lowestMargin = { value: profitMargin, product: product };
            }
            
            totalProfit += parseFloat(product.price) * 0.2; // افتراض الربح 20% من السعر
        });
        
        // إنشاء التوصيات
        let recommendations = [];
        
        // تحديد الفئة الأكثر ربحية
        let mostProfitableCategory = { category: null, avgPrice: 0 };
        for (const [cat, data] of Object.entries(categories)) {
            const avgPrice = data.totalPrice / data.count;
            if (avgPrice > mostProfitableCategory.avgPrice) {
                mostProfitableCategory = { category: cat, avgPrice: avgPrice };
            }
        }
        
        // إضافة التوصيات بناءً على التحليل
        if (mostProfitableCategory.category) {
            recommendations.push(`زيادة مخزون منتجات فئة "${mostProfitableCategory.category}" حيث أنها الأكثر ربحية بمتوسط سعر ${mostProfitableCategory.avgPrice.toFixed(2)}`);
        }
        
        if (lowestMargin.product) {
            recommendations.push(`مراجعة تسعير المنتج "${lowestMargin.product.title}" لتحسين هامش الربح أو تقليل التكاليف المرتبطة به`);
        }
        
        if (productData.filter(p => !p.category).length > 0) {
            recommendations.push(`تصنيف جميع المنتجات التي لا تحتوي على فئة لتحسين التنظيم والتحليل`);
        }
        
        // إظهار النتائج
        const insightsHTML = `
            <div class="mb-4">
                <h4 class="text-primary">ملخص البيانات:</h4>
                <ul class="list-group mb-3">
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        إجمالي المنتجات
                        <span class="badge bg-primary rounded-pill">${productData.length}</span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        عدد الفئات
                        <span class="badge bg-primary rounded-pill">${Object.keys(categories).length}</span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        إجمالي الأرباح المتوقعة
                        <span class="badge bg-success rounded-pill">${totalProfit.toFixed(2)}</span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        المنتج الأعلى ربحية
                        <span class="badge bg-info">${highestMargin.product?.title || '-'}</span>
                    </li>
                </ul>
            </div>
            
            <div>
                <h4 class="text-primary">توصيات لتحسين الأعمال:</h4>
                <div class="alert alert-info">
                    <ul class="mb-0">
                        ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
        
        showInsights(insightsHTML);
    }
    
    // عرض التحليلات في اللوحة
    function showInsights(content) {
        const panel = document.getElementById('insightsPanel');
        const contentDiv = document.getElementById('insightsContent');
        
        contentDiv.innerHTML = content;
        panel.classList.remove('d-none');
        
        // التمرير إلى القسم
        panel.scrollIntoView({ behavior: 'smooth' });
    }
    
    // إضافة دالة مساعدة لعرض الإشعارات (تم استخدامها أعلاه)
    function showAlert(message, type) {
        // استخدام دالة showAlert الموجودة في الملف الرئيسي
        if (window.showAlert) {
            window.showAlert(message, type);
        } else {
            alert(message);
        }
    }
    
    // تنفيذ الميزة عند تحميل الصفحة
    window.addEventListener('load', addInsightsButton);
})();