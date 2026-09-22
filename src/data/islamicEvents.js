// Fixed Hijri (month, day) for each occasion. Gregorian equivalents are
// computed at runtime via the Al Adhan API's Hijri-to-Gregorian conversion.
const islamicEvents = [
    { id: 'ramadan', nameAr: 'رمضان', hijriMonth: 9, hijriDay: 1 },
    { id: 'eid-fitr', nameAr: 'عيد الفطر', hijriMonth: 10, hijriDay: 1 },
    { id: 'eid-adha', nameAr: 'عيد الأضحى', hijriMonth: 12, hijriDay: 10 },
    { id: 'hijri-new-year', nameAr: 'رأس السنة الهجرية', hijriMonth: 1, hijriDay: 1 }
]

export default islamicEvents
