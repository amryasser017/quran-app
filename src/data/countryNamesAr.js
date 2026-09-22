// Arabic display names for the countries used in prayerMethods.js / cities.js.
// Prayer-time API calls still use the English country name internally
// (needed for calculation-method matching and geocoding), this is display-only.
const countryNamesAr = {
    'Egypt': 'مصر',
    'Saudi Arabia': 'السعودية',
    'United Arab Emirates': 'الإمارات العربية المتحدة',
    'Kuwait': 'الكويت',
    'Qatar': 'قطر',
    'Bahrain': 'البحرين',
    'Oman': 'عُمان',
    'Jordan': 'الأردن',
    'Palestine': 'فلسطين',
    'Lebanon': 'لبنان',
    'Syria': 'سوريا',
    'Iraq': 'العراق',
    'Iran': 'إيران',
    'Turkey': 'تركيا',
    'Morocco': 'المغرب',
    'Algeria': 'الجزائر',
    'Tunisia': 'تونس',
    'Libya': 'ليبيا',
    'Sudan': 'السودان',
    'Somalia': 'الصومال',
    'Nigeria': 'نيجيريا',
    'Senegal': 'السنغال',
    'Kenya': 'كينيا',
    'Tanzania': 'تنزانيا',
    'Indonesia': 'إندونيسيا',
    'Malaysia': 'ماليزيا',
    'Singapore': 'سنغافورة',
    'Thailand': 'تايلاند',
    'Philippines': 'الفلبين',
    'Pakistan': 'باكستان',
    'India': 'الهند',
    'Bangladesh': 'بنغلاديش',
    'Afghanistan': 'أفغانستان',
    'Sri Lanka': 'سريلانكا',
    'Russia': 'روسيا',
    'France': 'فرنسا',
    'Portugal': 'البرتغال',
    'United Kingdom': 'المملكة المتحدة',
    'Germany': 'ألمانيا',
    'Spain': 'إسبانيا',
    'Italy': 'إيطاليا',
    'Netherlands': 'هولندا',
    'Belgium': 'بلجيكا',
    'USA': 'الولايات المتحدة',
    'United States': 'الولايات المتحدة',
    'United States of America': 'الولايات المتحدة',
    'Canada': 'كندا',
    'Australia': 'أستراليا',
    'South Africa': 'جنوب أفريقيا'
}

export function getCountryNameAr(country) {
    if (!country) return ''
    return countryNamesAr[country] || country
}

export default countryNamesAr
