import axios from 'axios';
import fs from 'fs';

async function testPost() {
  const url = `https://www.dhlottery.co.kr/gameResult.do?method=byWin`;
  const res = await axios.post(url, 'drwNo=1150&hdrwNo=1150', {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  });

  fs.writeFileSync('server/samplePost.html', res.data, 'utf-8');
  console.log('POST HTML saved, length:', res.data.length);

  const html = res.data;
  const ballMatches = [...html.matchAll(/<span class="ball_645[^"]*">(\d+)<\/span>/g)];
  console.log('Ball matches:', ballMatches.map(m => m[1]));

  const dateMatch = html.match(/\((\d{4}년 \d{1,2}월 \d{1,2}일) 추첨\)/);
  console.log('Date match:', dateMatch ? dateMatch[1] : 'null');
}

testPost();
