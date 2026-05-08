#!/usr/bin/env node
/**
 * Browser-level smoke test for the bio engine.
 * Loads each hub via headless Chromium, captures console errors + page errors,
 * verifies key interactives exist and respond, and saves screenshots.
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:4000';
const SHOTS_DIR = path.join(__dirname, '..', 'test-screenshots');
fs.mkdirSync(SHOTS_DIR, { recursive: true });

const HUBS = [
  { name: 'cell',       path: '/tools/bio/bio-cell.html',
    checks: [
      { sel: '#tonicityBody svg', desc: 'tonicity slider rendered' },
      { sel: '#muscleBody', desc: 'muscle module exists (cell hub does not own this — should be physiology)', expectMissing: true },
      { sel: '#node-cytoskeleton', desc: 'cytoskeleton node present' },
      { sel: '#node-rna-processing', desc: 'rna processing node present' },
    ],
  },
  { name: 'genetics',   path: '/tools/bio/bio-genetics.html',
    checks: [
      { sel: '#node-probability', desc: 'probability rules node present' },
      { sel: '[data-module="dnatec"]', desc: 'DNA Tech module present' },
      { sel: '[data-module="kary"]', desc: 'Karyotype module present' },
    ],
  },
  { name: 'physiology', path: '/tools/bio/bio-physiology.html',
    checks: [
      { sel: '#bodyMapSvg', desc: 'body map SVG rendered' },
      { sel: '#muscleBody svg', desc: 'muscle comparator SVG' },
      { sel: '#gamBody svg', desc: 'gametogenesis SVG' },
      { sel: '#brainExplorerBody svg', desc: 'brain explorer SVG' },
      { sel: '#crossBridgeBody svg', desc: 'cross-bridge cycle SVG' },
      { sel: '#node-reflex-arc', desc: 'reflex arc node present' },
      { sel: '#node-brain-regions', desc: 'brain regions node present' },
      { sel: '#node-special-senses', desc: 'special senses node present' },
    ],
  },
  { name: 'diversity',  path: '/tools/bio/bio-diversity.html',
    checks: [
      { sel: '#node-vertebrates', desc: 'vertebrate classes node present' },
      { sel: '[data-module="biome"]', desc: 'biome module present', expectMissing: true },  // biome is in evolution
    ],
  },
  { name: 'devo',       path: '/tools/bio/bio-devo.html',
    checks: [
      { sel: '#node-stem-cells', desc: 'stem cells node present' },
    ],
  },
  { name: 'evolution',  path: '/tools/bio/bio-evolution.html',
    checks: [
      { sel: '#hwwBody svg', desc: 'HW bubble cloud rendered' },
      { sel: '#hwBubbleSvg circle', desc: 'HW bubble circles rendered' },
      { sel: '#node-community', desc: 'community ecology node present' },
      { sel: '#biomeBody svg', desc: 'biome map rendered' },
    ],
  },
];

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });

  let totalErrors = 0;
  const report = [];

  for (const hub of HUBS) {
    const page = await ctx.newPage();
    const consoleErrors = [];
    const pageErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', err => pageErrors.push(err.message));

    try {
      const resp = await page.goto(BASE + hub.path, { waitUntil: 'networkidle', timeout: 15000 });
      if (!resp.ok()) {
        report.push(`[${hub.name}] HTTP ${resp.status()}`);
        totalErrors++;
        await page.close();
        continue;
      }
    } catch (e) {
      report.push(`[${hub.name}] navigation failed: ${e.message}`);
      totalErrors++;
      await page.close();
      continue;
    }

    // Wait briefly for init() to run
    await page.waitForTimeout(500);

    // Run checks
    const hubReport = [];
    for (const check of hub.checks) {
      const found = await page.locator(check.sel).count() > 0;
      if (check.expectMissing) {
        if (found) hubReport.push(`  UNEXPECTED PRESENT: ${check.desc} (${check.sel})`);
      } else {
        if (!found) {
          hubReport.push(`  MISSING: ${check.desc} (${check.sel})`);
          totalErrors++;
        }
      }
    }

    // Screenshot full page
    const shotPath = path.join(SHOTS_DIR, `${hub.name}.png`);
    try {
      await page.screenshot({ path: shotPath, fullPage: true });
    } catch (e) {
      hubReport.push(`  screenshot failed: ${e.message}`);
    }

    // Console + page errors
    if (consoleErrors.length) {
      hubReport.push(`  CONSOLE ERRORS (${consoleErrors.length}):`);
      consoleErrors.slice(0, 5).forEach(e => hubReport.push(`    - ${e}`));
      totalErrors += consoleErrors.length;
    }
    if (pageErrors.length) {
      hubReport.push(`  PAGE ERRORS (${pageErrors.length}):`);
      pageErrors.slice(0, 5).forEach(e => hubReport.push(`    - ${e}`));
      totalErrors += pageErrors.length;
    }

    if (hubReport.length === 0) {
      report.push(`[${hub.name}] OK (screenshot: test-screenshots/${hub.name}.png)`);
    } else {
      report.push(`[${hub.name}] ISSUES:`);
      report.push(...hubReport);
    }

    await page.close();
  }

  // Interactive smoke: HW slider + tonicity slider + brain region click
  const interactiveTests = [
    {
      name: 'HW slider responds',
      url: BASE + '/tools/bio/bio-evolution.html',
      run: async (page) => {
        // The HW bubble lives inside a hidden flagship tab. Activate it first.
        await page.evaluate(() => {
          const tabBtn = document.querySelector('[data-tab="hwword"]');
          if (tabBtn) tabBtn.click();
        });
        await page.waitForTimeout(200);
        await page.waitForSelector('#hwQ', { state: 'attached', timeout: 5000 });
        const initial = await page.locator('#hwCntaa').textContent();
        await page.evaluate(() => {
          const s = document.getElementById('hwQ');
          s.value = '0.7';
          s.dispatchEvent(new Event('input', { bubbles: true }));
        });
        await page.waitForTimeout(150);
        const after = await page.locator('#hwCntaa').textContent();
        return initial !== after ? null : `HW count did not update (was ${initial}, still ${after})`;
      },
    },
    {
      name: 'Tonicity slider responds',
      url: BASE + '/tools/bio/bio-cell.html',
      run: async (page) => {
        await page.waitForSelector('#tonSolute', { timeout: 5000 });
        const initial = await page.locator('#tonStateName').textContent();
        await page.locator('#tonSolute').fill('90');
        await page.evaluate(() => document.getElementById('tonSolute').dispatchEvent(new Event('input', { bubbles: true })));
        await page.waitForTimeout(150);
        const after = await page.locator('#tonStateName').textContent();
        return initial !== after ? null : `Tonicity state did not update (was ${initial}, still ${after})`;
      },
    },
    {
      name: 'Brain region click responds',
      url: BASE + '/tools/bio/bio-physiology.html',
      run: async (page) => {
        await page.waitForSelector('.brain-region[data-brain-region="hippocampus"]', { timeout: 5000 });
        // Use force click + dispatch to bypass topbar overlay during scroll
        await page.evaluate(() => {
          const el = document.querySelector('.brain-region[data-brain-region="hippocampus"]');
          el.scrollIntoView({ block: 'center' });
          el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });
        await page.waitForTimeout(150);
        const name = await page.locator('#brainName').textContent();
        return name.toLowerCase().includes('hippocampus') ? null : `Brain panel did not update (got "${name}")`;
      },
    },
    {
      name: 'Probability tree responds',
      url: BASE + '/tools/bio/bio-genetics.html',
      run: async (page) => {
        await page.waitForSelector('#ptResultValue', { timeout: 5000 });
        const initial = await page.locator('#ptResultValue').textContent();
        await page.locator('.pt-count[data-n="4"]').click();
        await page.waitForTimeout(150);
        const after = await page.locator('#ptResultValue').textContent();
        return initial !== after ? null : `Probability tree did not update (was "${initial}")`;
      },
    },
    {
      name: 'RNA scrubber responds',
      url: BASE + '/tools/bio/bio-cell.html',
      run: async (page) => {
        await page.waitForSelector('#rnaStage', { timeout: 5000 });
        const initial = await page.locator('#rnaStageName').textContent();
        await page.evaluate(() => {
          const s = document.getElementById('rnaStage');
          s.value = '95';
          s.dispatchEvent(new Event('input', { bubbles: true }));
        });
        await page.waitForTimeout(150);
        const after = await page.locator('#rnaStageName').textContent();
        return initial !== after ? null : `RNA scrubber stage did not update (was "${initial}")`;
      },
    },
    {
      name: 'Z-scheme scrubber responds',
      url: BASE + '/tools/bio/bio-cell.html',
      run: async (page) => {
        await page.waitForSelector('#zsStage', { timeout: 5000 });
        const initial = await page.locator('#zsNADPH').textContent();
        await page.evaluate(() => {
          const s = document.getElementById('zsStage');
          s.value = '95';
          s.dispatchEvent(new Event('input', { bubbles: true }));
        });
        await page.waitForTimeout(150);
        const after = await page.locator('#zsNADPH').textContent();
        return initial !== after ? null : `Z-scheme NADPH did not update`;
      },
    },
    {
      name: 'Krebs scrubber responds',
      url: BASE + '/tools/bio/bio-cell.html',
      run: async (page) => {
        await page.waitForSelector('#krbStage', { timeout: 5000 });
        const initial = await page.locator('#krbATP').textContent();
        await page.evaluate(() => {
          const s = document.getElementById('krbStage');
          s.value = '90';
          s.dispatchEvent(new Event('input', { bubbles: true }));
        });
        await page.waitForTimeout(150);
        const after = await page.locator('#krbATP').textContent();
        return initial !== after ? null : `Krebs ATP did not update (was "${initial}")`;
      },
    },
    {
      name: 'Cardiac HR slider responds',
      url: BASE + '/tools/bio/bio-physiology.html',
      run: async (page) => {
        // Cardiac module lives inside a flagship tab; activate it first
        await page.evaluate(() => {
          const tabBtn = document.querySelector('[data-tab="cardiac"]');
          if (tabBtn) tabBtn.click();
        });
        await page.waitForTimeout(200);
        await page.waitForSelector('#ccHR', { state: 'attached', timeout: 5000 });
        const initial = await page.locator('#ccHRVal').textContent();
        await page.evaluate(() => {
          const s = document.getElementById('ccHR');
          s.value = '120';
          s.dispatchEvent(new Event('input', { bubbles: true }));
        });
        await page.waitForTimeout(150);
        const after = await page.locator('#ccHRVal').textContent();
        return initial !== after && after.includes('120') ? null : `Cardiac HR did not update (was "${initial}", now "${after}")`;
      },
    },
    {
      name: 'Transcription bubble scrubber responds',
      url: BASE + '/tools/bio/bio-cell.html',
      run: async (page) => {
        await page.waitForSelector('#txStage', { timeout: 5000 });
        const initial = await page.locator('#txPlayerName').textContent();
        await page.evaluate(() => {
          const s = document.getElementById('txStage');
          s.value = '95';
          s.dispatchEvent(new Event('input', { bubbles: true }));
        });
        await page.waitForTimeout(150);
        const after = await page.locator('#txPlayerName').textContent();
        return initial !== after && after.toLowerCase().includes('terminator') ? null : `Transcription did not advance to terminator (got "${after}")`;
      },
    },
    {
      name: 'Replication fork scrubber responds',
      url: BASE + '/tools/bio/bio-cell.html',
      run: async (page) => {
        await page.waitForSelector('#repStage', { timeout: 5000 });
        const initial = await page.locator('#repEnzymeName').textContent();
        await page.evaluate(() => {
          const s = document.getElementById('repStage');
          s.value = '95';
          s.dispatchEvent(new Event('input', { bubbles: true }));
        });
        await page.waitForTimeout(150);
        const after = await page.locator('#repEnzymeName').textContent();
        return initial !== after && after.toLowerCase().includes('ligase') ? null : `Replication fork did not advance to ligase (got "${after}")`;
      },
    },
    {
      name: 'Cross-bridge scrubber responds',
      url: BASE + '/tools/bio/bio-physiology.html',
      run: async (page) => {
        await page.waitForSelector('#cbStage', { timeout: 5000 });
        const initial = await page.locator('#cbStageName').textContent();
        await page.locator('#cbStage').fill('70');
        await page.evaluate(() => document.getElementById('cbStage').dispatchEvent(new Event('input', { bubbles: true })));
        await page.waitForTimeout(150);
        const after = await page.locator('#cbStageName').textContent();
        return initial !== after ? null : `Cross-bridge stage did not update (was "${initial}")`;
      },
    },
  ];

  report.push('');
  report.push('=== Interactive smoke ===');
  for (const t of interactiveTests) {
    const page = await ctx.newPage();
    page.on('pageerror', err => report.push(`  ${t.name}: pageerror — ${err.message}`));
    try {
      await page.goto(t.url, { waitUntil: 'networkidle', timeout: 15000 });
      const err = await t.run(page);
      if (err) {
        report.push(`[FAIL] ${t.name}: ${err}`);
        totalErrors++;
      } else {
        report.push(`[OK]   ${t.name}`);
      }
    } catch (e) {
      report.push(`[FAIL] ${t.name}: ${e.message}`);
      totalErrors++;
    }
    await page.close();
  }

  await browser.close();

  console.log(report.join('\n'));
  console.log(`\nTotal issues: ${totalErrors}`);
  console.log(`Screenshots saved to: ${SHOTS_DIR}`);
  process.exit(totalErrors > 0 ? 1 : 0);
})();
