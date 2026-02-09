# نظام التصميم

- **الألوان (مستوحى من GitHub):** ألوان صلبة فقط (بدون تدرجات). استخدام متغيرات من `index.css`:
  - `--primary` / `--primary-foreground`: أخضر للزر الرئيسي (استكشف، إنشاء حساب).
  - `--background`: خلفية الصفحة (أوف وايت / رمادي فاتح).
  - `--card` / `--card-foreground`: خلفية البطاقات والنوافذ المنبثقة.
  - `--border`: حدود رمادية للبطاقات والحقول.
  - `--muted` / `--muted-foreground`: نصوص ثانوية ووصفية.
  - `--header-bg` / `--header-fg`: شريط الهيدر (مميز عن المحتوى).
- **الخط:** IBM Plex Sans Arabic للواجهة، مع fallback إلى system-ui. متغير `--font-sans-arabic`.
- **المسافات:** مقياس Tailwind الافتراضي (1–96). إضافي: `--spacing-page`, `--spacing-section` للهوامش.
- **الحدود:** `--radius` للزوايا المدورة.
- **ممنوع:** عدم استخدام `linear-gradient` أو `radial-gradient` في الواجهة.
