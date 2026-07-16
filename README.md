# wf-marketing

Public marketing site for What's Fresh V2. Landing page, pricing, and marketing content.

## Structure

```
wf-marketing/
├── pages/
│   ├── index.html              # Landing page (feature cards)
│   └── features/               # Feature detail pages (self-contained)
│       ├── intuitive-interface/
│       │   ├── index.html      # Feature page
│       │   ├── content.json    # Feature metadata & content
│       │   ├── images/
│       │   │   └── screenshot.png
│       │   └── videos/         # (for future video content)
│       ├── batch-mapping/
│       ├── production-worksheets/
│       └── ingredient-traceability/
└── public/                      # Static assets & JS
    ├── css/style.css
    ├── js/features.js          # Feature loader
    └── images/                 # Global images (logos, icons)
```

## Content Management

**Single source of truth:** `/pages/features.json`

All feature content (title, description, details, icon) is centralized in one JSON file. Feature folders only contain images and videos.

**Feature structure:**
```
/pages/features/my-feature/
├── index.html          (feature detail page template)
├── images/
│   └── screenshot.png
└── videos/             (add videos here when available)
```

**To manage features:**
- **Edit** `/pages/features.json` to change content, reorder, or toggle `featured: true/false`
- **Add a feature:** Create the folder, add `index.html`, images, then add entry to features.json
- **Remove feature:** Set `featured: false` or delete from JSON (folder stays as archive)
- **Reorder:** Change `order` values in features.json
- Landing page auto-loads featured items in order

**Features JSON structure:**
```json
{
  "features": [
    {
      "id": "feature-name",
      "featured": true,
      "order": 1,
      "title": "Feature Title",
      "icon": "🎯",
      "description": "Short teaser for card",
      "details": ["Paragraph 1", "Paragraph 2"]
    }
  ]
}
```

## Running Locally

```bash
# Start a simple HTTP server
npx http-server pages -p 8000

# Or with Node/Express
node app.js
```

Visit `http://localhost:8000/` to preview.

## Notes

- No database required—all content is file-based and versioned with code
- Features are loaded dynamically via JSON
- CSS follows theme variable pattern for dark mode support
