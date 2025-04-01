# نظام إدارة المنتجات

## نظرة عامة
نظام إدارة المنتجات هو تطبيق ويب بسيط وفعال لإدارة قائمة المنتجات، مصمم للشركات الصغيرة والمتوسطة. يتيح النظام للمستخدمين إضافة وتعديل وعرض وحذف منتجاتهم بسهولة مع واجهة مستخدم بديهية باللغة العربية.

![نظام إدارة المنتجات](https://github.com/AI8V/Cruds/blob/main/%D9%86%D8%B8%D8%A7%D9%85%20%D8%A5%D8%AF%D8%A7%D8%B1%D8%A9%20%D8%A7%D9%84%D9%85%D9%86%D8%AA%D8%AC%D8%A7%D8%AA.png)

## المميزات الرئيسية

- **إدارة المنتجات الكاملة**: إضافة، تعديل، عرض وحذف المنتجات
- **حساب السعر التلقائي**: حساب السعر الإجمالي تلقائيًا بناءً على السعر الأساسي والضرائب ومصاريف الإعلان والخصومات
- **إنشاء منتجات متعددة**: القدرة على إنشاء منتجات متعددة بنفس الخصائص بسهولة
- **البحث المتقدم**: البحث عن المنتجات حسب الاسم أو الفئة
- **واجهة مستخدم سهلة**: تصميم بديهي وواضح باللغة العربية
- **متوافق مع الأجهزة المحمولة**: يعمل بشكل جيد على كافة أحجام الشاشات
- **تخزين محلي**: حفظ البيانات في المتصفح للاستخدام المستقبلي

## التقنيات المستخدمة

- **HTML5** لهيكلة التطبيق
- **CSS3** و **Bootstrap 5** للتصميم المتجاوب
- **JavaScript** للوظائف الديناميكية والتفاعلية
- **localStorage API** لتخزين بيانات المنتجات محليًا

## كيفية الاستخدام

### إضافة منتج جديد

1. أدخل اسم المنتج في حقل "اسم المنتج"
2. أدخل فئة المنتج (اختياري)
3. أدخل السعر الأساسي للمنتج
4. أضف الضرائب ومصاريف الإعلان والخصم (اختياري)
5. سيتم حساب السعر الإجمالي تلقائيًا
6. حدد الكمية إذا كنت ترغب في إنشاء نسخ متعددة
7. اضغط على زر "إنشاء منتج جديد"

### تعديل منتج موجود

1. اضغط على زر "تعديل" بجانب المنتج المراد تعديله
2. سيتم تعبئة نموذج المنتج بالبيانات الحالية
3. قم بإجراء التعديلات المطلوبة
4. اضغط على زر "تحديث المنتج"

### البحث عن المنتجات

1. أدخل كلمة البحث في حقل البحث
2. حدد نوع البحث (الكل، الاسم، الفئة)
3. ستظهر النتائج المطابقة تلقائيًا في الجدول

### حذف المنتجات

- لحذف منتج واحد: اضغط على زر "حذف" بجانب المنتج
- لحذف جميع المنتجات: اضغط على زر "حذف الكل" وقم بتأكيد العملية

## التثبيت

1. قم بتنزيل أو استنساخ المشروع:

   ```
   git clone https://github.com/ai8v/product-management-system.git
   ```

2. انتقل إلى مجلد المشروع:

   ```
   cd product-management-system
   ```

3. افتح ملف `index.html` في أي متصفح حديث

## التخصيص

يمكن تخصيص النظام بسهولة من خلال:

- تعديل ملف `styles.css` لتغيير مظهر التطبيق
- تعديل ملف `untitled.js` لتغيير وظائف التطبيق
- تعديل ملف `index.html` لتغيير هيكل التطبيق

## المتطلبات

- متصفح حديث يدعم HTML5، CSS3، و JavaScript ES6
- لا يلزم خادم ويب لأن التطبيق يعمل بالكامل على جانب العميل

## المساهمة

نرحب بالمساهمات لتحسين هذا المشروع. لإضافة ميزات جديدة أو إصلاح الأخطاء:

1. قم بعمل Fork للمشروع
2. أنشئ فرع جديد للميزة (`git checkout -b feature/amazing-feature`)
3. قم بإجراء التغييرات وحفظها (`git commit -m 'إضافة ميزة رائعة'`)
4. ارفع التغييرات إلى الفرع الخاص بك (`git push origin feature/amazing-feature`)
5. افتح طلب دمج (Pull Request)

## الترخيص

هذا المشروع مرخص تحت [رخصة MIT](https://opensource.org/licenses/MIT) - راجع ملف LICENSE للحصول على التفاصيل.

## التواصل

إذا كان لديك أي أسئلة أو اقتراحات، يرجى التواصل معنا عبر:

- البريد الإلكتروني: amr.omar304@gmail.com
- موقع الويب: [www.ai8v.com](https://www.ai8v.com)

---

تم تطويره بواسطة [Amr Abd Elsalam/Ai8v] © 2025
