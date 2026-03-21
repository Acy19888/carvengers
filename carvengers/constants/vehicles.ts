/** Real makes and models for the German used car market */

export const VEHICLE_MAKES = [
  "Volkswagen",
  "Mercedes-Benz",
  "BMW",
  "Audi",
  "Opel",
  "Škoda",
  "Ford",
  "Toyota",
  "Hyundai",
  "Renault",
  "Seat",
  "CUPRA",
  "Kia",
  "Fiat",
  "Peugeot",
  "Citroën",
  "Dacia",
  "Mazda",
  "Nissan",
  "Volvo",
  "Mini",
  "Porsche",
  "Tesla",
  "Honda",
  "Suzuki",
  "Mitsubishi",
  "Jeep",
  "Land Rover",
  "Jaguar",
  "Alfa Romeo",
  "Subaru",
  "Smart",
  "BYD",
  "MG",
  "Sonstige",
] as const;

export type VehicleMake = (typeof VEHICLE_MAKES)[number];

export const VEHICLE_MODELS: Record<string, string[]> = {
  Volkswagen: [
    "Golf", "Tiguan", "T-Roc", "Passat", "Polo", "ID.3", "ID.4", "ID.7",
    "Touran", "T-Cross", "Arteon", "Taigo", "Up!", "Caddy", "Touareg",
    "ID.5", "ID. Buzz", "Multivan", "Transporter",
  ],
  "Mercedes-Benz": [
    "C-Klasse", "E-Klasse", "A-Klasse", "GLC", "GLE", "B-Klasse", "CLA",
    "GLA", "GLB", "S-Klasse", "EQA", "EQB", "EQC", "EQE", "EQS",
    "Vito", "V-Klasse", "Sprinter", "AMG GT",
  ],
  BMW: [
    "3er", "1er", "X1", "X3", "5er", "X5", "2er", "4er", "X2", "X4",
    "7er", "X6", "X7", "iX", "iX1", "iX3", "i4", "i5", "i7",
    "Z4", "M3", "M4",
  ],
  Audi: [
    "A3", "A4", "A6", "Q3", "Q5", "A1", "Q2", "Q7", "Q8", "A5",
    "e-tron", "Q4 e-tron", "Q8 e-tron", "A7", "A8", "TT", "RS3",
    "RS6", "S3", "S4",
  ],
  Opel: [
    "Corsa", "Astra", "Mokka", "Crossland", "Grandland", "Zafira",
    "Combo", "Insignia", "Vivaro", "Rocks-e",
  ],
  "Škoda": [
    "Octavia", "Fabia", "Kodiaq", "Karoq", "Superb", "Kamiq",
    "Enyaq", "Elroq", "Scala", "Citigo",
  ],
  Ford: [
    "Focus", "Fiesta", "Kuga", "Puma", "Explorer", "Mustang",
    "Mustang Mach-E", "Transit", "Tourneo", "Galaxy", "S-Max", "Ranger",
  ],
  Toyota: [
    "Corolla", "Yaris", "RAV4", "C-HR", "Aygo X", "Camry",
    "Yaris Cross", "Highlander", "Proace", "bZ4X", "Land Cruiser", "GR86",
  ],
  Hyundai: [
    "Tucson", "i20", "i30", "Kona", "Ioniq 5", "Ioniq 6",
    "Bayon", "Santa Fe", "i10", "Staria",
  ],
  Renault: [
    "Clio", "Captur", "Mégane", "Arkana", "Kangoo", "Scénic",
    "Mégane E-Tech", "Austral", "Twingo", "Espace", "Rafale",
  ],
  Seat: [
    "Leon", "Ibiza", "Arona", "Ateca", "Tarraco", "Mii",
  ],
  CUPRA: [
    "Formentor", "Born", "Leon", "Ateca", "Tavascan", "Terramar",
  ],
  Kia: [
    "Ceed", "Sportage", "Niro", "Picanto", "Stonic", "XCeed",
    "EV6", "EV9", "Sorento", "Proceed",
  ],
  Fiat: [
    "500", "Panda", "Tipo", "500X", "500e", "Ducato", "Doblò",
  ],
  Peugeot: [
    "208", "308", "2008", "3008", "5008", "508", "Rifter",
    "e-208", "e-308", "e-2008", "e-3008",
  ],
  "Citroën": [
    "C3", "C3 Aircross", "C4", "C5 Aircross", "Berlingo",
    "ë-C4", "C5 X", "Ami",
  ],
  Dacia: [
    "Sandero", "Duster", "Jogger", "Spring", "Logan",
  ],
  Mazda: [
    "CX-5", "CX-30", "Mazda3", "Mazda2", "MX-5", "CX-60",
    "CX-80", "MX-30",
  ],
  Nissan: [
    "Qashqai", "Juke", "Leaf", "X-Trail", "Micra", "Ariya",
    "Townstar", "Navara",
  ],
  Volvo: [
    "XC40", "XC60", "XC90", "V60", "S60", "V90", "S90",
    "C40", "EX30", "EX90",
  ],
  Mini: [
    "Cooper", "Countryman", "Clubman", "Cabrio", "Paceman",
  ],
  Porsche: [
    "Cayenne", "Macan", "911", "Taycan", "Panamera", "718 Boxster",
    "718 Cayman",
  ],
  Tesla: [
    "Model 3", "Model Y", "Model S", "Model X",
  ],
  Honda: [
    "Civic", "CR-V", "Jazz", "HR-V", "ZR-V", "e:Ny1", "Honda e",
  ],
  Suzuki: [
    "Swift", "Vitara", "S-Cross", "Ignis", "Jimny", "Across",
  ],
  Mitsubishi: [
    "Outlander", "ASX", "Eclipse Cross", "Space Star", "L200",
  ],
  Jeep: [
    "Compass", "Renegade", "Wrangler", "Avenger", "Grand Cherokee",
  ],
  "Land Rover": [
    "Range Rover", "Range Rover Sport", "Range Rover Evoque",
    "Discovery", "Discovery Sport", "Defender",
  ],
  Jaguar: [
    "F-Pace", "E-Pace", "XE", "XF", "I-Pace", "F-Type",
  ],
  "Alfa Romeo": [
    "Giulia", "Stelvio", "Tonale", "Giulietta",
  ],
  Subaru: [
    "Forester", "Outback", "XV", "Impreza", "Solterra", "BRZ",
  ],
  Smart: [
    "fortwo", "forfour", "#1", "#3",
  ],
  BYD: [
    "Atto 3", "Han", "Tang", "Seal", "Dolphin", "Seal U",
  ],
  MG: [
    "ZS", "MG4", "MG5", "HS", "Marvel R", "Cyberster",
  ],
  Sonstige: [],
};

/** Generate year options from current year down to 1990 */
export function getYearOptions(): number[] {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let y = currentYear + 1; y >= 1990; y--) {
    years.push(y);
  }
  return years;
}

/**
 * Optional sub-variants per model (engine / trim).
 * Key format: "Make::Model"
 * If a model has no variants, the picker is hidden.
 */
export const VEHICLE_VARIANTS: Record<string, string[]> = {
  // Mercedes
  "Mercedes-Benz::A-Klasse": ["A 160", "A 180", "A 180 d", "A 200", "A 200 d", "A 220", "A 220 d", "A 250", "A 250 e", "A 35 AMG", "A 45 AMG"],
  "Mercedes-Benz::B-Klasse": ["B 160", "B 180", "B 180 d", "B 200", "B 200 d", "B 220 d", "B 250", "B 250 e"],
  "Mercedes-Benz::C-Klasse": ["C 160", "C 180", "C 180 d", "C 200", "C 200 d", "C 220 d", "C 300", "C 300 d", "C 300 e", "C 43 AMG", "C 63 AMG"],
  "Mercedes-Benz::E-Klasse": ["E 180", "E 200", "E 200 d", "E 220 d", "E 300", "E 300 d", "E 300 e", "E 350", "E 400 d", "E 450", "E 53 AMG", "E 63 AMG"],
  "Mercedes-Benz::S-Klasse": ["S 350 d", "S 400 d", "S 450", "S 500", "S 580", "S 580 e", "S 63 AMG", "S 680 Maybach"],
  "Mercedes-Benz::CLA": ["CLA 180", "CLA 200", "CLA 200 d", "CLA 220 d", "CLA 250", "CLA 250 e", "CLA 35 AMG", "CLA 45 AMG"],
  "Mercedes-Benz::GLA": ["GLA 180", "GLA 200", "GLA 200 d", "GLA 220 d", "GLA 250", "GLA 250 e", "GLA 35 AMG", "GLA 45 AMG"],
  "Mercedes-Benz::GLB": ["GLB 180", "GLB 200", "GLB 200 d", "GLB 220 d", "GLB 250", "GLB 35 AMG"],
  "Mercedes-Benz::GLC": ["GLC 200", "GLC 200 d", "GLC 220 d", "GLC 300", "GLC 300 d", "GLC 300 e", "GLC 400 d", "GLC 43 AMG", "GLC 63 AMG"],
  "Mercedes-Benz::GLE": ["GLE 300 d", "GLE 350 d", "GLE 350 e", "GLE 400 d", "GLE 450", "GLE 53 AMG", "GLE 63 AMG"],
  // BMW
  "BMW::1er": ["116i", "118i", "118d", "120i", "120d", "125i", "128ti", "M135i"],
  "BMW::2er": ["218i", "218d", "220i", "220d", "223i", "M235i", "M240i"],
  "BMW::3er": ["316i", "318i", "318d", "320i", "320d", "330i", "330d", "330e", "M340i", "M340d"],
  "BMW::4er": ["420i", "420d", "430i", "430d", "M440i", "M4"],
  "BMW::5er": ["520i", "520d", "530i", "530d", "530e", "540i", "540d", "M550i", "M5"],
  "BMW::X1": ["sDrive18i", "sDrive18d", "xDrive20i", "xDrive20d", "xDrive23i", "xDrive25e", "M35i"],
  "BMW::X3": ["sDrive18d", "xDrive20i", "xDrive20d", "xDrive30i", "xDrive30d", "xDrive30e", "M40i", "M"],
  "BMW::X5": ["xDrive25d", "xDrive30d", "xDrive40i", "xDrive40d", "xDrive45e", "M50i", "M"],
  // Audi
  "Audi::A3": ["25 TFSI", "30 TFSI", "35 TFSI", "30 TDI", "35 TDI", "40 TFSI e", "S3", "RS 3"],
  "Audi::A4": ["30 TFSI", "35 TFSI", "40 TFSI", "35 TDI", "40 TDI", "45 TFSI", "S4", "RS 4"],
  "Audi::A6": ["40 TFSI", "45 TFSI", "40 TDI", "45 TDI", "50 TDI", "55 TFSI e", "S6", "RS 6"],
  "Audi::Q3": ["35 TFSI", "40 TFSI", "35 TDI", "40 TDI", "RS Q3"],
  "Audi::Q5": ["35 TDI", "40 TFSI", "40 TDI", "45 TFSI", "50 TFSI e", "SQ5", "SQ5 TDI"],
  // VW
  "Volkswagen::Golf": ["1.0 TSI", "1.5 TSI", "2.0 TSI", "1.6 TDI", "2.0 TDI", "GTE", "GTI", "GTD", "R"],
  "Volkswagen::Tiguan": ["1.5 TSI", "2.0 TSI", "2.0 TDI", "eHybrid", "R"],
  "Volkswagen::Passat": ["1.5 TSI", "2.0 TSI", "1.6 TDI", "2.0 TDI", "GTE"],
  "Volkswagen::Polo": ["1.0 TSI", "1.0 TGI", "1.6 TDI", "GTI"],
  "Volkswagen::T-Roc": ["1.0 TSI", "1.5 TSI", "2.0 TSI", "2.0 TDI", "R"],
};

/** Get variants for a make+model combo, or empty array if none */
export function getVariants(make: string, model: string): string[] {
  return VEHICLE_VARIANTS[`${make}::${model}`] ?? [];
}
