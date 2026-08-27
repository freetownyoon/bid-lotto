import axios from 'axios';

async function scrapeRound(drwNo) {
  try {
    const url = `https://www.dhlottery.co.kr/gameResult.do?method=byWin&drwNo=${drwNo}`;
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    const html = res.data;
    // Extract date
    const dateMatch = html.match(/\((\d{4}년 \d{1,2}월 \d{1,2}일) 추첨\)/);
    const dateStr = dateMatch ? dateMatch[1] : '';

    // Extract balls: <span class="ball_645 lball_55">7</span>
    const ballMatches = [...html.matchAll(/<span class="ball_645 [^"]+">(\d+)<\/span>/g)];
    const balls = ballMatches.map((m) => parseInt(m[1], 10));

    // Extract prize & winners
    // 1등 당첨금액
    const prizeMatch = html.match(/1등[\s\S]*?<strong>([\d,]+)원<\/strong>/);
    const prize = prizeMatch ? parseInt(prizeMatch[1].replace(/,/g, ''), 10) : 0;

    // 1등 당첨자수
    const winnersMatch = html.match(/1등[\s\S]*?<td>([\d,]+)<\/td>/);
    const winners = winnersMatch ? parseInt(winnersMatch[1].replace(/,/g, ''), 10) : 0;

    if (balls.length >= 7) {
      return {
        drwNo,
        drwNoDate: dateStr,
        drwtNo1: balls[0],
        drwtNo2: balls[1],
        drwtNo3: balls[2],
        drwtNo4: balls[3],
        drwtNo5: balls[4],
        drwtNo6: balls[5],
        bnusNo: balls[6],
        firstWinamnt: prize,
        firstPrzwnerCo: winners,
      };
    }
    return null;
  } catch (err) {
    console.error(`Error scraping ${drwNo}:`, err.message);
    return null;
  }
}

async function run() {
  console.log('Testing round 1150...');
  const res = await scrapeRound(1150);
  console.log('Result 1150:', res);

  console.log('Testing round 1100...');
  const res2 = await scrapeRound(1100);
  console.log('Result 1100:', res2);
}

run();
