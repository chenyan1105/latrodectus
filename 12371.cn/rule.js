/* eslint-disable no-constant-condition */
const puppeteer = require('puppeteer');

const print = console.log;

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    await page.setRequestInterception(true);
    page.on('request', req => {
      if (
        req.url().endsWith('.png') ||
        req.url().endsWith('.jpg') ||
        req.url().includes('.css')
      ) {
        req.abort();
      } else {
        req.continue();
      }
    });

    const targetClass = '.ELMT1655861767162377';
    await page.goto('https://www.12371.cn/special/dnfg/gz/');
    await page.waitForSelector(targetClass, {
      timeout: 5000,
    });

    await page.exposeFunction('targetClass', () => targetClass);

    const ruleDetail = [];

    while (true) {
      const detail = await page.evaluate(async () => {
        const container = document.querySelector(await targetClass());

        if (container === null) throw new Error(`${targetClass} is not exists`);

        return Array.from(container.querySelectorAll('ul li')).map(el => ({
          titleHref: el.querySelector('.title a').href,
          titleDetail: el.querySelector('.title a').innerHTML.trim(),
          text: Array.from(el.querySelectorAll('.text a')).map(ele => ({
            textHref: ele.href,
            textDetail: ele.innerHTML.trim(),
          })),
        }));
      });

      ruleDetail.push(...detail);

      if (await page.$('.turn_page_box_1015 .tpb_btn_previous:nth-last-child(2)') === null) break;
      await page.click('.turn_page_box_1015 .tpb_btn_previous:nth-last-child(2)');
      await page.waitForSelector('.dyw1015_list', {
        timeout: 5000,
      });
    }

    print(ruleDetail, ruleDetail.length, ruleDetail[2].text);
  } catch (e) {
    print(e.message);
  }

  page.close();
  browser.close();
})();
