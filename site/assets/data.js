/* Mock data for the Burnt Hills Local Marketplace demo.
   Everything here is hardcoded — there is no server.
   Vendors are realistic but fictional, inspired by the kinds of family-owned
   shops you find around Burnt Hills / Ballston Lake, NY. Any resemblance to a
   specific real business is coincidental — prices and stock are illustrative. */

window.BH = window.BH || {};

BH.shops = [
  {
    id: "hillside-pottery",
    name: "Hillside Pottery",
    blurb: "Hand-thrown planters & stoneware, made on Lake Hill Rd.",
    inventoryMode: "confirm_only",
    posLabel: "Pen & paper",
    emoji: "\u{1FAB4}",
  },
  {
    id: "maple-main-grocer",
    name: "Maple & Main Grocer",
    blurb: "Local pantry staples, preserves & fresh bread.",
    inventoryMode: "api_sync",
    posLabel: "Square (live sync)",
    emoji: "\u{1F9FA}",
  },
  {
    id: "burnt-hills-hardware",
    name: "Burnt Hills Hardware",
    blurb: "The fix-it shop on Route 50 since 1978.",
    inventoryMode: "periodic",
    posLabel: "Nightly CSV export",
    emoji: "\u{1F528}",
  },
  {
    id: "the-garden-shed",
    name: "The Garden Shed",
    blurb: "Seedlings, soil & all things growing.",
    inventoryMode: "confirm_only",
    posLabel: "Pen & paper",
    emoji: "\u{1F331}",
  },
  {
    id: "lakehill-orchard",
    name: "Lakehill Orchard",
    blurb: "Pick-your-own apples & a farm stand off Lakehill Rd.",
    inventoryMode: "periodic",
    posLabel: "Nightly CSV export",
    emoji: "\u{1F34E}",
  },
  {
    id: "kingsbury-maple",
    name: "Kingsbury Maple Farm",
    blurb: "A family sugarbush, tapping the same woods since the '80s.",
    inventoryMode: "confirm_only",
    posLabel: "Pen & paper",
    emoji: "\u{1F341}",
  },
  {
    id: "ballston-bake-house",
    name: "Ballston Bake House",
    blurb: "Small-batch breads & pastries, baked every morning.",
    inventoryMode: "api_sync",
    posLabel: "Shopify (live sync)",
    emoji: "\u{1F956}",
  },
  {
    id: "round-lake-roasters",
    name: "Round Lake Roasters",
    blurb: "A micro-roastery by the lake. Beans roasted weekly.",
    inventoryMode: "api_sync",
    posLabel: "Square (live sync)",
    emoji: "\u{2615}",
  },
  {
    id: "charlton-creamery",
    name: "Charlton Creamery",
    blurb: "Cheese, butter & yogurt from Charlton cows.",
    inventoryMode: "periodic",
    posLabel: "Weekly CSV export",
    emoji: "\u{1F9C0}",
  },
  {
    id: "spruce-hollow-candles",
    name: "Spruce Hollow Candles",
    blurb: "Hand-poured candles & small-batch soaps.",
    inventoryMode: "confirm_only",
    posLabel: "Pen & paper",
    emoji: "\u{1F56F}\u{FE0F}",
  },
  {
    id: "windy-ridge-farm",
    name: "Windy Ridge Farm",
    blurb: "Pasture-raised eggs & meat from the ridge.",
    inventoryMode: "confirm_only",
    posLabel: "Pen & paper",
    emoji: "\u{1F95A}",
  },
];

BH.categories = [
  { id: "home-garden", name: "Home & Garden" },
  { id: "pantry", name: "Pantry & Food" },
  { id: "hardware", name: "Hardware" },
  { id: "bakery", name: "Bakery" },
  { id: "beverages", name: "Coffee & Drinks" },
  { id: "gifts", name: "Gifts & Crafts" },
];

/* Products carry typed "features" so the faceted search can filter on them.
   type per key: enum (material, roast) | number (diameter) | boolean (organic,
   glutenFree, drainage) | text (size, display only). */
BH.products = [
  // ── Hillside Pottery ──
  {
    id: "p-terracotta-8", shopId: "hillside-pottery", category: "home-garden",
    name: 'Terracotta Planter, 8"', brand: "Hillside", price: 28.0, inStock: true, emoji: "\u{1FAB4}",
    desc: "Classic hand-thrown terracotta with a drainage hole.",
    features: { material: "terracotta", diameter: 8, drainage: true },
  },
  {
    id: "p-stoneware-6", shopId: "hillside-pottery", category: "home-garden",
    name: 'Stoneware Bowl Planter, 6"', brand: "Hillside", price: 34.0, inStock: true, emoji: "\u{1F375}",
    desc: "Speckled glaze, sealed base. No drainage hole.",
    features: { material: "stoneware", diameter: 6, drainage: false },
  },
  {
    id: "p-ceramic-5", shopId: "hillside-pottery", category: "home-garden",
    name: 'Glazed Ceramic Pot, 5"', brand: "Hillside", price: 22.0, inStock: true, emoji: "\u{1FAB4}",
    desc: "Sage-green glaze, perfect for herbs on a windowsill.",
    features: { material: "ceramic", diameter: 5, drainage: true },
  },

  // ── Maple & Main Grocer ──
  {
    id: "p-strawberry-jam", shopId: "maple-main-grocer", category: "pantry",
    name: "Strawberry Jam", brand: "Maple & Main", price: 7.5, inStock: true, emoji: "\u{1F353}",
    desc: "Small-batch, made from local June berries.",
    features: { organic: true, size: "8 oz" },
  },
  {
    id: "p-wildflower-honey", shopId: "maple-main-grocer", category: "pantry",
    name: "Wildflower Honey", brand: "Maple & Main", price: 11.0, inStock: true, emoji: "\u{1F36F}",
    desc: "Raw and unfiltered, from hives off Kingsley Rd.",
    features: { organic: true, size: "12 oz" },
  },
  {
    id: "p-sourdough", shopId: "maple-main-grocer", category: "pantry",
    name: "Sourdough Loaf", brand: "Maple & Main", price: 6.0, inStock: false, emoji: "\u{1F35E}",
    desc: "Baked fresh each morning. Sells out fast.",
    features: { organic: false, glutenFree: false, size: "1 loaf" },
  },

  // ── Burnt Hills Hardware ──
  {
    id: "p-claw-hammer", shopId: "burnt-hills-hardware", category: "hardware",
    name: "16 oz Claw Hammer", brand: "Estwing", price: 24.0, inStock: true, emoji: "\u{1F528}",
    desc: "Forged steel, leather grip. A lifetime tool.",
    features: { material: "steel", cordless: false },
  },
  {
    id: "p-cordless-drill", shopId: "burnt-hills-hardware", category: "hardware",
    name: "20V Cordless Drill", brand: "Ridgeline", price: 89.0, inStock: true, emoji: "\u{1F529}",
    desc: "Two batteries, charger, and a 30-bit set included.",
    features: { material: "steel", cordless: true },
  },
  {
    id: "p-work-gloves", shopId: "burnt-hills-hardware", category: "hardware",
    name: "Leather Work Gloves", brand: "Ridgeline", price: 16.0, inStock: true, emoji: "\u{1F9E4}",
    desc: "Goatskin palm, reinforced fingertips.",
    features: { material: "leather", cordless: false },
  },

  // ── The Garden Shed ──
  {
    id: "p-potting-soil", shopId: "the-garden-shed", category: "home-garden",
    name: "Organic Potting Soil, 8 qt", brand: "Garden Shed", price: 9.5, inStock: true, emoji: "\u{1FAB4}",
    desc: "Peat-free blend, mixed in-house.",
    features: { organic: true, size: "8 qt" },
  },
  {
    id: "p-basil-seedling", shopId: "the-garden-shed", category: "home-garden",
    name: "Basil Seedling", brand: "Garden Shed", price: 4.0, inStock: true, emoji: "\u{1F331}",
    desc: "Genovese basil, ready to transplant.",
    features: { organic: true, size: "3 in pot" },
  },

  // ── Lakehill Orchard ──
  {
    id: "p-honeycrisp", shopId: "lakehill-orchard", category: "pantry",
    name: "Honeycrisp Apples, 3 lb", brand: "Lakehill", price: 6.5, inStock: true, emoji: "\u{1F34E}",
    desc: "Crisp and sweet, picked this week.",
    features: { organic: false, size: "3 lb" },
  },
  {
    id: "p-fresh-cider", shopId: "lakehill-orchard", category: "beverages",
    name: "Fresh-Pressed Cider, ½ gal", brand: "Lakehill", price: 9.0, inStock: true, emoji: "\u{1F9C3}",
    desc: "Unfiltered sweet cider, no added sugar.",
    features: { organic: true, size: "64 oz" },
  },
  {
    id: "p-cider-donuts", shopId: "lakehill-orchard", category: "bakery",
    name: "Cider Donuts (6 pk)", brand: "Lakehill", price: 8.0, inStock: true, emoji: "\u{1F369}",
    desc: "Rolled in cinnamon sugar. Best warm.",
    features: { glutenFree: false, organic: false, size: "6 pk" },
  },

  // ── Kingsbury Maple Farm ──
  {
    id: "p-maple-syrup", shopId: "kingsbury-maple", category: "pantry",
    name: "Pure Maple Syrup, Grade A", brand: "Kingsbury", price: 14.0, inStock: true, emoji: "\u{1F341}",
    desc: "Dark, robust, boiled down over a wood fire.",
    features: { organic: true, size: "12 oz" },
  },

  // ── Ballston Bake House ──
  {
    id: "p-baguette", shopId: "ballston-bake-house", category: "bakery",
    name: "Country Baguette", brand: "Ballston Bake House", price: 4.5, inStock: true, emoji: "\u{1F956}",
    desc: "Crackly crust, open crumb. Baked at 6 a.m.",
    features: { glutenFree: false, organic: false, size: "1 loaf" },
  },
  {
    id: "p-gf-banana-bread", shopId: "ballston-bake-house", category: "bakery",
    name: "Gluten-Free Banana Bread", brand: "Ballston Bake House", price: 9.0, inStock: true, emoji: "\u{1F34C}",
    desc: "Almond-flour loaf, naturally gluten-free.",
    features: { glutenFree: true, organic: false, size: "1 loaf" },
  },
  {
    id: "p-cinnamon-rolls", shopId: "ballston-bake-house", category: "bakery",
    name: "Cinnamon Rolls (4 pk)", brand: "Ballston Bake House", price: 10.0, inStock: true, emoji: "\u{1F950}",
    desc: "Cream-cheese frosting, pull-apart soft.",
    features: { glutenFree: false, organic: false, size: "4 pk" },
  },
  {
    id: "p-brown-butter-cookies", shopId: "ballston-bake-house", category: "bakery",
    name: "Brown-Butter Cookies (dozen)", brand: "Ballston Bake House", price: 12.0, inStock: false, emoji: "\u{1F36A}",
    desc: "Chewy centers, crisp edges, flaky salt.",
    features: { glutenFree: false, organic: false, size: "12 ct" },
  },

  // ── Round Lake Roasters ──
  {
    id: "p-house-blend", shopId: "round-lake-roasters", category: "beverages",
    name: "House Blend Beans, 12 oz", brand: "Round Lake", price: 15.0, inStock: true, emoji: "\u{2615}",
    desc: "Balanced, chocolatey, all-day coffee.",
    features: { roast: "medium", organic: true, size: "12 oz" },
  },
  {
    id: "p-dark-roast", shopId: "round-lake-roasters", category: "beverages",
    name: "Midnight Dark Roast, 12 oz", brand: "Round Lake", price: 16.0, inStock: true, emoji: "\u{2615}",
    desc: "Bold and smoky, great for espresso.",
    features: { roast: "dark", organic: true, size: "12 oz" },
  },
  {
    id: "p-light-roast", shopId: "round-lake-roasters", category: "beverages",
    name: "Sunrise Light Roast, 12 oz", brand: "Round Lake", price: 15.5, inStock: true, emoji: "\u{2615}",
    desc: "Bright and fruity single-origin.",
    features: { roast: "light", organic: false, size: "12 oz" },
  },

  // ── Charlton Creamery ──
  {
    id: "p-aged-cheddar", shopId: "charlton-creamery", category: "pantry",
    name: "Aged Cheddar, 8 oz", brand: "Charlton", price: 9.5, inStock: true, emoji: "\u{1F9C0}",
    desc: "Sharp, two-year cheddar.",
    features: { organic: false, size: "8 oz" },
  },
  {
    id: "p-greek-yogurt", shopId: "charlton-creamery", category: "pantry",
    name: "Whole-Milk Greek Yogurt, 16 oz", brand: "Charlton", price: 6.0, inStock: true, emoji: "\u{1F95B}",
    desc: "Thick and tangy, nothing added.",
    features: { organic: true, size: "16 oz" },
  },
  {
    id: "p-cultured-butter", shopId: "charlton-creamery", category: "pantry",
    name: "Cultured Butter, 8 oz", brand: "Charlton", price: 7.5, inStock: true, emoji: "\u{1F9C8}",
    desc: "Slow-cultured, lightly salted.",
    features: { organic: true, size: "8 oz" },
  },

  // ── Spruce Hollow Candles ──
  {
    id: "p-soy-candle", shopId: "spruce-hollow-candles", category: "gifts",
    name: "Balsam Soy Candle, 8 oz", brand: "Spruce Hollow", price: 18.0, inStock: true, emoji: "\u{1F56F}\u{FE0F}",
    desc: "Hand-poured soy wax, cotton wick, ~40 hr burn.",
    features: { material: "soy wax", size: "8 oz" },
  },
  {
    id: "p-beeswax-tapers", shopId: "spruce-hollow-candles", category: "gifts",
    name: "Beeswax Taper Pair", brand: "Spruce Hollow", price: 12.0, inStock: true, emoji: "\u{1F56F}\u{FE0F}",
    desc: "Pure beeswax, dripless, 10-inch.",
    features: { material: "beeswax", size: "2 pc" },
  },
  {
    id: "p-oatmeal-soap", shopId: "spruce-hollow-candles", category: "gifts",
    name: "Oatmeal & Honey Soap", brand: "Spruce Hollow", price: 6.5, inStock: true, emoji: "\u{1F9FC}",
    desc: "Cold-process bar, gentle exfoliant.",
    features: { organic: true, size: "4 oz" },
  },

  // ── Windy Ridge Farm ──
  {
    id: "p-eggs", shopId: "windy-ridge-farm", category: "pantry",
    name: "Pasture-Raised Eggs, dozen", brand: "Windy Ridge", price: 7.0, inStock: true, emoji: "\u{1F95A}",
    desc: "Mixed brown & blue, collected daily.",
    features: { organic: true, size: "12 ct" },
  },
  {
    id: "p-ground-beef", shopId: "windy-ridge-farm", category: "pantry",
    name: "Grass-Fed Ground Beef, 1 lb", brand: "Windy Ridge", price: 11.0, inStock: true, emoji: "\u{1F969}",
    desc: "85/15, frozen, from the ridge herd.",
    features: { organic: false, size: "1 lb" },
  },
];

/* Demo delivery windows. */
BH.deliveryWindows = [
  { id: "today-pm", label: "Today, 4–7 PM", cutoff: "Order by 1 PM" },
  { id: "tomorrow-am", label: "Tomorrow, 9–12 PM", cutoff: "Order by 8 PM today" },
];

BH.lookups = {
  shop: (id) => BH.shops.find((s) => s.id === id),
  product: (id) => BH.products.find((p) => p.id === id),
};
