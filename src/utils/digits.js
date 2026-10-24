// Eastern Arabic-Indic (٠-٩) and extended Persian (۰-۹) digits map to 0-9.
// Many phone keyboards switch to these for Arabic-locale users, and a plain
// <input type="number"> silently rejects them — it looks like the field
// just doesn't accept typing at all. Normalize on every change instead.
const DIGIT_MAP = {
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4', '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
    '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4', '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9'
}

export function normalizeDigits(value) {
    return value.replace(/[٠-٩۰-۹]/g, d => DIGIT_MAP[d] ?? d)
}

export function normalizeDigitsToInt(value) {
    return normalizeDigits(value).replace(/[^0-9]/g, '')
}
