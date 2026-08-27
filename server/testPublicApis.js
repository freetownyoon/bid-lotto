import axios from 'axios';

async function testPublicApis() {
  const apis = [
    'https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=1150',
    'https://api.b612.me/lotto/1150',
    'https://raw.githubusercontent.com/pypy/lotto-data/main/lotto.json',
  ];

  for (const url of apis) {
    try {
      const res = await axios.get(url, { timeout: 5000 });
      console.log(`URL: ${url}`);
      console.log('Status:', res.status);
      console.log('Type:', typeof res.data);
      if (typeof res.data === 'object') {
        console.log('Sample Data:', JSON.stringify(res.data).substring(0, 200));
      } else {
        console.log('String snippet:', res.data.substring(0, 100));
      }
    } catch (e) {
      console.error(`URL Failed: ${url}`, e.message);
    }
  }
}

testPublicApis();
