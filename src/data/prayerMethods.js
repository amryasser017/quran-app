// Al Adhan calculation method IDs, mapped to the official convention each
// country's prayer-time authorities actually use. A single global method
// (e.g. Muslim World League for everyone) can be several minutes off from
// what a specific country's mosques/apps show, since Fajr/Isha angles and
// the Asr shadow ratio vary by convention.
const DEFAULT_METHOD = 3 // Muslim World League — reasonable global fallback

const COUNTRY_METHODS = {
    'Egypt': 5,             // Egyptian General Authority of Survey
    'Saudi Arabia': 4,      // Umm al-Qura, Makkah
    'United Arab Emirates': 8, // Gulf Region
    'Kuwait': 9,
    'Qatar': 10,
    'Bahrain': 8,
    'Oman': 8,
    'Jordan': 23,           // Ministry of Awqaf, Jordan
    'Palestine': 23,
    'Lebanon': 3,
    'Syria': 3,
    'Iraq': 3,
    'Iran': 7,              // Institute of Geophysics, University of Tehran
    'Turkey': 13,           // Diyanet İşleri Başkanlığı
    'Morocco': 21,
    'Algeria': 3,
    'Tunisia': 3,
    'Libya': 5,
    'Sudan': 5,
    'Somalia': 5,
    'Nigeria': 3,
    'Senegal': 3,
    'Kenya': 3,
    'Tanzania': 3,
    'Indonesia': 20,        // Kementerian Agama Republik Indonesia
    'Malaysia': 3,
    'Singapore': 11,        // Majlis Ugama Islam Singapura
    'Thailand': 3,
    'Philippines': 3,
    'Pakistan': 1,          // University of Islamic Sciences, Karachi
    'India': 1,
    'Bangladesh': 1,
    'Afghanistan': 1,
    'Sri Lanka': 1,
    'Russia': 14,           // Spiritual Administration of Muslims of Russia
    'France': 12,           // Union Organization islamic de France
    'Portugal': 22,         // Comunidade Islamica de Lisboa
    'United Kingdom': 3,
    'Germany': 3,
    'Spain': 3,
    'Italy': 3,
    'Netherlands': 3,
    'Belgium': 3,
    'USA': 2,               // Islamic Society of North America
    'United States': 2,
    'Canada': 2,
    'Australia': 3,
    'South Africa': 3
}

export function getMethodForCountry(country) {
    if (!country) return DEFAULT_METHOD
    return COUNTRY_METHODS[country] ?? DEFAULT_METHOD
}
