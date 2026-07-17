let allFeatures = [];

async function loadAllFeatures() {
  try {
    const response = await fetch('/features.json');
    const data = await response.json();
    allFeatures = data.features;
  } catch (error) {
    console.error('Failed to load features.json:', error);
  }
}

async function loadFeatureCards() {
  await loadAllFeatures();

  const gridContainer = document.getElementById('features-grid');
  if (!gridContainer) return;

  // Filter featured features and sort by order
  const featuredFeatures = allFeatures
    .filter(f => f.featured)
    .sort((a, b) => a.order - b.order);

  // Render feature cards with links to detail pages
  gridContainer.innerHTML = featuredFeatures.map(feature => `
    <a href="${feature.path}" class="feature-card" style="text-decoration: none; color: inherit;">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
        <div class="feature-icon">${feature.icon}</div>
        <h3 style="margin: 0;">${feature.title}</h3>
      </div>
      <p>${feature.description}</p>
    </a>
  `).join('');
}

async function loadFeatureDetail(featureName) {
  await loadAllFeatures();

  const feature = allFeatures.find(f => f.id === featureName);
  if (!feature) {
    console.error(`Feature ${featureName} not found`);
    return;
  }

  const detailContainer = document.getElementById('feature-detail');
  if (!detailContainer) return;

  const isTraceability = featureName === 'ingredient-traceability';

  // Render details array as paragraphs
  const detailsHTML = Array.isArray(feature.details)
    ? feature.details.map(detail => `<p>${detail}</p>`).join('')
    : `<p>${feature.details}</p>`;

  const accordionHTML = isTraceability ? `
    <div class="accordion-container">
      <div class="accordion-item">
        <button class="accordion-header" onclick="toggleAccordion(this)">
          <span class="accordion-toggle">▶</span>
          How ingredient tracing works
        </button>
        <div class="accordion-content">
          <p>Pick any ingredient batch and see its complete journey:</p>
          <div class="flow-diagram">
            <div class="flow-step">Vendor & Date</div>
            <div class="flow-arrow">→</div>
            <div class="flow-step">Ingredient Batch</div>
            <div class="flow-arrow">→</div>
            <div class="flow-step">Product Batch</div>
            <div class="flow-arrow">→</div>
            <div class="flow-step">Query Results</div>
          </div>
          <p style="margin-top: 1rem; color: #666;">Forward tracing shows you every product that ingredient touched. Critical for understanding your production dependencies.</p>
        </div>
      </div>

      <div class="accordion-item">
        <button class="accordion-header" onclick="toggleAccordion(this)">
          <span class="accordion-toggle">▶</span>
          In case of ingredient recall
        </button>
        <div class="accordion-content">
          <p>When a supplier issue arises, you have seconds to respond:</p>
          <div class="flow-diagram">
            <div class="flow-step" style="background: #fee;">⚠️ Alert</div>
            <div class="flow-arrow">→</div>
            <div class="flow-step">Query system</div>
            <div class="flow-arrow">→</div>
            <div class="flow-step" style="background: #fdd;">Affected Batches</div>
            <div class="flow-arrow">→</div>
            <div class="flow-step" style="background: #fcc;">Issue Recall</div>
          </div>
          <p style="margin-top: 1rem; color: #666;">Instead of manually checking notebooks and spreadsheets, What's Fresh instantly identifies every batch and product affected. For FDA compliance and recalls, this isn't just helpful—it's essential.</p>
        </div>
      </div>

      <div class="accordion-item">
        <button class="accordion-header" onclick="toggleAccordion(this)">
          <span class="accordion-toggle">▶</span>
          Complete audit trail
        </button>
        <div class="accordion-content">
          <p>Every trace includes:</p>
          <ul style="margin-left: 1.5rem; margin-bottom: 1rem; color: #666;">
            <li><strong>FSMA lot codes</strong> — Full regulatory documentation</li>
            <li><strong>Dates & locations</strong> — Exact production timeline</li>
            <li><strong>Supplier information</strong> — Complete source chain</li>
            <li><strong>Batch history</strong> — Every touch point</li>
          </ul>
          <p>Nothing is lost or scattered. Everything your auditors need is linked and ready.</p>
        </div>
      </div>
    </div>
  ` : '';

  detailContainer.innerHTML = `
    <div class="feature-detail">
      <h3>${feature.title}</h3>
      ${detailsHTML}
      ${accordionHTML}
      <img src="${feature.image}" alt="${feature.title}" style="max-width: 100%; border-radius: 8px; border: 1px solid #e5e7eb; margin: 2rem 0; box-shadow: 0 4px 6px rgba(0,0,0,0.07);" />
    </div>
  `;
}

function toggleAccordion(element) {
  const item = element.closest('.accordion-item');
  const container = item.closest('.accordion-container');

  container.querySelectorAll('.accordion-item.active').forEach(activeItem => {
    if (activeItem !== item) {
      activeItem.classList.remove('active');
    }
  });

  item.classList.toggle('active');
}

// Auto-load based on page type
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('features-grid')) {
      loadFeatureCards();
    }
    const featureName = document.body.getAttribute('data-feature');
    if (featureName) {
      loadFeatureDetail(featureName);
    }
  });
} else {
  if (document.getElementById('features-grid')) {
    loadFeatureCards();
  }
  const featureName = document.body.getAttribute('data-feature');
  if (featureName) {
    loadFeatureDetail(featureName);
  }
}
