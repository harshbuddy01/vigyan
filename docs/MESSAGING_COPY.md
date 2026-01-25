# Vigyan Test Series - Messaging Copy

## Complete Copy for Each Series

### 🟢 IAT SERIES (IISER Aptitude Test)

**Badge**: `IAT • IISER APTITUDE`

**Icon**: `⚡`

**Headline**: `⚡ IAT Speed Mastery`

**Subheadline**: `Master the 120-minute sprint that separates top 1% from rest`

**Description/Position**: For students anxious about time management and want to improve their speed without compromising accuracy.

**Features** (Each with ✓):
1. Pattern-based logic decoded (real exam patterns)
2. Speed benchmarking vs 99th percentile students
3. Daily 10-question speed trials (5 mins each)
4. Accuracy + Time analytics dashboard

**CTA Button**: `→ START SPEED TRIALS NOW`

**Trust Badge**: `✓ 5,000+ IISER toppers | Avg improvement: +15%`

**Color Code**: `#10b981` (Green)

---

### 🔵 NEST SERIES (National Entrance Screening Test)

**Badge**: `NEST • SCIENCE DEEP-DIVE`

**Icon**: `🔬`

**Headline**: `🔬 NEST Deep Dive`

**Subheadline**: `The toughest entrance exam demands deeper thinking—we’ll get you there`

**Description/Position**: For students with concept gaps who need deeper understanding of physics and chemistry with detailed explanations.

**Features** (Each with ✓):
1. Conceptual deep-dives (integrated physics + chemistry)
2. "Why this answer" explanations (not just solutions)
3. 1,000+ tricky numerical problem vault
4. Concept-strength analysis (identifies your weak zones)

**CTA Button**: `→ UNLOCK CONCEPT MASTERY`

**Trust Badge**: `✓ Recommended by NEST mentors | 3x more explanation depth`

**Color Code**: `#3b82f6` (Blue)

---

### 🟣 ISI SERIES (Indian Statistical Institute)

**Badge**: `ISI • PROOF ACADEMY`

**Icon**: `🏆`

**Headline**: `🏆 ISI Proof Academy`

**Subheadline**: `From solving equations to writing proofs—the leap that matters`

**Description/Position**: For achievement-driven students needing analytical rigor and proof-based mathematical thinking.

**Features** (Each with ✓):
1. Proof-writing masterclass (step-by-step methodology)
2. Logic breakdowns for every solution (see the thinking)
3. Percentile-wise question stratification (know your level)
4. Mock exams with detailed score breakdowns

**CTA Button**: `→ START PROOF PRACTICE`

**Trust Badge**: `✓ Designed with ISI alumni | 98% of users see improvement in 4 weeks`

**Color Code**: `#a855f7` (Purple)

---

## Usage Instructions

### For HTML Implementation:
```html
<div class="series-card iat">
  <span class="series-badge">IAT • IISER APTITUDE</span>
  <div class="series-icon">⚡</div>
  <h3>⚡ IAT Speed Mastery</h3>
  <p class="subtitle">Master the 120-minute sprint that separates top 1% from rest</p>
  <ul class="series-features">
    <li>✓ Pattern-based logic decoded (real exam patterns)</li>
    <li>✓ Speed benchmarking vs 99th percentile students</li>
    <li>✓ Daily 10-question speed trials (5 mins each)</li>
    <li>✓ Accuracy + Time analytics dashboard</li>
  </ul>
  <button class="series-cta">→ START SPEED TRIALS NOW</button>
  <div class="trust-badge">✓ 5,000+ IISER toppers | Avg improvement: +15%</div>
</div>
```

### For CSS:
```css
.series-card.iat {
  --card-color: #10b981;
}

.series-card.nest {
  --card-color: #3b82f6;
}

.series-card.isi {
  --card-color: #a855f7;
}
```

### For Backend (JavaScript/JSON):
```javascript
const seriesData = [
  {
    id: 'iat',
    badge: 'IAT • IISER APTITUDE',
    icon: '⚡',
    headline: '⚡ IAT Speed Mastery',
    subheadline: 'Master the 120-minute sprint that separates top 1% from rest',
    features: [
      'Pattern-based logic decoded (real exam patterns)',
      'Speed benchmarking vs 99th percentile students',
      'Daily 10-question speed trials (5 mins each)',
      'Accuracy + Time analytics dashboard'
    ],
    cta: '→ START SPEED TRIALS NOW',
    trust: '✓ 5,000+ IISER toppers | Avg improvement: +15%',
    color: '#10b981'
  },
  {
    id: 'nest',
    badge: 'NEST • SCIENCE DEEP-DIVE',
    icon: '🔬',
    headline: '🔬 NEST Deep Dive',
    subheadline: 'The toughest entrance exam demands deeper thinking—we’ll get you there',
    features: [
      'Conceptual deep-dives (integrated physics + chemistry)',
      '"Why this answer" explanations (not just solutions)',
      '1,000+ tricky numerical problem vault',
      'Concept-strength analysis (identifies your weak zones)'
    ],
    cta: '→ UNLOCK CONCEPT MASTERY',
    trust: '✓ Recommended by NEST mentors | 3x more explanation depth',
    color: '#3b82f6'
  },
  {
    id: 'isi',
    badge: 'ISI • PROOF ACADEMY',
    icon: '🏆',
    headline: '🏆 ISI Proof Academy',
    subheadline: 'From solving equations to writing proofs—the leap that matters',
    features: [
      'Proof-writing masterclass (step-by-step methodology)',
      'Logic breakdowns for every solution (see the thinking)',
      'Percentile-wise question stratification (know your level)',
      'Mock exams with detailed score breakdowns'
    ],
    cta: '→ START PROOF PRACTICE',
    trust: '✓ Designed with ISI alumni | 98% of users see improvement in 4 weeks',
    color: '#a855f7'
  }
];
```

---

## Customization

### Update with Your Actual Numbers:
- `5,000+ IISER toppers` → Your actual user count
- `+15% avg improvement` → Your actual average improvement
- `1,000+ questions` → Your actual question bank size
- `98% improve in 4 weeks` → Your actual success rate

### Update Brand Colors:
- Replace hex codes with your brand colors
- Ensure sufficient contrast for readability
- Test on both light and dark backgrounds

---

## A/B Testing Variations

### Version 2 - Problem-Solving Focus:
```
IAT: "Running Out of Time? We Fix Speed Issues in 15 Days"
NEST: "Stuck in Concepts? See the Light Bulb Moment"
ISI: "Can't Write Proofs? Learn the Secret Format"
```

### Version 3 - Social Proof Focus:
```
IAT: "3,000+ Students Already Mastered Speed. Your Turn?"
NEST: "500+ Got IISER Calls Through NEST Prep. You?"
ISI: "Top Performers Use This Academy. You?"
```

---

## Analytics Tracking

```javascript
// Track series clicks
document.querySelectorAll('.series-cta').forEach((btn) => {
  btn.addEventListener('click', () => {
    const series = btn.closest('.series-card').dataset.series;
    analytics.track('series_selected', {
      'series_name': series,
      'timestamp': new Date()
    });
  });
});
```

---

For implementation instructions, see `IMPLEMENTATION_GUIDE.md`
