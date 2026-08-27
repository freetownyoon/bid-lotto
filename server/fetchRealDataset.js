import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'data', 'lotto_history.json');

function formatDateStr(rawStr) {
  if (!rawStr || rawStr.length !== 8) return rawStr;
  const y = rawStr.substring(0, 4);
  const m = rawStr.substring(4, 6);
  const d = rawStr.substring(6, 8);
  return `${y}-${m}-${d}`;
}

async function fetchRealHistory() {
  console.log('🚀 동행복권 공식 API로부터 최근 100회차 실제 당첨 번호 수집 시작...');

  const latestRound = 1237; // Current latest round
  const startRound = 1138;  // Last 100 rounds: 1138 ~ 1237
  const history = [];

  for (let drwNo = latestRound; drwNo >= startRound; drwNo--) {
    try {
      const url = `https://www.dhlottery.co.kr/lt645/selectPstLt645Info.do?srchLtEpsd=${drwNo}`;
      const res = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        timeout: 4000
      });

      if (res.data && res.data.data && res.data.data.list && res.data.data.list.length > 0) {
        const item = res.data.data.list[0];
        
        // Sort main numbers ascending
        const mainNums = [
          item.tm1WnNo,
          item.tm2WnNo,
          item.tm3WnNo,
          item.tm4WnNo,
          item.tm5WnNo,
          item.tm6WnNo
        ].sort((a, b) => a - b);

        const record = {
          drwNo: item.ltEpsd,
          drwNoDate: formatDateStr(item.ltRflYmd),
          drwtNo1: mainNums[0],
          drwtNo2: mainNums[1],
          drwtNo3: mainNums[2],
          drwtNo4: mainNums[3],
          drwtNo5: mainNums[4],
          drwtNo6: mainNums[5],
          bnusNo: item.bnsWnNo,
          firstWinamnt: item.rnk1WnAmt || 0,
          firstPrzwnerCo: item.rnk1WnNope || 0,
          totSellamnt: item.wholEpsdSumNtslAmt || 0
        };

        history.push(record);
        console.log(`✅ [${drwNo}회] ${record.drwNoDate} 당첨번호: ${mainNums.join(', ')} + 보너스 ${item.bnsWnNo}`);
      } else {
        console.warn(`⚠️ [${drwNo}회] 데이터 응답 없음`);
      }
    } catch (err) {
      console.error(`❌ [${drwNo}회] 요청 실패:`, err.message);
    }

    // Small delay to prevent rate limit
    await new Promise((r) => setTimeout(r, 100));
  }

  if (history.length > 0) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(history, null, 2), 'utf-8');
    console.log(`🎉 성공적으로 ${history.length}개의 실제 당첨 기록을 ${DATA_FILE}에 저장했습니다!`);
  }
}

fetchRealHistory();
