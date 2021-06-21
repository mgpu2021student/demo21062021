import { Server } from 'http';
import x from 'express';
import puppeteer from 'puppeteer';

const Router = x.Router();
const PORT = 80;
const { log } = console;
const hu = { 'Content-Type': 'text/html; charset=utf-8' };
const app = x();

const URL = 'https://yandex.ru/';


let response;
 
const waitForLoad = (page, time) => new Promise((resolve) => {
    page.on('rquest', (req) => {
      waitForLoad(page, time)
    })
    page.on('requestfinished', (req) => {
      setTimeout(() => resolve("timeOut"), time)
    })
  });
  
  
Router
  .route('/usd')
  .get(async r => {

      const browser = await puppeteer.launch({executablePath: '/usr/bin/chromium-browser', headless: true, args:['--no-sandbox']});
      const page = await browser.newPage();
      await page.goto(URL);
      await waitForLoad(page, 500);
      const selector = '#wd-_topnews-1 > div > div.news__inline-stocks.news__inline-stocks_hidden_no > div > div > div.b-inline.inline-stocks__item.inline-stocks__item_id_2002.hint__item.inline-stocks__part > span.inline-stocks__value > span.inline-stocks__value_inner'; 
      await page.waitForSelector(selector);
   
      response = await page.$eval(selector, el => el.textContent);
      browser.close(); 
      r.res.send(response);
  	
  });
app
  .use((r, rs, n) => rs.status(200).set(hu) && n())
  .use(x.static('.'))
  .use('/', Router)
  .use(({ res: r }) => r.status(404).set(hu).send('Пока нет!'))
  .use((e, r, rs, n) => rs.status(500).set(hu).send(`Ошибка: ${e}`))
  /* .set('view engine', 'pug') */
  .set('x-powered-by', false);
export default Server(app)
  .listen(process.env.PORT || PORT, () => log(process.pid));
