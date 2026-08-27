import axios from 'axios';

async function test() {
  for (let drwNo = 1160; drwNo >= 1140; drwNo--) {
    try {
      const url = `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${drwNo}`;
      const res = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/javascript, */*; q=0.01',
        },
        timeout: 4000
      });
      if (res.data && res.data.returnValue === 'success') {
        console.log(`Success ${drwNo}:`, res.data.drwNoDate, [res.data.drwtNo1, res.data.drwtNo2, res.data.drwtNo3, res.data.drwtNo4, res.data.drwtNo5, res.data.drwtNo6], '+', res.data.bnusNo);
      } else {
        console.log(`Fail ${drwNo}:`, res.data);
      }
    } catch (err) {
      console.error(`Error ${drwNo}:`, err.message);
    }
  }
}

test();
