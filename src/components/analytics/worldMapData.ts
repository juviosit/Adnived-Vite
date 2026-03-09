// Country name → ISO alpha-2 / alpha-3 mapping for matching pageview country values
// to world-atlas TopoJSON properties

// ISO alpha-2 → full country name (reverse lookup)
export const ISO_TO_COUNTRY_NAME: Record<string, string> = {};

export const COUNTRY_NAME_TO_ISO: Record<string, string> = {
  // Common names → ISO A2
  "United States": "US", "USA": "US", "US": "US",
  "Canada": "CA", "Mexico": "MX", "Brazil": "BR",
  "Argentina": "AR", "Chile": "CL", "Colombia": "CO",
  "Peru": "PE", "Venezuela": "VE", "Ecuador": "EC",
  "Uruguay": "UY", "Paraguay": "PY", "Bolivia": "BO",
  "Costa Rica": "CR", "Panama": "PA", "Cuba": "CU",
  "Guatemala": "GT", "Honduras": "HN", "El Salvador": "SV",
  "Nicaragua": "NI", "Dominican Republic": "DO", "Jamaica": "JM",
  "Trinidad and Tobago": "TT", "Haiti": "HT",
  "United Kingdom": "GB", "UK": "GB", "France": "FR",
  "Germany": "DE", "Italy": "IT", "Spain": "ES",
  "Portugal": "PT", "Netherlands": "NL", "Belgium": "BE",
  "Switzerland": "CH", "Austria": "AT", "Poland": "PL",
  "Sweden": "SE", "Norway": "NO", "Finland": "FI",
  "Denmark": "DK", "Ireland": "IE", "Iceland": "IS",
  "Russia": "RU", "Russian Federation": "RU",
  "China": "CN", "India": "IN", "Japan": "JP",
  "South Korea": "KR", "Korea, Republic of": "KR",
  "Australia": "AU", "New Zealand": "NZ",
  "South Africa": "ZA", "Nigeria": "NG", "Egypt": "EG",
  "Kenya": "KE", "Ethiopia": "ET", "Ghana": "GH",
  "Tanzania": "TZ", "Morocco": "MA", "Algeria": "DZ",
  "Tunisia": "TN", "Libya": "LY",
  "Saudi Arabia": "SA", "United Arab Emirates": "AE", "UAE": "AE",
  "Iran": "IR", "Iraq": "IQ", "Turkey": "TR", "Türkiye": "TR",
  "Ukraine": "UA", "Romania": "RO", "Hungary": "HU",
  "Czech Republic": "CZ", "Czechia": "CZ",
  "Greece": "GR", "Bulgaria": "BG", "Serbia": "RS",
  "Croatia": "HR", "Slovakia": "SK",
  "Thailand": "TH", "Vietnam": "VN", "Malaysia": "MY",
  "Indonesia": "ID", "Philippines": "PH",
  "Pakistan": "PK", "Bangladesh": "BD", "Myanmar": "MM",
  "Cambodia": "KH", "Nepal": "NP", "Sri Lanka": "LK",
  "Singapore": "SG", "Taiwan": "TW",
  "Kazakhstan": "KZ", "Uzbekistan": "UZ", "Afghanistan": "AF",
  "Kuwait": "KW", "Qatar": "QA", "Oman": "OM",
  "Yemen": "YE", "Jordan": "JO", "Israel": "IL",
  "Lebanon": "LB", "Syria": "SY", "Mongolia": "MN",
  "North Korea": "KP", "Laos": "LA",
  "Mozambique": "MZ", "Malawi": "MW", "Zimbabwe": "ZW",
  "Zambia": "ZM", "Botswana": "BW", "Namibia": "NA",
  "Angola": "AO", "Congo": "CD",
  "Democratic Republic of the Congo": "CD",
  "Cameroon": "CM", "Ivory Coast": "CI", "Côte d'Ivoire": "CI",
  "Senegal": "SN", "Mali": "ML", "Niger": "NE",
  "Chad": "TD", "Sudan": "SD", "South Sudan": "SS",
  "Uganda": "UG", "Rwanda": "RW", "Madagascar": "MG",
  "Somalia": "SO", "Liberia": "LR", "Sierra Leone": "SL",
  "Guinea": "GN", "Burkina Faso": "BF", "Benin": "BJ",
  "Togo": "TG", "Gabon": "GA",
  "Republic of the Congo": "CG",
  "Equatorial Guinea": "GQ", "Eritrea": "ER",
  "Djibouti": "DJ", "Central African Republic": "CF",
  "Lithuania": "LT", "Latvia": "LV", "Estonia": "EE",
  "Belarus": "BY", "Moldova": "MD",
  "Georgia": "GE", "Armenia": "AM", "Azerbaijan": "AZ",
  "Turkmenistan": "TM", "Kyrgyzstan": "KG", "Tajikistan": "TJ",
  "Bosnia and Herzegovina": "BA", "Montenegro": "ME",
  "Albania": "AL", "North Macedonia": "MK", "Macedonia": "MK",
  "Slovenia": "SI", "Luxembourg": "LU",
  "Hong Kong": "HK", "Macao": "MO",
  "Papua New Guinea": "PG", "Fiji": "FJ",
};

// Build reverse lookup: pick the longest (most descriptive) name for each ISO code
const _preferred: Record<string, string> = {};
Object.entries(COUNTRY_NAME_TO_ISO).forEach(([name, iso]) => {
  if (!_preferred[iso] || name.length > _preferred[iso].length) {
    _preferred[iso] = name;
  }
});
// Override with clean canonical names
const _canonical: Record<string, string> = {
  US: "United States", GB: "United Kingdom", AE: "United Arab Emirates",
  KR: "South Korea", KP: "North Korea", CD: "Democratic Republic of the Congo",
  CG: "Republic of the Congo", CI: "Côte d'Ivoire", CZ: "Czech Republic",
  MK: "North Macedonia", RU: "Russia", TR: "Turkey", CF: "Central African Republic",
  BA: "Bosnia and Herzegovina", TT: "Trinidad and Tobago",
};
Object.assign(_preferred, _canonical);
Object.assign(ISO_TO_COUNTRY_NAME, _preferred);
