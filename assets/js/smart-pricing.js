/**
 * اقتراحات التسعير الذكية - يقدم اقتراحات آلية لتسعير المنتجات الجديدة
 * يعتمد على تحليل الفئات والمنتجات الحالية لتحديد السعر الأمثل
 */
(function() {
    // إضافة زر الاقتراح الذكي للسعر
    function addSmartPricingButton() {
        const priceField = document.getElementById('price');
        if (!priceField) return;
        
        // إنشاء زر بجانب حقل السعر
        const smartPriceBtn = document.createElement('button');
        smartPriceBtn.className = 'btn btn-info btn-sm mt-2';
        smartPriceBtn.type = 'button';
        smartPriceBtn.innerHTML = 'اقتراح سعر ذكي <i class="fas fa-magic"></i>';
        smartPriceBtn.addEventListener('click', suggestOptimalPrice);
        
        // إضافة الزر بعد حقل السعر
        priceField.parentNode.appendChild(smartPriceBtn);
    }
    
    // اقتراح السعر الأمثل
    function suggestOptimalPrice() {
        const productData = JSON.parse(localStorage.getItem('productData')) || [];
        const categoryField = document.getElementById('category');
        const priceField = document.getElementById('price');
        
        if (!categoryField || !categoryField.value || productData.length < 2) {
            showAlert('أدخل الفئة أولاً أو أضف المزيد من المنتجات للحصول على اقتراح دقيق', 'warning');
            return;
        }
        
        const category = categoryField.value.trim();
        
        // تحليل أسعار المنتجات المماثلة
        const similarProducts = productData.filter(p => p.category && p.category.includes(category));
        
        if (similarProducts.length > 0) {
            // حساب متوسط الأسعار للمنتجات المماثلة
            const avgPrice = similarProducts.reduce((sum, prod) => sum + parseFloat(prod.price), 0) / similarProducts.length;
            
            // تطبيق بعض الذكاء في التسعير (زيادة بسيطة عن المتوسط)
            const suggestedPrice = Math.round(avgPrice * (1 + Math.random() * 0.1));
            
            // تعيين السعر المقترح
            priceField.value = suggestedPrice;
            
            // تنفيذ حدث input لتحديث الإجمالي
            priceField.dispatchEvent(new Event('input'));
            
            showAlert(`تم اقتراح سعر ذكي (${suggestedPrice}) بناءً على تحليل ${similarProducts.length} منتج مشابه`, 'success');
        } else {
            showAlert('لم يتم العثور على منتجات مماثلة لهذه الفئة', 'info');
        }
    }
    
    // إضافة مؤشر جودة السعر بجانب حقل السعر
    function addPriceQualityIndicator() {
        const priceField = document.getElementById('price');
        if (!priceField) return;
        
        const indicator = document.createElement('div');
        indicator.id = 'priceQualityIndicator';
        indicator.className = 'price-quality mt-2 d-none';
        priceField.parentNode.appendChild(indicator);
        
        // تحديث مؤشر جودة السعر عند تغيير السعر
        priceField.addEventListener('input', updatePriceQuality);
    }
    
    // تحديث مؤشر جودة السعر
    function updatePriceQuality() {
        const indicator = document.getElementById('priceQualityIndicator');
        const priceField = document.getElementById('price');
        const categoryField = document.getElementById('category');
        
        if (!indicator || !priceField || !priceField.value || !categoryField || !categoryField.value) {
            if (indicator) indicator.className = 'price-quality mt-2 d-none';
            return;
        }
        
        const category = categoryField.value.trim();
        const price = parseFloat(priceField.value);
        const productData = JSON.parse(localStorage.getItem('productData')) || [];
        
        // تحليل أسعار المنتجات المماثلة
        const similarProducts = productData.filter(p => p.category && p.category.includes(category));
        
        if (similarProducts.length > 0) {
            // حساب متوسط وانحراف الأسعار
            const prices = similarProducts.map(p => parseFloat(p.price));
            const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
            
            // تحديد مدى مناسبة السعر
            let quality, message, className;
            const ratio = price / avgPrice;
            
            if (ratio < 0.7) {
                quality = 'منخفض جداً';
                message = 'السعر أقل بكثير من متوسط الفئة';
                className = 'text-danger';
            } else if (ratio < 0.9) {
                quality = 'منخفض';
                message = 'السعر أقل من متوسط الفئة';
                className = 'text-warning';
            } else if (ratio > 1.3) {
                quality = 'مرتفع جداً';
                message = 'السعر أعلى بكثير من متوسط الفئة';
                className = 'text-danger';
            } else if (ratio > 1.1) {
                quality = 'مرتفع';
                message = 'السعر أعلى من متوسط الفئة';
                className = 'text-warning';
            } else {
                quality = 'مثالي';
                message = 'السعر مناسب لهذه الفئة';
                className = 'text-success';
            }
            
            indicator.className = `price-quality mt-2 small ${className}`;
            indicator.innerHTML = `<i class="fas fa-info-circle"></i> جودة السعر: <strong>${quality}</strong> - ${message}`;
        } else {
            indicator.className = 'price-quality mt-2 d-none';
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
    
    // تنفيذ الميزة عند تحميل الصفحة
    window.addEventListener('load', function() {
        addSmartPricingButton();
        addPriceQualityIndicator();
    });
})();