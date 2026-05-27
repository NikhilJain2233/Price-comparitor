/**
 * server.js — PriceRadar Backend
 *
 * Stack: Node.js + Express
 * Install: npm install express cors node-fetch dotenv
 * Run:     node server.js
 *
 * SET YOUR KEY: create a .env file with:
 *   ANTHROPIC_API_KEY=sk-ant-...
 */

require('dotenv').config();
const express  = require('express');
const cors     = require('cors');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('frontend')); // Serve index.html, style.css, app.js from frontend folder


// ─── Product Database (Fallback / Cache) ─────────────────────

const PRODUCT_DB = {
  "boat airdopes 141": {
    product: "boAt Airdopes 141 Bluetooth Earbuds",
    category: "Electronics",
    verdict: "Flipkart offers the best price-to-value ratio for boAt Airdopes 141, with a lower price and reliable seller. Amazon is the safest choice if you want fast delivery and hassle-free returns. Avoid Meesho for electronics — the lack of brand warranty is a significant risk for a product that may need servicing. Croma is ideal if you prefer in-store support and guaranteed authenticity.",
    platforms: [
      { name:"Amazon",   icon:"A",  color:"#FF9900", price:1299, originalPrice:1990, discount:"35% off", rating:4.3, reviews:"28,941", deliveryDays:"1-2 days", deliveryType:"free",  fast:true,  returnPolicy:"10-day returns", warranty:"1 year brand", seller:"Cloudtail India", score:87 },
      { name:"Flipkart", icon:"F",  color:"#2874F0", price:1199, originalPrice:1990, discount:"40% off", rating:4.1, reviews:"19,204", deliveryDays:"2-3 days", deliveryType:"free",  fast:false, returnPolicy:"7-day returns",  warranty:"1 year brand", seller:"RetailNet",      score:84 },
      { name:"Meesho",   icon:"M",  color:"#F43397", price:999,  originalPrice:1990, discount:"50% off", rating:3.5, reviews:"6,812",  deliveryDays:"5-7 days", deliveryType:"free",  fast:false, returnPolicy:"No returns (electronics)", warranty:"No warranty", seller:"3rd party", score:48 },
      { name:"Croma",    icon:"C",  color:"#47A527", price:1499, originalPrice:1990, discount:"25% off", rating:4.6, reviews:"3,102",  deliveryDays:"2 days",   deliveryType:"paid",  fast:true,  returnPolicy:"15-day returns", warranty:"1 yr + free demo", seller:"Croma Retail", score:79 },
      { name:"Snapdeal", icon:"S",  color:"#E40046", price:1249, originalPrice:1990, discount:"37% off", rating:3.7, reviews:"4,500",  deliveryDays:"5-8 days", deliveryType:"paid",  fast:false, returnPolicy:"7-day returns",  warranty:"Seller warranty", seller:"ElectroHub", score:61 },
    ],
    pros: {
      Amazon:   ["Trusted seller","Fast delivery","Easy returns"],
      Flipkart: ["Lowest legit price","Good discount","Reliable"],
      Meesho:   ["Cheapest option","Free delivery"],
      Croma:    ["Best return policy","Authentic product","In-store support"],
      Snapdeal: ["Decent discount"]
    },
    cons: {
      Amazon:   ["Not cheapest"],
      Flipkart: ["Slightly slower"],
      Meesho:   ["No returns","No warranty","Counterfeit risk"],
      Croma:    ["Most expensive","Paid delivery"],
      Snapdeal: ["Slow delivery","Low trust score","Risky seller"]
    }
  },

  "iphone 15": {
    product: "Apple iPhone 15 (128GB, Black)",
    category: "Smartphones",
    verdict: "Amazon and Flipkart are the best bets for iPhone 15 — both are authorised sellers with brand warranty and reliable delivery. Flipkart often edges out with exchange offers and bank discounts. Croma and Apple Stores are premium choices with excellent official after-sales support. Never purchase iPhones from Meesho or Snapdeal — counterfeit risk is extremely high and you will lose both money and warranty coverage.",
    platforms: [
      { name:"Amazon",   icon:"A", color:"#FF9900", price:69999, originalPrice:79900, discount:"12% off", rating:4.6, reviews:"14,882", deliveryDays:"1-2 days", deliveryType:"free", fast:true,  returnPolicy:"10-day returns", warranty:"1 year Apple", seller:"Appario Retail", score:91 },
      { name:"Flipkart", icon:"F", color:"#2874F0", price:68999, originalPrice:79900, discount:"14% off", rating:4.5, reviews:"11,203", deliveryDays:"2-3 days", deliveryType:"free", fast:false, returnPolicy:"7-day returns",  warranty:"1 year Apple", seller:"FK Retail",      score:89 },
      { name:"Meesho",   icon:"M", color:"#F43397", price:61999, originalPrice:79900, discount:"22% off", rating:2.9, reviews:"1,203",  deliveryDays:"7-10 days",deliveryType:"free", fast:false, returnPolicy:"No returns",     warranty:"No warranty", seller:"Unknown",       score:22 },
      { name:"Croma",    icon:"C", color:"#47A527", price:72999, originalPrice:79900, discount:"9% off",  rating:4.7, reviews:"5,400",  deliveryDays:"2 days",   deliveryType:"free", fast:true,  returnPolicy:"15-day returns", warranty:"1 yr + store support", seller:"Croma Retail", score:83 },
      { name:"Snapdeal", icon:"S", color:"#E40046", price:64999, originalPrice:79900, discount:"19% off", rating:3.1, reviews:"2,100",  deliveryDays:"7-9 days", deliveryType:"paid", fast:false, returnPolicy:"7-day returns",  warranty:"Seller only", seller:"MobileZone",   score:31 },
    ],
    pros: {
      Amazon:   ["Authorised seller","Fast 1-2 day delivery","Hassle-free returns"],
      Flipkart: ["Best price","Exchange offers","Trusted platform"],
      Meesho:   ["Very cheap price"],
      Croma:    ["Official Apple support","Best return policy","In-store service"],
      Snapdeal: ["Low price"]
    },
    cons: {
      Amazon:   ["Slightly pricier than Flipkart"],
      Flipkart: ["Stock may vary"],
      Meesho:   ["Very likely fake product","Zero warranty","Extremely high risk"],
      Croma:    ["Most expensive option"],
      Snapdeal: ["Possibly counterfeit","No official warranty","Slow delivery"]
    }
  },

  "samsung galaxy s24": {
    product: "Samsung Galaxy S24 (8GB/128GB, Onyx Black)",
    category: "Smartphones",
    verdict: "Flipkart is the go-to platform for Samsung Galaxy S24 — it consistently offers the best price with frequent bank card additional discounts. Amazon is a close second with faster delivery. Croma is excellent for those who want Samsung's official in-store service. Avoid Meesho and Snapdeal entirely for flagship phones as the counterfeit risk is not worth any price difference.",
    platforms: [
      { name:"Amazon",   icon:"A", color:"#FF9900", price:54999, originalPrice:74999, discount:"27% off", rating:4.5, reviews:"8,301",  deliveryDays:"1-2 days", deliveryType:"free", fast:true,  returnPolicy:"10-day returns", warranty:"1 year Samsung", seller:"Appario Retail", score:88 },
      { name:"Flipkart", icon:"F", color:"#2874F0", price:52999, originalPrice:74999, discount:"29% off", rating:4.4, reviews:"9,840",  deliveryDays:"2-3 days", deliveryType:"free", fast:false, returnPolicy:"7-day returns",  warranty:"1 year Samsung", seller:"FK Retail",      score:90 },
      { name:"Meesho",   icon:"M", color:"#F43397", price:46999, originalPrice:74999, discount:"37% off", rating:2.7, reviews:"912",    deliveryDays:"8-12 days",deliveryType:"free", fast:false, returnPolicy:"No returns",     warranty:"No warranty", seller:"Unknown",       score:18 },
      { name:"Croma",    icon:"C", color:"#47A527", price:56999, originalPrice:74999, discount:"24% off", rating:4.6, reviews:"3,812",  deliveryDays:"2 days",   deliveryType:"free", fast:true,  returnPolicy:"15-day returns", warranty:"1 yr + Samsung Care", seller:"Croma Retail", score:81 },
      { name:"Snapdeal", icon:"S", color:"#E40046", price:49999, originalPrice:74999, discount:"33% off", rating:3.0, reviews:"1,550",  deliveryDays:"6-9 days", deliveryType:"paid", fast:false, returnPolicy:"7-day returns",  warranty:"Seller only", seller:"GadgetWorld",  score:28 },
    ],
    pros: {
      Amazon:   ["Very fast delivery","Trusted platform","Easy returns"],
      Flipkart: ["Lowest price","Best deals","Bank card discounts"],
      Meesho:   ["Cheapest listing"],
      Croma:    ["Samsung Care+","Best after-sales","Official stock"],
      Snapdeal: ["Lower price"]
    },
    cons: {
      Amazon:   ["Not cheapest"],
      Flipkart: ["Delivery slightly slower than Amazon"],
      Meesho:   ["Likely fake/refurb","No warranty","Extremely dangerous buy"],
      Croma:    ["Most expensive","No price negotiation"],
      Snapdeal: ["Suspicious low price","Slow delivery","High risk"]
    }
  },

  "nike air max 270": {
    product: "Nike Air Max 270 Running Shoes",
    category: "Footwear",
    verdict: "Myntra is the best platform for Nike Air Max 270 — it frequently runs sales and carries official Nike stock with a generous 30-day return window. Amazon is a close second with faster delivery. Flipkart is reliable but size inventory can vary. Avoid Meesho at all costs — counterfeit Nike shoes are rampant and you will likely receive a fake product.",
    platforms: [
      { name:"Amazon",   icon:"A",  color:"#FF9900", price:8995,  originalPrice:12995, discount:"31% off", rating:4.4, reviews:"5,203", deliveryDays:"2 days",   deliveryType:"free", fast:true,  returnPolicy:"30-day returns", warranty:"Nike brand", seller:"Nike India",   score:88 },
      { name:"Flipkart", icon:"F",  color:"#2874F0", price:8499,  originalPrice:12995, discount:"35% off", rating:4.2, reviews:"3,910", deliveryDays:"3 days",   deliveryType:"free", fast:false, returnPolicy:"10-day returns", warranty:"Nike brand", seller:"SportsHub",   score:82 },
      { name:"Myntra",   icon:"Mn", color:"#FF3F6C", price:7995,  originalPrice:12995, discount:"38% off", rating:4.5, reviews:"9,102", deliveryDays:"3-4 days", deliveryType:"free", fast:false, returnPolicy:"30-day returns", warranty:"Nike brand", seller:"Nike Official",score:91 },
      { name:"Meesho",   icon:"M",  color:"#F43397", price:5499,  originalPrice:12995, discount:"58% off", rating:3.1, reviews:"2,100", deliveryDays:"7-10 days",deliveryType:"free", fast:false, returnPolicy:"No returns",     warranty:"No warranty",seller:"FashionDeals",score:35 },
      { name:"Croma",    icon:"C",  color:"#47A527", price:10995, originalPrice:12995, discount:"15% off", rating:4.3, reviews:"820",   deliveryDays:"2 days",   deliveryType:"paid", fast:true,  returnPolicy:"15-day returns", warranty:"Nike brand", seller:"Croma Retail", score:65 },
    ],
    pros: {
      Amazon:   ["Authentic Nike","Fast delivery","Long 30-day return window"],
      Flipkart: ["Good price","Trusted platform"],
      Myntra:   ["Lowest price","Best for fashion","30-day easy returns"],
      Meesho:   ["Cheapest price"],
      Croma:    ["Genuine product","Fast delivery","Good return policy"]
    },
    cons: {
      Amazon:   ["Not cheapest option"],
      Flipkart: ["Size availability varies"],
      Myntra:   ["Slightly slower delivery"],
      Meesho:   ["Almost certainly fake","No returns on footwear","Avoid!"],
      Croma:    ["Most expensive","Paid delivery"]
    }
  },

  "sony wh-1000xm5": {
    product: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
    category: "Electronics",
    verdict: "Amazon is the safest and best overall option for the Sony WH-1000XM5 — it's an authorised seller with fast delivery and full Sony warranty. Flipkart matches closely and sometimes edges on price. Croma is worth checking for EMI deals and Sony service centre support. This is a premium ₹25,000+ product — never risk it on Meesho or Snapdeal where counterfeit headphones are common.",
    platforms: [
      { name:"Amazon",   icon:"A", color:"#FF9900", price:24990, originalPrice:34990, discount:"29% off", rating:4.6, reviews:"7,412", deliveryDays:"1-2 days", deliveryType:"free", fast:true,  returnPolicy:"10-day returns", warranty:"1 year Sony", seller:"Appario Retail", score:93 },
      { name:"Flipkart", icon:"F", color:"#2874F0", price:24499, originalPrice:34990, discount:"30% off", rating:4.5, reviews:"5,890", deliveryDays:"2-3 days", deliveryType:"free", fast:false, returnPolicy:"7-day returns",  warranty:"1 year Sony", seller:"FK Retail",      score:90 },
      { name:"Meesho",   icon:"M", color:"#F43397", price:18999, originalPrice:34990, discount:"46% off", rating:2.8, reviews:"1,100", deliveryDays:"8-12 days",deliveryType:"free", fast:false, returnPolicy:"No returns",     warranty:"No warranty", seller:"Unknown",       score:15 },
      { name:"Croma",    icon:"C", color:"#47A527", price:26990, originalPrice:34990, discount:"23% off", rating:4.7, reviews:"2,100", deliveryDays:"2 days",   deliveryType:"free", fast:true,  returnPolicy:"15-day returns", warranty:"1 yr + Sony service centre", seller:"Croma Retail", score:82 },
      { name:"Snapdeal", icon:"S", color:"#E40046", price:21999, originalPrice:34990, discount:"37% off", rating:3.0, reviews:"2,300", deliveryDays:"6-9 days", deliveryType:"paid", fast:false, returnPolicy:"7-day returns",  warranty:"Seller only", seller:"AudioDeals",    score:29 },
    ],
    pros: {
      Amazon:   ["Best overall deal","Fast delivery","Genuine Sony warranty"],
      Flipkart: ["Cheapest legit option","Trusted platform"],
      Meesho:   ["Lowest price"],
      Croma:    ["Sony service centre support","Premium experience","Best returns"],
      Snapdeal: ["Lower price"]
    },
    cons: {
      Amazon:   ["Not absolute cheapest"],
      Flipkart: ["Slightly slower delivery"],
      Meesho:   ["Almost certainly counterfeit","High financial risk","Avoid completely"],
      Croma:    ["Most expensive","No price advantage"],
      Snapdeal: ["Likely grey market stock","No real warranty","Avoid"]
    }
  },

  "instant pot": {
    product: "Instant Pot Duo 7-in-1 Electric Pressure Cooker (6L)",
    category: "Kitchen Appliances",
    verdict: "Amazon is the clear winner for Instant Pot — it is the authorised seller with the best mix of price, fast delivery, and strong after-sales support. Flipkart is a reliable second option. Croma is good if you want in-store cooking demos and service support. The significant price gap between Amazon and Croma makes Amazon the smart choice for most buyers.",
    platforms: [
      { name:"Amazon",   icon:"A", color:"#FF9900", price:7495, originalPrice:10995, discount:"32% off", rating:4.4, reviews:"21,300", deliveryDays:"1-2 days", deliveryType:"free", fast:true,  returnPolicy:"10-day returns", warranty:"1 year brand", seller:"Instant Pot India", score:92 },
      { name:"Flipkart", icon:"F", color:"#2874F0", price:7799, originalPrice:10995, discount:"29% off", rating:4.3, reviews:"14,200", deliveryDays:"3 days",   deliveryType:"free", fast:false, returnPolicy:"10-day returns", warranty:"1 year brand", seller:"RetailNet",        score:83 },
      { name:"Meesho",   icon:"M", color:"#F43397", price:5999, originalPrice:10995, discount:"45% off", rating:3.2, reviews:"3,100",  deliveryDays:"7-10 days",deliveryType:"free", fast:false, returnPolicy:"5-day returns",  warranty:"No warranty", seller:"HomeDeals",        score:44 },
      { name:"Croma",    icon:"C", color:"#47A527", price:8999, originalPrice:10995, discount:"18% off", rating:4.5, reviews:"2,800",  deliveryDays:"2 days",   deliveryType:"paid", fast:true,  returnPolicy:"15-day returns", warranty:"1 yr + in-store service", seller:"Croma Retail", score:76 },
      { name:"Snapdeal", icon:"S", color:"#E40046", price:7199, originalPrice:10995, discount:"35% off", rating:3.6, reviews:"4,100",  deliveryDays:"5-7 days", deliveryType:"paid", fast:false, returnPolicy:"7-day returns",  warranty:"Seller warranty", seller:"KitchenWorld",  score:59 },
    ],
    pros: {
      Amazon:   ["Authorised seller","Fastest delivery","Best price","Easy returns"],
      Flipkart: ["Trusted platform","Good warranty coverage"],
      Meesho:   ["Cheapest option"],
      Croma:    ["In-store setup help","Long return window","Genuine product"],
      Snapdeal: ["Decent price"]
    },
    cons: {
      Amazon:   ["No significant drawbacks"],
      Flipkart: ["Slightly more expensive than Amazon"],
      Meesho:   ["Counterfeit risk","No real warranty","Quality uncertain"],
      Croma:    ["Most expensive","Paid delivery"],
      Snapdeal: ["Slow delivery","Paid delivery","Risky third-party seller"]
    }
  }
};


// ─── Helper: fuzzy match product key ─────────────────────────

function findProduct(query) {
  const q = query.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
  for (const key of Object.keys(PRODUCT_DB)) {
    if (q.includes(key) || key.includes(q) || similarity(q, key) > 0.6) {
      return PRODUCT_DB[key];
    }
  }
  return null;
}

function similarity(a, b) {
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;
  if (longer.length === 0) return 1.0;
  const editDist = levenshtein(longer, shorter);
  return (longer.length - editDist) / longer.length;
}

function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0)
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
    }
  }
  return dp[a.length][b.length];
}


// ─── AI Generation via Anthropic API ─────────────────────────

async function generateWithAI(query) {
  if (!process.env.ANTHROPIC_API_KEY) return null;

  const prompt = `You are an ecommerce price comparison expert for India. A user wants to compare prices for: "${query}"

Return ONLY a valid JSON object. No markdown, no explanation, no backticks. Just pure JSON.

Use this exact structure:
{
  "product": "Full exact product name",
  "category": "Product category",
  "verdict": "A 3-4 sentence recommendation on where to buy, mentioning best platform for budget buyers vs quality-conscious buyers.",
  "platforms": [
    {
      "name": "Amazon",
      "icon": "A",
      "color": "#FF9900",
      "price": 2499,
      "originalPrice": 3499,
      "discount": "29% off",
      "rating": 4.3,
      "reviews": "12,847",
      "deliveryDays": "2 days",
      "deliveryType": "free",
      "fast": true,
      "returnPolicy": "10-day returns",
      "warranty": "1 year brand warranty",
      "seller": "Cloudtail India",
      "score": 88
    },
    { "name": "Flipkart", "icon": "F", "color": "#2874F0", ... },
    { "name": "Meesho",   "icon": "M", "color": "#F43397", ... },
    { "name": "Croma",    "icon": "C", "color": "#47A527", ... },
    { "name": "Snapdeal", "icon": "S", "color": "#E40046", ... }
  ],
  "pros": {
    "Amazon":   ["pro1", "pro2"],
    "Flipkart": ["pro1", "pro2"],
    "Meesho":   ["pro1"],
    "Croma":    ["pro1", "pro2", "pro3"],
    "Snapdeal": ["pro1"]
  },
  "cons": {
    "Amazon":   ["con1"],
    "Flipkart": ["con1"],
    "Meesho":   ["con1", "con2", "con3"],
    "Croma":    ["con1", "con2"],
    "Snapdeal": ["con1", "con2"]
  }
}

Rules:
- Prices must be realistic for this product in India (2024-2025)
- Meesho should be cheapest but have worst trust/warranty
- Croma should be most expensive but best in-store support
- score is 0-100 overall value (price + trust + delivery + warranty)
- deliveryType is "free" or "paid"
- fast is true if delivery is 1-2 days`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type':         'application/json',
      'x-api-key':            process.env.ANTHROPIC_API_KEY,
      'anthropic-version':    '2023-06-01',
    },
    body: JSON.stringify({
      model:      'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages:   [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) return null;

  const data = await res.json();
  const text = data.content.map(b => b.text || '').join('').trim();
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}


// ─── Routes ──────────────────────────────────────────────────

// GET /api/compare?q=boAt+Airdopes+141
app.get('/api/compare', async (req, res) => {
  const query = (req.query.q || '').trim();

  if (!query) {
    return res.status(400).json({ error: 'Query parameter `q` is required.' });
  }

  console.log(`[${new Date().toISOString()}] Comparing: "${query}"`);

  // 1. Try DB first (instant)
  const fromDB = findProduct(query);
  if (fromDB) {
    console.log(`  → Served from database`);
    return res.json(fromDB);
  }

  // 2. Try AI generation
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      console.log(`  → Generating with Claude AI...`);
      const aiResult = await generateWithAI(query);
      if (aiResult) {
        console.log(`  → AI generation successful`);
        return res.json(aiResult);
      }
    } catch (err) {
      console.error('  → AI generation failed:', err.message);
    }
  }

  // 3. Fallback: return a generic template with the query as product name
  console.log(`  → Using fallback template`);
  const fallback = JSON.parse(JSON.stringify(PRODUCT_DB['boat airdopes 141']));
  fallback.product  = query.replace(/\b\w/g, c => c.toUpperCase()) + ' (Estimated Data)';
  fallback.category = 'Product';
  fallback.verdict  = `Based on general ecommerce patterns in India, Amazon and Flipkart are your safest bets for "${query}". They offer trusted sellers, genuine warranties, and reliable return policies. Avoid purchasing from Meesho for electronics or high-value items due to warranty and authenticity concerns.`;
  return res.json(fallback);
});


// GET /api/products  (list all DB products)
app.get('/api/products', (req, res) => {
  const list = Object.entries(PRODUCT_DB).map(([key, val]) => ({
    key,
    product:  val.product,
    category: val.category,
  }));
  res.json(list);
});


// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    ai: !!process.env.ANTHROPIC_API_KEY,
    products: Object.keys(PRODUCT_DB).length,
  });
});


// ─── Start ────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n✅  PriceRadar backend running at http://localhost:${PORT}`);
  console.log(`📦  Products in DB: ${Object.keys(PRODUCT_DB).length}`);
  console.log(`🤖  AI (Anthropic): ${process.env.ANTHROPIC_API_KEY ? 'ENABLED' : 'DISABLED (set ANTHROPIC_API_KEY in .env to enable)'}`);
  console.log(`\n   API endpoints:`);
  console.log(`   GET /api/compare?q=<product name>`);
  console.log(`   GET /api/products`);
  console.log(`   GET /health\n`);
});
