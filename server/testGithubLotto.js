import axios from 'axios';

async function checkGithubLotto() {
  const urls = [
    'https://raw.githubusercontent.com/smok95/lotto/main/lotto.json',
    'https://raw.githubusercontent.com/smok95/lotto/master/lotto.json',
    'https://raw.githubusercontent.com/JeHwanYoo/lotto-crawler/master/lotto.json',
    'https://raw.githubusercontent.com/gureum-dev/lotto-api/main/lotto.json',
    'https://raw.githubusercontent.com/yjs/lotto/master/data/lotto.json',
    'https://raw.githubusercontent.com/Seungkyun-Yu/lotto-recommendation-system/main/lotto_data.json'
  ];

  for (const url of urls) {
    try {
      const res = await axios.get(url, { timeout: 4000 });
      console.log(`SUCCESS: ${url}`);
      console.log('Array size/type:', Array.isArray(res.data) ? res.data.length : typeof res.data);
      if (Array.isArray(res.data) && res.data.length > 0) {
        console.log('First sample:', res.data[0]);
        console.log('Last sample:', res.data[res.data.length - 1]);
      } else if (typeof res.data === 'object') {
        console.log('Object keys:', Object.keys(res.data).slice(0, 5));
      }
    } catch (e) {
      console.log(`FAILED: ${url} (${e.message})`);
    }
  }
}

checkGithubLotto();
