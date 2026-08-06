const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  const consoleMessages = [];
  page.on('console', msg => consoleMessages.push({ type: msg.type(), text: msg.text() }));

  // 1) Navigate to http://localhost:8137/index.html
  await page.goto('http://localhost:8137/index.html', { waitUntil: 'networkidle0' });
  const title = await page.title();
  console.log('Page title:', title);

  // Confirm hero headline 'Slow brews for fast minds.'
  const heroText = await page.$eval('h1, .hero-title, h2, div', el => el.innerText).catch(() => 'not found');
  console.log('Hero / Main text:', heroText);

  // Check for 'Reserve a table' button
  const reserveBtn = await page.$eval('button, a', el => {
    const found = Array.from(document.querySelectorAll('button, a')).find(e => e.textContent.includes('Reserve a table'));
    return found ? found.textContent : null;
  }).catch(() => null);
  console.log('Reserve button:', reserveBtn);

  // 2) Scroll through page to menu section and confirm 4 drink rows with prices appear
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise(r => setTimeout(r, 1000));
  
  // Let's inspect the menu items and prices
  const menuInfo = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('.menu-item, [class*="menu"], li, tr, div')).filter(el => {
      return el.textContent.includes('$') && (el.textContent.includes('Brew') || el.textContent.includes('Latte') || el.textContent.includes('Espresso') || el.textContent.includes('Matcha') || el.textContent.includes('Coffee') || el.textContent.includes('Mocha'));
    });
    return items.map(el => el.innerText.trim());
  });
  console.log('Menu items found:', menuInfo);

  // 3) Click FAQ item 'Do you ship beans nationwide?' and verify it expands
  const faqClicked = await page.evaluate(() => {
    const faq = Array.from(document.querySelectorAll('button, summary, h3, h4, div, dt')).find(e => e.textContent.includes('Do you ship beans nationwide?'));
    if (faq) {
      faq.click();
      return true;
    }
    return false;
  });
  console.log('FAQ clicked:', faqClicked);
  await new Promise(r => setTimeout(r, 500));

  const faqExpanded = await page.evaluate(() => {
    const faq = Array.from(document.querySelectorAll('*')).find(e => e.textContent.includes('Do you ship beans nationwide?'));
    if (!faq) return 'not found';
    // check parent or next element for visibility/content
    const parent = faq.closest('details') || faq.parentElement;
    return parent ? parent.innerText : faq.innerText;
  });
  console.log('FAQ expanded text:', faqExpanded);

  // 4) Set viewport to mobile width 390px, click hamburger button, confirm full-screen menu opens, click hamburger again and confirm closes
  await page.setViewport({ width: 390, height: 844 });
  await new Promise(r => setTimeout(r, 500));

  const hamburgerClicked = await page.evaluate(() => {
    const btn = document.querySelector('.hamburger, button[aria-label*="menu" i], .menu-toggle, [class*="hamburger"], [class*="nav-toggle"], header button');
    if (btn) {
      btn.click();
      return true;
    }
    // try finding button by text or svg
    const buttons = Array.from(document.querySelectorAll('button'));
    for (const b of buttons) {
      if (b.querySelector('svg') || b.textContent.trim() === '' || b.className.includes('menu') || b.className.includes('nav')) {
        b.click();
        return 'clicked by heuristic';
      }
    }
    return false;
  });
  console.log('Hamburger clicked:', hamburgerClicked);
  await new Promise(r => setTimeout(r, 500));

  const menuOpenState = await page.evaluate(() => {
    const menu = document.querySelector('.nav-links, .mobile-menu, [class*="nav"], [class*="menu"], nav');
    return {
      display: menu ? window.getComputedStyle(menu).display : null,
      visibility: menu ? window.getComputedStyle(menu).visibility : null,
      classes: menu ? menu.className : null
    };
  });
  console.log('Menu open state:', menuOpenState);

  // Click hamburger again to close
  await page.evaluate(() => {
    const btn = document.querySelector('.hamburger, button[aria-label*="menu" i], .menu-toggle, [class*="hamburger"], [class*="nav-toggle"], header button');
    if (btn) btn.click();
    else {
      const buttons = Array.from(document.querySelectorAll('button'));
      for (const b of buttons) {
        if (b.querySelector('svg') || b.textContent.trim() === '' || b.className.includes('menu') || b.className.includes('nav')) {
          b.click();
          break;
        }
      }
    }
  });
  await new Promise(r => setTimeout(r, 500));

  const menuClosedState = await page.evaluate(() => {
    const menu = document.querySelector('.nav-links, .mobile-menu, [class*="nav"], [class*="menu"], nav');
    return {
      display: menu ? window.getComputedStyle(menu).display : null,
      visibility: menu ? window.getComputedStyle(menu).visibility : null,
      classes: menu ? menu.className : null
    };
  });
  console.log('Menu closed state:', menuClosedState);

  console.log('Console messages:', consoleMessages);

  await browser.close();
})();
