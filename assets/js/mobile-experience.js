/**
 * تحسين تجربة المستخدم على الأجهزة المحمولة
 * يجعل التطبيق يشبه تطبيقات الموبايل الأصلية
 */
(function() {
    'use strict';

    // --- تكوين وثوابت ---
    const MOBILE_BREAKPOINT = 768; // نقطة فاصلة للأجهزة المحمولة (بالبكسل)
    const APP_NAME = 'نظام إدارة المنتجات';
    
    // --- متغيرات حالة التطبيق ---
    let isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    let currentView = 'list'; // 'list', 'add', 'edit', 'view'
    let isInstallable = false; // حالة إمكانية التثبيت
    let deferredPrompt; // تخزين حدث تثبيت التطبيق
    
    // --- العناصر الأساسية ---
    let mobileContainer; // حاوية واجهة الموبايل
    let mobileNavbar; // شريط التنقل السفلي
    let mobileHeader; // رأس التطبيق
    let contentContainer; // حاوية المحتوى
    
    // --- وظائف رئيسية ---
    
    /**
     * تهيئة تجربة الموبايل
     */
    function initMobileExperience() {
        // تحقق مما إذا كان الجهاز محمولاً
        checkIfMobile();
        
        // إنشاء واجهة الموبايل
        createMobileInterface();
        
        // إضافة مستمعي الأحداث
        setupEventListeners();
        
        // تهيئة التكامل مع PWA (Progressive Web App)
        initPWASupport();
        
        // إعادة ترتيب العناصر
        reorganizeContent();
        
        // تطبيق تحسينات CSS
        applyMobileCSS();
        
        // تحديث الواجهة
        updateInterface();
    }
    
    /**
     * التحقق مما إذا كان المستخدم على جهاز محمول
     */
    function checkIfMobile() {
        isMobile = window.innerWidth < MOBILE_BREAKPOINT;
        document.body.classList.toggle('is-mobile-device', isMobile);
    }
    
    /**
     * إنشاء عناصر واجهة الموبايل
     */
    function createMobileInterface() {
        // التحقق من وجود الحاوية أولاً لتجنب التكرار
        if (document.getElementById('mobileContainer')) {
            return;
        }
        
        // إنشاء حاوية التطبيق
        mobileContainer = document.createElement('div');
        mobileContainer.id = 'mobileContainer';
        mobileContainer.className = 'mobile-container d-none';
        
        // إنشاء رأس التطبيق
        mobileHeader = document.createElement('div');
        mobileHeader.id = 'mobileHeader';
        mobileHeader.className = 'mobile-header';
        mobileHeader.innerHTML = `
            <div class="header-title">${APP_NAME}</div>
            <div class="header-actions">
                <button id="installBtn" class="btn-icon d-none"><i class="fas fa-download"></i></button>
                <button id="toggleSearchBtn" class="btn-icon"><i class="fas fa-search"></i></button>
            </div>
        `;
        
        // إنشاء حاوية المحتوى
        contentContainer = document.createElement('div');
        contentContainer.id = 'mobileContent';
        contentContainer.className = 'mobile-content';
        
        // إنشاء شريط التنقل السفلي
        mobileNavbar = document.createElement('div');
        mobileNavbar.id = 'mobileNavbar';
        mobileNavbar.className = 'mobile-navbar';
        mobileNavbar.innerHTML = `
            <button data-view="list" class="nav-btn active"><i class="fas fa-list"></i><span>المنتجات</span></button>
            <button data-view="add" class="nav-btn"><i class="fas fa-plus-circle"></i><span>إضافة</span></button>
            <button data-view="dashboard" class="nav-btn"><i class="fas fa-chart-pie"></i><span>الإحصائيات</span></button>
            <button data-view="settings" class="nav-btn"><i class="fas fa-cog"></i><span>الإعدادات</span></button>
        `;
        
        // تجميع العناصر
        mobileContainer.appendChild(mobileHeader);
        mobileContainer.appendChild(contentContainer);
        mobileContainer.appendChild(mobileNavbar);
        
        // إضافة إلى DOM
        document.body.appendChild(mobileContainer);
        
        // إنشاء عنصر البحث
        createSearchOverlay();
        
        // إنشاء قائمة الإعدادات
        createSettingsView();
    }
    
    /**
     * إنشاء واجهة البحث
     */
    function createSearchOverlay() {
        const searchOverlay = document.createElement('div');
        searchOverlay.id = 'searchOverlay';
        searchOverlay.className = 'search-overlay d-none';
        searchOverlay.innerHTML = `
            <div class="search-header">
                <button id="closeSearchBtn" class="btn-icon"><i class="fas fa-arrow-right"></i></button>
                <input type="text" id="mobileSearchInput" class="form-control" placeholder="ابحث عن منتج...">
                <button id="clearSearchBtn" class="btn-icon"><i class="fas fa-times"></i></button>
            </div>
            <div class="search-filters">
                <div class="btn-group w-100" role="group">
                    <input type="radio" class="btn-check" id="mobileSearchAll" name="mobileSearchType" checked>
                    <label class="btn btn-outline-primary" for="mobileSearchAll">الكل</label>
                    
                    <input type="radio" class="btn-check" id="mobileSearchTitle" name="mobileSearchType">
                    <label class="btn btn-outline-primary" for="mobileSearchTitle">الاسم</label>
                    
                    <input type="radio" class="btn-check" id="mobileSearchCategory" name="mobileSearchType">
                    <label class="btn btn-outline-primary" for="mobileSearchCategory">الفئة</label>
                </div>
            </div>
            <div id="searchResults" class="search-results"></div>
        `;
        
        document.body.appendChild(searchOverlay);
    }
    
    /**
     * إنشاء قائمة الإعدادات
     */
    function createSettingsView() {
        const settingsView = document.createElement('div');
        settingsView.id = 'settingsView';
        settingsView.className = 'settings-view d-none';
        settingsView.innerHTML = `
            <div class="settings-header">
                <h5>الإعدادات</h5>
            </div>
            <div class="settings-content">
                <div class="setting-item">
                    <div class="setting-info">
                        <h6>الوضع الليلي</h6>
                        <p class="text-muted small">تبديل بين المظهر الفاتح والداكن</p>
                    </div>
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" id="darkModeToggle">
                    </div>
                </div>
                
                <div class="setting-item">
                    <div class="setting-info">
                        <h6>تثبيت التطبيق</h6>
                        <p class="text-muted small">تثبيت كتطبيق على جهازك</p>
                    </div>
                    <button id="settingsInstallBtn" class="btn btn-sm btn-primary">تثبيت</button>
                </div>
                
                <div class="setting-item">
                    <div class="setting-info">
                        <h6>حجم الخط</h6>
                        <p class="text-muted small">تعديل حجم النص في التطبيق</p>
                    </div>
                    <div class="font-size-controls">
                        <button id="decreaseFontBtn" class="btn btn-sm btn-outline-secondary">-</button>
                        <button id="resetFontBtn" class="btn btn-sm btn-outline-secondary">إعادة</button>
                        <button id="increaseFontBtn" class="btn btn-sm btn-outline-secondary">+</button>
                    </div>
                </div>
                
                <div class="setting-item">
                    <div class="setting-info">
                        <h6>حذف جميع البيانات</h6>
                        <p class="text-muted small">حذف كافة المنتجات من الجهاز</p>
                    </div>
                    <button id="clearDataBtn" class="btn btn-sm btn-danger">حذف الكل</button>
                </div>
                
                <div class="app-info mt-5 text-center">
                    <h6>${APP_NAME}</h6>
                    <p class="text-muted small">الإصدار 1.0.0</p>
                </div>
            </div>
        `;
        
        contentContainer.appendChild(settingsView);
    }
    
    /**
     * إعداد مستمعي الأحداث
     */
    function setupEventListeners() {
        // الاستماع لتغيير حجم النافذة
        window.addEventListener('resize', debounce(function() {
            checkIfMobile();
            updateInterface();
        }, 250));
        
        // أزرار التنقل
        document.querySelectorAll('#mobileNavbar .nav-btn').forEach(button => {
            button.addEventListener('click', function() {
                const view = this.getAttribute('data-view');
                changeView(view);
            });
        });
        
        // أزرار البحث
        document.getElementById('toggleSearchBtn')?.addEventListener('click', toggleSearchOverlay);
        document.getElementById('closeSearchBtn')?.addEventListener('click', toggleSearchOverlay);
        document.getElementById('mobileSearchInput')?.addEventListener('input', performSearch);
        document.getElementById('clearSearchBtn')?.addEventListener('click', clearSearch);
        
        // تغيير نوع البحث
        document.querySelectorAll('input[name="mobileSearchType"]').forEach(radio => {
            radio.addEventListener('change', performSearch);
        });
        
        // إعدادات الوضع الليلي
        document.getElementById('darkModeToggle')?.addEventListener('change', toggleDarkMode);
        
        // أزرار حجم الخط
        document.getElementById('increaseFontBtn')?.addEventListener('click', () => changeFontSize(1));
        document.getElementById('decreaseFontBtn')?.addEventListener('click', () => changeFontSize(-1));
        document.getElementById('resetFontBtn')?.addEventListener('click', () => resetFontSize());
        
        // زر تثبيت التطبيق
        document.getElementById('installBtn')?.addEventListener('click', promptInstall);
        document.getElementById('settingsInstallBtn')?.addEventListener('click', promptInstall);
        
        // زر حذف البيانات
        document.getElementById('clearDataBtn')?.addEventListener('click', confirmClearAllData);
    }
    
    /**
     * تهيئة دعم تطبيقات الويب التقدمية (PWA)
     */
    function initPWASupport() {
        // الاستماع لحدث تثبيت التطبيق
        window.addEventListener('beforeinstallprompt', (e) => {
            // منع ظهور الدعوة التلقائية
            e.preventDefault();
            // حفظ الحدث لاستخدامه لاحقًا
            deferredPrompt = e;
            // إظهار زر التثبيت
            isInstallable = true;
            document.getElementById('installBtn')?.classList.remove('d-none');
            document.getElementById('settingsInstallBtn')?.removeAttribute('disabled');
        });
        
        // التأكد من أن الزر مخفي إذا تم تثبيت التطبيق
        window.addEventListener('appinstalled', () => {
            isInstallable = false;
            document.getElementById('installBtn')?.classList.add('d-none');
            document.getElementById('settingsInstallBtn')?.setAttribute('disabled', 'true');
            deferredPrompt = null;
        });
    }
    
    /**
     * إعادة تنظيم محتوى الصفحة لواجهة الموبايل
     */
                 // --- بداية الكود الجديد والمُعدل لوظيفة reorganizeContent ---
        function reorganizeContent() {
            console.log('Simple Reorg: Starting content reorganization...');
            const mainContainer = document.querySelector('.container.my-5'); // تأكد من استخدام document.querySelector
            const contentContainer = document.getElementById('mobileContent'); // الحصول على الحاوية الرئيسية للموبايل

            // تحقق من وجود الحاويات الأساسية
            if (!mainContainer || !contentContainer) {
                 console.error('Simple Reorg Error: Main container (.container.my-5) or mobile content container (#mobileContent) not found.');
                 return; // لا يمكن المتابعة
            }

            // --- 1. إنشاء حاويات العرض الخاصة بالموبايل ---
            // سنقوم بإنشائها هنا مباشرة بدلاً من البحث عنها
            const listView = document.createElement('div');
            listView.id = 'productListView';
            listView.className = 'product-list-view'; // اجعلها مرئية مبدئيًا أو أضف d-none إذا أردت أن يتحكم changeView بها

            const formView = document.createElement('div');
            formView.id = 'productFormView';
            formView.className = 'product-form-view d-none'; // مخفية افتراضيًا

            const dashboardView = document.createElement('div');
            dashboardView.id = 'dashboardView';
            dashboardView.className = 'dashboard-view d-none'; // مخفية افتراضيًا

            // عرض الإعدادات يتم إنشاؤه بواسطة createSettingsView، نحتاج فقط للعثور عليه وإلحاقه
            const settingsView = document.getElementById('settingsView');

            // --- 2. إلحاق الحاويات المنشأة حديثًا + الإعدادات إلى contentContainer ---
            contentContainer.appendChild(listView);
            contentContainer.appendChild(formView);
            contentContainer.appendChild(dashboardView);
            if (settingsView) {
                contentContainer.appendChild(settingsView); // ألحق الإعدادات إذا وجدت
                console.log('Simple Reorg: Settings view appended.');
            } else {
                // هذا لا ينبغي أن يحدث إذا تم استدعاء createSettingsView بنجاح قبل reorganizeContent
                console.error("Simple Reorg Error: Settings view element (#settingsView) was not found to append! Check createSettingsView function.");
                // يمكن المتابعة حتى لو فشلت الإعدادات
            }
            console.log('Simple Reorg: Mobile view containers created and appended.');

            // --- 3. الآن انقل المحتوى إلى الحاويات الجديدة ---
            // --- 3أ. نقل النموذج ---
            const originalFormContainer = mainContainer.querySelector('.product-form');
            if (originalFormContainer) {
                console.log('Simple Reorg: Found original form container.');
                formView.appendChild(originalFormContainer); // انقله إلى formView الذي أنشأناه للتو
                console.log('Simple Reorg: Form container moved to formView.');
                console.warn('Simple Reorg: Form JS (like total calculation) might not work yet after moving.');
            } else {
                console.error('Simple Reorg Error: Could not find original form container (.product-form). Add view will be empty.');
                 formView.innerHTML = '<div class="p-5 text-center text-muted">لم يتم العثور على نموذج الإضافة الأصلي.</div>';
            }

            // --- 3ب. نقل لوحة المعلومات (أو وضع رسالة) ---
            const originalDashboardArea = document.getElementById('dashboardArea');
            if (originalDashboardArea) {
                 console.log('Simple Reorg: Found original dashboard area.');
                 dashboardView.appendChild(originalDashboardArea); // انقله إلى dashboardView الذي أنشأناه للتو
                 console.log('Simple Reorg: Dashboard moved.');
            } else {
                console.warn('Simple Reorg: Original dashboard area (#dashboardArea) not found.');
                 dashboardView.innerHTML = '<div class="p-5 text-center text-muted">محتوى الإحصائيات غير متوفر حاليًا في وضع الهاتف.</div>';
            }

            // --- 4. إخفاء عناصر سطح المكتب المتبقية ---
            const desktopSearchCard = mainContainer.querySelector('.card.shadow-sm.mb-4:nth-of-type(2)');
            const desktopTableCard = mainContainer.querySelector('.card.shadow-sm:last-of-type');
            if(desktopSearchCard) desktopSearchCard.style.display = 'none';
            if(desktopTableCard) desktopTableCard.style.display = 'none';
            console.log('Simple Reorg: Hidden remaining desktop elements.');

            // --- 5. تهيئة قائمة منتجات الموبايل ---
            // تأكد من أن listView الذي تم إنشاؤه للتو يتم تمريره هنا
            createMobileProductList(listView);

            console.log('Simple Reorg: Content reorganization finished.');
        }
        // --- نهاية الكود الجديد والمُعدل لوظيفة reorganizeContent ---
    
    /**
     * إنشاء قائمة منتجات متوافقة مع الموبايل
     */
    function createMobileProductList(container) {
        if (!container) return;
        
        // إنشاء عنصر للعد والأزرار
        const listHeader = document.createElement('div');
        listHeader.className = 'mobile-list-header';
        listHeader.innerHTML = `
            <span class="text-muted" id="mobileProductCount">عدد المنتجات: 0</span>
            <button class="btn btn-danger btn-sm" id="mobileDeleteAllBtn">حذف الكل</button>
        `;
        
        // إنشاء حاوية البطاقات
        const cardsContainer = document.createElement('div');
        cardsContainer.id = 'mobileProductCards';
        cardsContainer.className = 'mobile-product-cards';
        
        // إضافة العناصر إلى الحاوية
        container.appendChild(listHeader);
        container.appendChild(cardsContainer);
        
        // إضافة مستمع لزر الحذف
        document.getElementById('mobileDeleteAllBtn')?.addEventListener('click', function() {
            if (window.deleteAllBtn) {
                window.deleteAllBtn.click();
            }
        });
        
        // تحديث قائمة المنتجات
        updateMobileProductList();
    }
    
    /**
     * تحديث قائمة المنتجات لواجهة الموبايل
     */
    function updateMobileProductList() {
        const productData = getProductData();
        const cardsContainer = document.getElementById('mobileProductCards');
        const countElement = document.getElementById('mobileProductCount');
        
        if (!cardsContainer) return;
        
        // تحديث العداد
        if (countElement) {
            countElement.textContent = `عدد المنتجات: ${productData.length}`;
        }
        
        // عرض رسالة إذا لم تكن هناك منتجات
        if (productData.length === 0) {
            cardsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-box-open fa-3x text-muted mb-3"></i>
                    <p>لا توجد منتجات لعرضها</p>
                    <button class="btn btn-primary btn-sm" id="addFirstProductBtn">إضافة منتج جديد</button>
                </div>
            `;
            
            document.getElementById('addFirstProductBtn')?.addEventListener('click', () => {
                changeView('add');
            });
            
            return;
        }
        
        // إنشاء بطاقات المنتجات
        let cardsHTML = '';
        productData.forEach((product, index) => {
            const productId = window.productImagesModule?.generateProductId?.(product);
            const imageData = productId ? window.productImagesModule?.getProductImage?.(productId) : null;
            
            const imageHTML = imageData
                ? `<img src="${imageData}" alt="صورة المنتج" class="product-card-image">`
                : `<div class="product-card-no-image"><i class="fas fa-image"></i></div>`;
                
            cardsHTML += `
                <div class="product-card" data-product-index="${index}">
                    <div class="product-card-image-container">
                        ${imageHTML}
                    </div>
                    <div class="product-card-content">
                        <h5 class="product-card-title">${product.title || 'منتج بدون اسم'}</h5>
                        <div class="product-card-category">${product.category || 'بدون تصنيف'}</div>
                        <div class="product-card-price">${parseFloat(product.total || 0).toFixed(2)}</div>
                    </div>
                    <div class="product-card-actions">
                        <button class="btn btn-sm btn-primary edit-product-btn" data-index="${index}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger delete-product-btn" data-index="${index}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        cardsContainer.innerHTML = cardsHTML;
        
        // إضافة مستمعي الأحداث للبطاقات
        cardsContainer.querySelectorAll('.edit-product-btn').forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                const index = parseInt(this.getAttribute('data-index'), 10);
                if (typeof window.editProduct === 'function') {
                    window.editProduct(index);
                    changeView('add');
                }
            });
        });
        
        cardsContainer.querySelectorAll('.delete-product-btn').forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                const index = parseInt(this.getAttribute('data-index'), 10);
                if (typeof window.deleteProduct === 'function') {
                    window.deleteProduct(index);
                    updateMobileProductList();
                }
            });
        });
        
        cardsContainer.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-product-index'), 10);
                showProductDetails(index);
            });
        });
    }
    
    /**
     * عرض تفاصيل منتج في واجهة المحمول
     */
    function showProductDetails(index) {
        const productData = getProductData();
        
        if (index < 0 || index >= productData.length) {
            return;
        }
        
        const product = productData[index];
        const productId = window.productImagesModule?.generateProductId?.(product);
        const imageData = productId ? window.productImagesModule?.getProductImage?.(productId) : null;
        
        const detailsView = document.createElement('div');
        detailsView.id = 'productDetailsView';
        detailsView.className = 'product-details-view';
        
        // بناء مُحتوى التفاصيل
        const imageHTML = imageData
            ? `<img src="${imageData}" alt="صورة المنتج" class="product-details-image">`
            : `<div class="product-details-no-image"><i class="fas fa-image fa-3x"></i></div>`;
            
        detailsView.innerHTML = `
            <div class="details-header">
                <button id="closeDetailsBtn" class="btn-icon"><i class="fas fa-arrow-right"></i></button>
                <h5>تفاصيل المنتج</h5>
                <div class="header-actions">
                    <button id="detailsEditBtn" class="btn-icon" data-index="${index}"><i class="fas fa-edit"></i></button>
                    <button id="detailsPrintBtn" class="btn-icon" data-index="${index}"><i class="fas fa-print"></i></button>
                </div>
            </div>
            
            <div class="details-content">
                <div class="details-image-container">
                    ${imageHTML}
                </div>
                
                <div class="details-info">
                    <h4 class="details-title">${product.title || 'منتج بدون اسم'}</h4>
                    <div class="details-category">${product.category || 'بدون تصنيف'}</div>
                    
                    <div class="details-price-box">
                        <div class="total-price">${parseFloat(product.total || 0).toFixed(2)}</div>
                    </div>
                    
                    <div class="details-grid">
                        <div class="detail-item">
                            <div class="detail-label">السعر الأساسي</div>
                            <div class="detail-value">${parseFloat(product.price || 0).toFixed(2)}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">الضرائب</div>
                            <div class="detail-value">${parseFloat(product.taxes || 0).toFixed(2)}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">الإعلان</div>
                            <div class="detail-value">${parseFloat(product.ads || 0).toFixed(2)}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">الخصم</div>
                            <div class="detail-value">${parseFloat(product.discount || 0).toFixed(2)}</div>
                        </div>
                    </div>
                    
                    <div class="details-actions">
                        <button id="deleteProductBtn" class="btn btn-danger" data-index="${index}">حذف المنتج</button>
                    </div>
                </div>
            </div>
        `;
        
        // إضافة العنصر إلى الصفحة
        document.body.appendChild(detailsView);
        
        // إضافة مستمعي الأحداث
        document.getElementById('closeDetailsBtn')?.addEventListener('click', () => {
            detailsView.classList.add('slide-out');
            setTimeout(() => {
                detailsView.remove();
            }, 300);
        });
        
        document.getElementById('detailsEditBtn')?.addEventListener('click', function() {
            const productIndex = parseInt(this.getAttribute('data-index'), 10);
            if (typeof window.editProduct === 'function') {
                window.editProduct(productIndex);
                changeView('add');
                detailsView.remove();
            }
        });
        
        document.getElementById('detailsPrintBtn')?.addEventListener('click', function() {
            const productIndex = parseInt(this.getAttribute('data-index'), 10);
            // استدعاء وظيفة الطباعة إذا كانت متاحة (من ملف print.js)
            if (typeof window.printProductDetails === 'function') {
                window.printProductDetails(productIndex);
            }
        });
        
        document.getElementById('deleteProductBtn')?.addEventListener('click', function() {
            const productIndex = parseInt(this.getAttribute('data-index'), 10);
            if (typeof window.deleteProduct === 'function') {
                window.deleteProduct(productIndex);
                detailsView.remove();
            }
        });
        
        // إضافة تأثير الظهور
        setTimeout(() => {
            detailsView.classList.add('active');
        }, 10);
    }
    
    /**
     * تغيير العرض الحالي في واجهة الموبايل
     */
    function changeView(view) {
        // تحديث الزر النشط في شريط التنقل
        document.querySelectorAll('#mobileNavbar .nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-view') === view);
        });
        
        // تحديث العرض الحالي
        currentView = view;
        
        // إخفاء جميع العناصر أولاً
        document.querySelectorAll('#mobileContent > div').forEach(element => {
            element.classList.add('d-none');
        });
        
        // إظهار العنصر المناسب
        switch (view) {
            case 'list':
                document.getElementById('productListView')?.classList.remove('d-none');
                // تحديث قائمة المنتجات
                updateMobileProductList();
                break;
            
            case 'add':
                document.getElementById('productFormView')?.classList.remove('d-none');
                break;
            
            case 'dashboard':
                document.getElementById('dashboardView')?.classList.remove('d-none');
                if (typeof window.notifyDashboardOfDataChange === 'function') {
                    window.notifyDashboardOfDataChange();
                }
                break;
            
            case 'settings':
                document.getElementById('settingsView')?.classList.remove('d-none');
                break;
        }
        
        // تمرير إلى أعلى الشاشة بسلاسة
        contentContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    /**
     * تطبيق أنماط CSS لتحسين تجربة الموبايل
     */
    function applyMobileCSS() {
        if (document.getElementById('mobileCssStyles')) return;
        
        const styleElement = document.createElement('style');
        styleElement.id = 'mobileCssStyles';
        styleElement.textContent = `
            /* أنماط أساسية للموبايل */
            .is-mobile-device .container {
                max-width: 100% !important;
                padding: 0 !important;
                margin: 0 !important;
            }
            
            .is-mobile-device .my-5 {
                margin-top: 0 !important;
                margin-bottom: 0 !important;
            }
            
            /* حاوية تطبيق الموبايل */
            .mobile-container {
                position: fixed;
                top: 0;
                right: 0;
                bottom: 0;
                left: 0;
                display: flex;
                flex-direction: column;
                background-color: #f8f9fa;
                z-index: 1000;
                overflow: hidden;
            }
            
            /* رأس التطبيق */
            .mobile-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem;
                background-color: #007bff;
                color: white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                z-index: 10;
            }
            
            .header-title {
                font-size: 1.25rem;
                font-weight: 600;
            }
            
            .header-actions {
                display: flex;
                gap: 0.5rem;
            }

/* محتوى التطبيق */
            .mobile-content {
                flex: 1;
                overflow-y: auto;
                padding: 1rem;
            }
            
            /* شريط التنقل السفلي */
            .mobile-navbar {
                display: flex;
                justify-content: space-around;
                background-color: white;
                border-top: 1px solid #e2e2e2;
                padding: 0.5rem;
                box-shadow: 0 -2px 4px rgba(0,0,0,0.05);
            }
            
            .nav-btn {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                border: none;
                background: none;
                color: #6c757d;
                padding: 0.5rem;
                border-radius: 0.25rem;
                transition: all 0.2s;
            }
            
            .nav-btn.active {
                color: #007bff;
                background-color: rgba(0,123,255,0.1);
            }
            
            .nav-btn i {
                font-size: 1.2rem;
                margin-bottom: 0.25rem;
            }
            
            .nav-btn span {
                font-size: 0.75rem;
            }
            
            /* أزرار الأيقونات */
            .btn-icon {
                border: none;
                background: none;
                color: inherit;
                width: 2rem;
                height: 2rem;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: background-color 0.2s;
            }
            
            .btn-icon:hover {
                background-color: rgba(255,255,255,0.2);
            }
            
            /* واجهة البحث */
            .search-overlay {
                position: fixed;
                top: 0;
                right: 0;
                bottom: 0;
                left: 0;
                background-color: #f8f9fa;
                z-index: 1100;
                display: flex;
                flex-direction: column;
                transform: translateY(100%);
                transition: transform 0.3s ease-in-out;
            }
            
            .search-overlay.active {
                transform: translateY(0);
            }
            
            .search-header {
                display: flex;
                align-items: center;
                padding: 1rem;
                gap: 0.5rem;
                background-color: #007bff;
                color: white;
            }
            
            .search-header input {
                flex: 1;
            }
            
            .search-filters {
                padding: 0.5rem 1rem;
                border-bottom: 1px solid #e2e2e2;
            }
            
            .search-results {
                flex: 1;
                overflow-y: auto;
                padding: 1rem;
            }
            
            /* قائمة المنتجات للموبايل */
            .mobile-list-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;
            }
            
                   /* --- داخل applyMobileCSS --- */
        /* ... (قواعد أخرى مثل .mobile-container، .mobile-header الخ تبقى كما هي) ... */

        /* --- بداية قواعد Product Card المبسطة --- */
        .mobile-product-cards { display: flex; flex-direction: column; gap: 0.75rem; padding: 0.25rem;}

        .product-card {
            display: flex;          /* أهم شيء: استخدم flexbox */
            align-items: center;    /* محاذاة العناصر رأسيًا في المنتصف */
            background-color: #fff;
            border: 1px solid #eee;
            border-radius: 6px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }

        .product-card-image-container {
            width: 65px;            /* حجم أصغر للصورة */
            height: 65px;
            flex-shrink: 0;         /* لا تسمح لها بالانكماش */
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #f5f5f5;
        }
        .product-card-image { width: 100%; height: 100%; object-fit: cover; }
        .product-card-no-image { color: #ccc; font-size: 1.2rem; }

        .product-card-content {
            flex-grow: 1;           /* اسمح لها بأخذ المساحة المتبقية */
            padding: 0.5rem 0.8rem; /* حشو داخلي للمحتوى */
            min-width: 0;           /* لمنع تجاوز النص */
            display: flex;          /* استخدم flex للمحتوى الداخلي أيضًا */
            flex-direction: column; /* رتب المحتوى عموديًا */
            justify-content: center;/* وسّطه رأسيًا */
        }
        .product-card-title {
            font-size: 0.95rem;
            font-weight: 600;
            margin: 0 0 2px 0;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis; /* لمنع التفاف النص الطويل */
            color: #333;
        }
        .product-card-category {
            font-size: 0.75rem;
            color: #777;
            margin: 0 0 3px 0;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .product-card-price {
            font-size: 0.9rem;
            font-weight: bold;
            color: #28a745;
            margin-top: auto; /* ادفعه للأسفل إذا كان هناك مساحة */
        }

        .product-card-actions {
            display: flex;
            flex-direction: column; /* الأزرار فوق بعضها */
            align-items: center;
            justify-content: center;
            padding: 0.4rem 0.6rem; /* حشو حول الأزرار */
            gap: 0.4rem;           /* مسافة بين الأزرار */
            background-color: #f9f9f9;
            border-left: 1px solid #eee;
            flex-shrink: 0;        /* لا تسمح لها بالانكماش */
        }
        .product-card-actions .btn {
            padding: 0.25rem 0.5rem; /* حجم الأزرار */
            font-size: 0.9rem;      /* حجم الأيقونة داخل الزر */
            line-height: 1;         /* لضبط الارتفاع */
        }
            
            /* صفحة الإعدادات */
            .settings-view {
                height: 100%;
                display: flex;
                flex-direction: column;
            }
            
            .settings-header {
                padding: 1rem 0;
                border-bottom: 1px solid #e2e2e2;
                margin-bottom: 1rem;
            }
            
            .settings-content {
                flex: 1;
            }
            
            .setting-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem 0;
                border-bottom: 1px solid #f2f2f2;
            }
            
            .setting-info {
                flex: 1;
            }
            
            .setting-info h6 {
                margin: 0;
                margin-bottom: 0.25rem;
            }
            
            .font-size-controls {
                display: flex;
                gap: 0.25rem;
            }
            
            /* صفحة تفاصيل المنتج */
            .product-details-view {
                position: fixed;
                top: 0;
                right: 0;
                bottom: 0;
                left: 0;
                background-color: #fff;
                z-index: 1200;
                display: flex;
                flex-direction: column;
                transform: translateX(100%);
                transition: transform 0.3s ease-in-out;
            }
            
            .product-details-view.active {
                transform: translateX(0);
            }
            
            .product-details-view.slide-out {
                transform: translateX(100%);
            }
            
            .details-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem;
                background-color: #007bff;
                color: white;
            }
            
            .details-content {
                flex: 1;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
            }
            
            .details-image-container {
                width: 100%;
                height: 200px;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: #f8f9fa;
            }
            
            .product-details-image {
                width: 100%;
                height: 100%;
                object-fit: contain;
            }
            
            .product-details-no-image {
                color: #adb5bd;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: 100%;
            }
            
            .details-info {
                padding: 1rem;
            }
            
            .details-title {
                margin: 0;
                margin-bottom: 0.5rem;
            }
            
            .details-category {
                color: #6c757d;
                margin-bottom: 1rem;
            }
            
            .details-price-box {
                background-color: #f8f9fa;
                padding: 1rem;
                border-radius: 0.5rem;
                margin-bottom: 1rem;
                text-align: center;
            }
            
            .total-price {
                font-size: 1.5rem;
                font-weight: bold;
                color: #28a745;
            }
            
            .details-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
                margin-bottom: 1.5rem;
            }
            
            .detail-item {
                padding: 0.5rem;
                background-color: #f8f9fa;
                border-radius: 0.25rem;
            }
            
            .detail-label {
                font-size: 0.75rem;
                color: #6c757d;
                margin-bottom: 0.25rem;
            }
            
            .detail-value {
                font-weight: bold;
            }
            
            .details-actions {
                margin-top: 1rem;
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }
            
            /* مُساعدة حالة الفراغ */
            .empty-state {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                padding: 2rem;
                color: #6c757d;
            }
            
            /* أنماط الوضع الليلي */
            body.dark-mode {
                background-color: #121212;
                color: #f0f0f0;
            }
            
            body.dark-mode .mobile-container,
            body.dark-mode .search-overlay {
                background-color: #121212;
            }
            
            body.dark-mode .mobile-navbar,
            body.dark-mode .product-card,
            body.dark-mode .detail-item {
                background-color: #1e1e1e;
                border-color: #333;
            }
            
            body.dark-mode .mobile-header,
            body.dark-mode .search-header,
            body.dark-mode .details-header {
                background-color: #0056b3;
            }
            
            body.dark-mode .product-card-no-image,
            body.dark-mode .product-details-no-image {
                color: #666;
            }
            
            body.dark-mode .setting-item {
                border-color: #333;
            }
        `;
        
        document.head.appendChild(styleElement);
    }
    
    /**
     * تحديث واجهة المستخدم
     */
    function updateInterface() {
        // التحقق من وجود حاوية التطبيق
        if (!mobileContainer) return;
        
        // إظهار أو إخفاء واجهة الموبايل
        if (isMobile) {
            mobileContainer.classList.remove('d-none');
            
            // إخفاء الحاوية الأصلية على الأجهزة المحمولة
            const mainContainer = document.querySelector('.container.my-5');
            if (mainContainer) {
                mainContainer.classList.add('d-none');
            }
            
            // تحديث قائمة المنتجات
            updateMobileProductList();
        } else {
            mobileContainer.classList.add('d-none');
            
            // إظهار الحاوية الأصلية على الأجهزة المكتبية
            const mainContainer = document.querySelector('.container.my-5');
            if (mainContainer) {
                mainContainer.classList.remove('d-none');
            }
        }
    }
    
    /**
     * تبديل واجهة البحث
     */
    function toggleSearchOverlay() {
        const searchOverlay = document.getElementById('searchOverlay');
        if (!searchOverlay) return;
        
        searchOverlay.classList.toggle('d-none');
        searchOverlay.classList.toggle('active');
        
        // تركيز على حقل البحث عند الفتح
        if (!searchOverlay.classList.contains('d-none')) {
            document.getElementById('mobileSearchInput')?.focus();
        }
    }
    
    /**
     * تنفيذ البحث في قائمة المنتجات
     */
    function performSearch() {
        const searchInput = document.getElementById('mobileSearchInput');
        const searchResults = document.getElementById('searchResults');
        const searchType = document.querySelector('input[name="mobileSearchType"]:checked')?.id;
        
        if (!searchInput || !searchResults) return;
        
        const query = searchInput.value.trim().toLowerCase();
        const productData = getProductData();
        
        // مسح نتائج البحث السابقة
        searchResults.innerHTML = '';
        
        // إذا كان حقل البحث فارغًا
        if (!query) {
            searchResults.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search fa-2x text-muted mb-3"></i>
                    <p>ابدأ الكتابة للبحث عن المنتجات</p>
                </div>
            `;
            return;
        }
        
        // تصفية المنتجات حسب معايير البحث
        const filteredProducts = productData.filter(product => {
            if (searchType === 'mobileSearchTitle') {
                return (product.title || '').toLowerCase().includes(query);
            } else if (searchType === 'mobileSearchCategory') {
                return (product.category || '').toLowerCase().includes(query);
            } else {
                // البحث في جميع الحقول
                return (
                    (product.title || '').toLowerCase().includes(query) ||
                    (product.category || '').toLowerCase().includes(query)
                );
            }
        });
        
        // عرض نتائج البحث
        if (filteredProducts.length === 0) {
            searchResults.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-circle fa-2x text-muted mb-3"></i>
                    <p>لا توجد نتائج مطابقة</p>
                </div>
            `;
            return;
        }
        
        // إنشاء عناصر نتائج البحث
        let resultsHTML = '';
        filteredProducts.forEach((product, index) => {
            resultsHTML += `
                <div class="search-result-item" data-product-index="${productData.indexOf(product)}">
                    <div class="search-result-content">
                        <h5 class="search-result-title">${product.title || 'منتج بدون اسم'}</h5>
                        <div class="search-result-category">${product.category || 'بدون تصنيف'}</div>
                        <div class="search-result-price">${parseFloat(product.total || 0).toFixed(2)}</div>
                    </div>
                </div>
            `;
        });
        
        searchResults.innerHTML = resultsHTML;
        
        // إضافة مستمعي أحداث للنتائج
        document.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-product-index'), 10);
                showProductDetails(index);
                toggleSearchOverlay();
            });
        });
    }
    
    /**
     * مسح حقل البحث
     */
    function clearSearch() {
        const searchInput = document.getElementById('mobileSearchInput');
        if (!searchInput) return;
        
        searchInput.value = '';
        performSearch();
    }
    
    /**
     * تبديل الوضع الليلي
     */
    function toggleDarkMode(event) {
        const darkModeEnabled = event?.target?.checked || false;
        document.body.classList.toggle('dark-mode', darkModeEnabled);
        
        // حفظ التفضيل
        localStorage.setItem('darkMode', darkModeEnabled ? 'enabled' : 'disabled');
    }
    
    /**
     * تغيير حجم الخط
     */
    function changeFontSize(delta) {
        // الحصول على الحجم الحالي
        let currentSize = parseFloat(localStorage.getItem('fontSize') || '100');
        
        // تعديل الحجم
        currentSize += delta * 5; // زيادة أو نقصان بنسبة 5%
        
        // التأكد من أن الحجم في النطاق المناسب
        currentSize = Math.max(70, Math.min(currentSize, 130));
        
        // حفظ وتطبيق الحجم الجديد
        localStorage.setItem('fontSize', currentSize.toString());
        document.documentElement.style.fontSize = `${currentSize}%`;
    }
    
    /**
     * إعادة تعيين حجم الخط إلى الحجم الطبيعي
     */
    function resetFontSize() {
        localStorage.setItem('fontSize', '100');
        document.documentElement.style.fontSize = '100%';
    }
    
    /**
     * عرض مربع حوار تثبيت التطبيق
     */
    function promptInstall() {
        if (!deferredPrompt) {
            alert('هذا التطبيق مثبت بالفعل أو لا يمكن تثبيته على هذا الجهاز.');
            return;
        }
        
        // إظهار الدعوة لتثبيت التطبيق
        deferredPrompt.prompt();
        
        // انتظار اختيار المستخدم
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('تم قبول تثبيت التطبيق');
            } else {
                console.log('تم رفض تثبيت التطبيق');
            }
            
            // تنظيف المتغير
            deferredPrompt = null;
        });
    }
    
    /**
     * طلب تأكيد حذف جميع البيانات
     */
    function confirmClearAllData() {
        if (confirm('هل أنت متأكد من رغبتك في حذف جميع المنتجات؟ لا يمكن التراجع عن هذه العملية.')) {
            if (typeof window.deleteAllProducts === 'function') {
                window.deleteAllProducts();
                updateMobileProductList();
            }
        }
    }
    
    /**
     * الحصول على بيانات المنتجات من التخزين المحلي
     */
    function getProductData() {
        try {
            const data = JSON.parse(localStorage.getItem('productData') || '[]');
            return Array.isArray(data) ? data : [];
        } catch (e) {
            console.error('خطأ في قراءة بيانات المنتجات:', e);
            return [];
        }
    }
    
    /**
     * وظيفة مساعدة لتأخير التنفيذ
     */
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }
    
    /**
     * وظيفة العودة المستدعاة في مرحلة نهائية
     */
    function onProductManagerInitialized() {
        // يتم استدعاء هذه الوظيفة بعد تهيئة مدير المنتجات
        
        // التحقق من الوضع الليلي المخزن
        const darkModeEnabled = localStorage.getItem('darkMode') === 'enabled';
        document.body.classList.toggle('dark-mode', darkModeEnabled);
        
        // تحديث حالة زر التبديل
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            darkModeToggle.checked = darkModeEnabled;
        }
        
        // تطبيق حجم الخط المخزن
        const fontSize = localStorage.getItem('fontSize') || '100';
        document.documentElement.style.fontSize = `${fontSize}%`;
    }
    
    /**
     * وظيفة التصدير ليتم استدعاؤها من الخارج
     */
    function notifyMobileOfProductChange() {
        if (isMobile) {
            updateMobileProductList();
        }
    }
    
    // تصدير الوظائف للاستخدام الخارجي
    window.mobileExperience = {
        notifyOfProductChange: notifyMobileOfProductChange,
        showProductDetails: showProductDetails,
        changeView: changeView
    };
    
    // بدء تنفيذ التحسينات عندما يكون المستند جاهزًا
    document.addEventListener('DOMContentLoaded', function() {
        initMobileExperience();
        
        // انتظار تهيئة مدير المنتجات
        if (typeof window.productManagerInitialized === 'function') {
            window.productManagerInitialized(onProductManagerInitialized);
        } else {
            // إذا لم تكن الوظيفة متاحة بعد، قم بإعادة محاولة بعد فترة قصيرة
            setTimeout(() => {
                if (typeof window.productManagerInitialized === 'function') {
                    window.productManagerInitialized(onProductManagerInitialized);
                } else {
                    onProductManagerInitialized(); // استدعاء على أي حال
                }
            }, 500);
        }
    });
    
})();