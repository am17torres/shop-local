/* Mock data for the Burnt Hills Local Marketplace demo.
   Everything here is hardcoded — there is no server. */

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
];

BH.categories = [
  { id: "home-garden", name: "Home & Garden" },
  { id: "pantry", name: "Pantry & Food" },
  { id: "hardware", name: "Hardware" },
];

/* Products carry typed "features" so the faceted search can filter on them.
   type: enum | number | boolean   (mirrors the real data model) */
BH.products = [
  {
    id: "p-terracotta-8",
    shopId: "hillside-pottery",
    category: "home-garden",
    name: 'Terracotta Planter, 8"',
    brand: "Hillside",
    price: 28.0,
    inStock: true,
    emoji: "\u{1FAB4}",
    desc: "Classic hand-thrown terracotta with a drainage hole.",
    features: { material: "terracotta", diameter: 8, drainage: true },
  },
  {
    id: "p-stoneware-6",
    shopId: "hillside-pottery",
    category: "home-garden",
    name: 'Stoneware Bowl Planter, 6"',
    brand: "Hillside",
    price: 34.0,
    inStock: true,
    emoji: "\u{1F375}",
    desc: "Speckled glaze, sealed base. No drainage hole.",
    features: { material: "stoneware", diameter: 6, drainage: false },
  },
  {
    id: "p-ceramic-5",
    shopId: "hillside-pottery",
    category: "home-garden",
    name: 'Glazed Ceramic Pot, 5"',
    brand: "Hillside",
    price: 22.0,
    inStock: true,
    emoji: "\u{1FAB4}",
    desc: "Sage-green glaze, perfect for herbs on a windowsill.",
    features: { material: "ceramic", diameter: 5, drainage: true },
  },
  {
    id: "p-strawberry-jam",
    shopId: "maple-main-grocer",
    category: "pantry",
    name: "Strawberry Jam",
    brand: "Maple & Main",
    price: 7.5,
    inStock: true,
    emoji: "\u{1F353}",
    desc: "Small-batch, made from local June berries.",
    features: { organic: true, size: "8 oz" },
  },
  {
    id: "p-wildflower-honey",
    shopId: "maple-main-grocer",
    category: "pantry",
    name: "Wildflower Honey",
    brand: "Maple & Main",
    price: 11.0,
    inStock: true,
    emoji: "\u{1F36F}",
    desc: "Raw and unfiltered, from hives off Kingsley Rd.",
    features: { organic: true, size: "12 oz" },
  },
  {
    id: "p-sourdough",
    shopId: "maple-main-grocer",
    category: "pantry",
    name: "Sourdough Loaf",
    brand: "Maple & Main",
    price: 6.0,
    inStock: false,
    emoji: "\u{1F35E}",
    desc: "Baked fresh each morning. Sells out fast.",
    features: { organic: false, size: "1 loaf" },
  },
  {
    id: "p-claw-hammer",
    shopId: "burnt-hills-hardware",
    category: "hardware",
    name: "16 oz Claw Hammer",
    brand: "Estwing",
    price: 24.0,
    inStock: true,
    emoji: "\u{1F528}",
    desc: "Forged steel, leather grip. A lifetime tool.",
    features: { material: "steel", cordless: false },
  },
  {
    id: "p-potting-soil",
    shopId: "the-garden-shed",
    category: "home-garden",
    name: "Organic Potting Soil, 8 qt",
    brand: "Garden Shed",
    price: 9.5,
    inStock: true,
    emoji: "\u{1FAB4}",
    desc: "Peat-free blend, mixed in-house.",
    features: { organic: true, size: "8 qt" },
  },
  {
    id: "p-basil-seedling",
    shopId: "the-garden-shed",
    category: "home-garden",
    name: "Basil Seedling",
    brand: "Garden Shed",
    price: 4.0,
    inStock: true,
    emoji: "\u{1F331}",
    desc: "Genovese basil, ready to transplant.",
    features: { organic: true, size: "3 in pot" },
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
