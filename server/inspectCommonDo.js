import axios from 'axios';

async function inspectCommonDo() {
  const res = await axios.get('https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=1150');
  console.log('=== Length:', res.data.length);
  console.log(res.data);
}

inspectCommonDo();
