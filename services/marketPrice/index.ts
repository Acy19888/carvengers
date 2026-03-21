/**
 * Market Price Comparison Service
 * MVP: Mock data based on make/model/year/mileage
 * Production: Integrate with mobile.de / AutoScout24 API
 */

export interface MarketListing {
  source: string;
  price: number;
  mileage: number;
  year: number;
  location: string;
}

export interface MarketComparison {
  averagePrice: number;
  medianPrice: number;
  lowestPrice: number;
  highestPrice: number;
  sampleSize: number;
  listings: MarketListing[];
  pricePosition: "below" | "average" | "above";
  pricePositionLabel: string;
}

export async function compareMarketPrice(
  make: string,
  model: string,
  year: number,
  mileage: number,
  askingPrice?: number,
): Promise<MarketComparison> {
  await delay(1000);

  // Generate mock comparable listings
  const basePrice = getBasePrice(make, year, mileage);
  const sources = ["mobile.de", "AutoScout24", "Autohero", "Wirkaufendeinauto"];
  const cities = ["München", "Berlin", "Hamburg", "Frankfurt", "Köln", "Stuttgart", "Düsseldorf"];

  const listings: MarketListing[] = [];
  for (let i = 0; i < 8; i++) {
    const variance = 0.8 + Math.random() * 0.4; // ±20%
    const kmVariance = 0.7 + Math.random() * 0.6;
    listings.push({
      source: sources[Math.floor(Math.random() * sources.length)],
      price: Math.round(basePrice * variance / 100) * 100,
      mileage: Math.round(mileage * kmVariance / 1000) * 1000,
      year: year + Math.floor(Math.random() * 3) - 1,
      location: cities[Math.floor(Math.random() * cities.length)],
    });
  }

  const prices = listings.map(l => l.price).sort((a, b) => a - b);
  const avg = Math.round(prices.reduce((s, p) => s + p, 0) / prices.length / 100) * 100;
  const median = prices[Math.floor(prices.length / 2)];

  let position: "below" | "average" | "above" = "average";
  let posLabel = "Im Marktdurchschnitt";
  if (askingPrice) {
    if (askingPrice < avg * 0.9) { position = "below"; posLabel = "Unter Marktwert — gutes Angebot"; }
    else if (askingPrice > avg * 1.1) { position = "above"; posLabel = "Über Marktwert"; }
  }

  return {
    averagePrice: avg,
    medianPrice: median,
    lowestPrice: prices[0],
    highestPrice: prices[prices.length - 1],
    sampleSize: listings.length,
    listings,
    pricePosition: position,
    pricePositionLabel: posLabel,
  };
}

function getBasePrice(make: string, year: number, mileage: number): number {
  const basePrices: Record<string, number> = {
    Volkswagen: 28000, "Mercedes-Benz": 42000, BMW: 40000, Audi: 38000,
    Opel: 22000, "Škoda": 24000, Ford: 23000, Toyota: 26000,
    Hyundai: 25000, Renault: 21000, Tesla: 45000, Porsche: 75000,
    Seat: 22000, Fiat: 18000, Peugeot: 20000, Citroën: 19000,
    Mazda: 24000, Kia: 23000, Nissan: 22000, Honda: 25000,
  };
  const base = basePrices[make] ?? 25000;
  const age = new Date().getFullYear() - year;
  const ageFactor = Math.max(0.15, Math.pow(0.88, age));
  const kmFactor = Math.max(0.5, 1 - (mileage / 300000) * 0.5);
  return Math.round(base * ageFactor * kmFactor);
}

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }
