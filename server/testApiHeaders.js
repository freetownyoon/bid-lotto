import axios from 'axios';

async function testHeaders() {
  const configs = [
    {
      name: 'Basic Axios',
      headers: { 'User-Agent': 'Mozilla/5.0' }
    },
    {
      name: 'Full Browser Headers',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        'Referer': 'https://www.dhlottery.co.kr/common.do?method=main',
      }
    },
    {
      name: 'API JSON header',
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'X-Requested-With': 'XMLHttpRequest'
      }
    }
  ];

  for (const c of configs) {
    try {
      const res = await axios.get('https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=1150', {
        headers: c.headers,
        timeout: 5000
      });
      console.log(`=== ${c.name} ===`);
      console.log('Type of data:', typeof res.data);
      console.log('Data preview:', JSON.stringify(res.data).substring(0, 150));
    } catch (err) {
      console.error(`=== ${c.name} ERROR ===`, err.message);
    }
  }
}

testHeaders();
