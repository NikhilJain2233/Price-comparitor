/* ===========================
   app.js — PriceRadar Frontend
   Talks to Node.js backend at /api/compare
=========================== */

const API_BASE = ''; // Change this to your deployed backend URL

let currentData = null; // Store last fetched result for re-sorting

// ─── Entry Points ───────────────────────────────────────────

function quickSearch(query) {
  document.getElementById('productInput').value = query;
  handleSearch();
}

async function handleSearch() {
  const query = document.getElementById('productInput').value.trim();
  if (!query) {
    document.getElementById('productInput').focus();
    return;
  }
  await fetchComparison(query);
}

// ─── API Call ────────────────────────────────────────────────

async function fetchComparison(query) {
  showLoading();

  const messages = [
    'Scanning Amazon...',
    'Checking Flipkart prices...',
    'Looking up Meesho...',
    'Fetching Croma & Snapdeal...',
    'Calculating best deal...',
  ];
  let msgIdx = 0;
  const msgEl = document.getElementById('loadingMsg');
  msgEl.textContent = messages[0];
  const timer = setInterval(() => {
    msgIdx = (msgIdx + 1) % messages.length;
    msgEl.textContent = messages[msgIdx];
  }, 900);

  try {
    const res = await fetch(`${API_BASE}/api/compare?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    const data = await res.json();
    clearInterval(timer);
    currentData = data;
    renderResults(data);
  } catch (err) {
    clearInterval(timer);
    showError(err.message || 'Could not reach the server. Make sure the backend is running.');
  }
}

// ─── Render ──────────────────────────────────────────────────

function renderResults(data) {
  // Product header
  document.getElementById('productTitle').textContent = data.product;
  document.getElementById('productCategory').textContent = data.category || 'Product';

  const platforms = [...data.platforms].sort((a, b) => a.price - b.price);
  const lowestPrice = platforms[0].price;
  const highestPrice = platforms[platforms.length - 1].price;

  // Stats
  document.getElementById('statLow').textContent      = `${fmt(lowestPrice)} (${platforms[0].name})`;
  document.getElementById('statHigh').textContent     = fmt(highestPrice);
  document.getElementById('statSave').textContent     = fmt(highestPrice - lowestPrice);
  document.getElementById('statPlatforms').textContent = `${platforms.length} platforms`;

  // Platform cards
  renderPlatformCards(platforms, lowestPrice);

  // Verdict
  document.getElementById('verdictText').textContent = data.verdict;

  // Pros & cons
  renderProsConsGrid(platforms, data.pros, data.cons);

  // Table
  renderTable(platforms, lowestPrice);

  showResults();
}

function renderPlatformCards(platforms, lowestPrice) {
  const grid = document.getElementById('platformGrid');
  grid.innerHTML = '';

  platforms.forEach(p => {
    const isBest = p.price === lowestPrice;
    const card = document.createElement('div');
    card.className = 'platform-card' + (isBest ? ' best-deal' : '');

    const scoreClass = scoreColor(p.score);
    const deliveryTag = p.deliveryType === 'free'
      ? `<span class="tag tag-free">Free delivery</span>`
      : `<span class="tag tag-paid">Paid delivery</span>`;
    const fastTag = p.fast ? `<span class="tag tag-fast">Fast</span>` : '';
    const riskTag = p.score < 40 ? `<span class="tag tag-danger">High risk</span>` : '';

    card.innerHTML = `
      ${isBest ? '<span class="best-badge">Best deal</span>' : ''}
      <div class="platform-name">
        <span class="platform-icon" style="background:${p.color}20;color:${p.color}">${p.icon}</span>
        ${p.name}
      </div>
      <div class="price-display">${fmt(p.price)}</div>
      <div class="meta-row">
        <span>Original</span>
        <span class="strikethrough">${fmt(p.originalPrice)}</span>
      </div>
      <div class="meta-row">
        <span>Discount</span>
        <span class="discount-pct">${p.discount}</span>
      </div>
      <div class="meta-row">
        <span>Rating</span>
        <span>${p.rating} ⭐ (${p.reviews})</span>
      </div>
      <div class="meta-row">
        <span>Delivery</span>
        <span>${p.deliveryDays}</span>
      </div>
      <div class="meta-row">
        <span>Returns</span>
        <span>${p.returnPolicy}</span>
      </div>
      <div class="meta-row">
        <span>Warranty</span>
        <span>${p.warranty}</span>
      </div>
      <div class="tags">${deliveryTag}${fastTag}${riskTag}</div>
      <div class="score-section">
        <div class="score-label-row">
          <span>Value score</span>
          <span>${p.score}/100</span>
        </div>
        <div class="score-bar-bg">
          <div class="score-bar-fill ${scoreClass}" data-width="${p.score}%"></div>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  // Animate bars after paint
  setTimeout(() => {
    document.querySelectorAll('.score-bar-fill').forEach(el => {
      el.style.width = el.dataset.width;
    });
  }, 80);
}

function renderProsConsGrid(platforms, pros, cons) {
  const grid = document.getElementById('prosConsGrid');
  grid.innerHTML = '';

  platforms.forEach(p => {
    const prosArr = pros[p.name] || [];
    const consArr = cons[p.name] || [];

    const card = document.createElement('div');
    card.className = 'pros-cons-card';

    const prosHTML = prosArr.map(t =>
      `<div class="pc-item"><div class="bullet bullet-green"></div><span>${t}</span></div>`
    ).join('');
    const consHTML = consArr.map(t =>
      `<div class="pc-item"><div class="bullet bullet-red"></div><span>${t}</span></div>`
    ).join('');

    card.innerHTML = `
      <h4>
        <span class="platform-icon" style="background:${p.color}20;color:${p.color};width:20px;height:20px;font-size:9px;border-radius:4px;">${p.icon}</span>
        ${p.name} &mdash; ${fmt(p.price)}
      </h4>
      ${prosArr.length ? `<p class="pc-group-label pros-lbl">Pros</p>${prosHTML}` : ''}
      ${consArr.length ? `<p class="pc-group-label cons-lbl">Cons</p>${consHTML}` : ''}
    `;
    grid.appendChild(card);
  });
}

function renderTable(platforms, lowestPrice) {
  const tbody = document.getElementById('compareTableBody');
  tbody.innerHTML = '';

  platforms.forEach(p => {
    const isBest = p.price === lowestPrice;
    const tr = document.createElement('tr');
    if (isBest) tr.className = 'best-row';

    const sc = scoreColor(p.score);
    tr.innerHTML = `
      <td>
        <div class="table-platform">
          <span class="platform-icon" style="background:${p.color}20;color:${p.color};width:22px;height:22px;font-size:10px;">${p.icon}</span>
          ${p.name}
        </div>
      </td>
      <td><span class="table-price ${isBest ? 'best-price' : ''}">${fmt(p.price)}</span></td>
      <td style="color:#3B6D11;font-weight:600">${p.discount}</td>
      <td>${p.rating} ⭐ <span style="color:#98A2B3;font-size:12px">(${p.reviews})</span></td>
      <td>${p.deliveryDays} ${p.deliveryType === 'free' ? '<span style="color:#3B6D11;font-size:11px">• Free</span>' : '<span style="color:#854F0B;font-size:11px">• Paid</span>'}</td>
      <td>${p.returnPolicy}</td>
      <td>${p.warranty}</td>
      <td><span class="score-pill ${sc}">${p.score}/100</span></td>
    `;
    tbody.appendChild(tr);
  });
}

// ─── Sort ────────────────────────────────────────────────────

function sortPlatforms() {
  if (!currentData) return;
  const key = document.getElementById('sortSelect').value;
  const sorted = [...currentData.platforms].sort((a, b) => {
    if (key === 'price')  return a.price - b.price;
    if (key === 'score')  return b.score - a.score;
    if (key === 'rating') return b.rating - a.rating;
    return 0;
  });
  const lowestPrice = [...currentData.platforms].sort((a,b)=>a.price-b.price)[0].price;
  renderPlatformCards(sorted, lowestPrice);
  renderTable(sorted, lowestPrice);
}

// ─── UI State ─────────────────────────────────────────────────

function showLoading() {
  document.getElementById('loadingState').classList.remove('hidden');
  document.getElementById('resultsSection').classList.add('hidden');
  document.getElementById('errorState').classList.add('hidden');
  document.getElementById('searchBtn').disabled = true;
}

function showResults() {
  document.getElementById('loadingState').classList.add('hidden');
  document.getElementById('resultsSection').classList.remove('hidden');
  document.getElementById('errorState').classList.add('hidden');
  document.getElementById('searchBtn').disabled = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showError(msg) {
  document.getElementById('loadingState').classList.add('hidden');
  document.getElementById('resultsSection').classList.add('hidden');
  document.getElementById('errorState').classList.remove('hidden');
  document.getElementById('errorMsg').textContent = msg;
  document.getElementById('searchBtn').disabled = false;
}

function resetSearch() {
  document.getElementById('resultsSection').classList.add('hidden');
  document.getElementById('errorState').classList.add('hidden');
  document.getElementById('productInput').value = '';
  document.getElementById('productInput').focus();
  currentData = null;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─── Helpers ─────────────────────────────────────────────────

function fmt(n) {
  return '₹' + Number(n).toLocaleString('en-IN');
}

function scoreColor(score) {
  if (score >= 85) return 'top';
  if (score >= 65) return 'high';
  if (score >= 45) return 'mid';
  return 'low';
}

// ─── Keyboard ────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('productInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleSearch();
  });
});
