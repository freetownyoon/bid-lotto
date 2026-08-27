import axios from 'axios';
import fs from 'fs';

async function testHtml() {
  const url = `https://www.dhlottery.co.kr/gameResult.do?method=byWin&drwNo=1150`;
  const res = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });
  fs.writeFileSync('server/sample.html', res.data, 'utf-8');
  console.log('HTML saved, length:', res.data.length);
}

testHtml();
