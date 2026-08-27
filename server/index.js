import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'data', 'lotto_history.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

function formatDateStr(rawStr) {
  if (!rawStr || rawStr.length !== 8) return rawStr;
  const y = rawStr.substring(0, 4);
  const m = rawStr.substring(4, 6);
  const d = rawStr.substring(6, 8);
  return `${y}-${m}-${d}`;
}

function loadHistory() {
  if (!fs.existsSync(DATA_FILE)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading lotto history file:', err);
    return [];
  }
}

function saveHistory(history) {
  // Sort descending by drwNo
  history.sort((a, b) => b.drwNo - a.drwNo);
  fs.writeFileSync(DATA_FILE, JSON.stringify(history, null, 2), 'utf-8');
}

// Fetch single round from NEW official DHLottery API
async function fetchDHLotteryRound(drwNo) {
  try {
    const url = `https://www.dhlottery.co.kr/lt645/selectPstLt645Info.do?srchLtEpsd=${drwNo}`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      timeout: 5000,
    });

    if (response.data && response.data.data && response.data.data.list && response.data.data.list.length > 0) {
      const item = response.data.data.list[0];
      const mainNums = [
        item.tm1WnNo,
        item.tm2WnNo,
        item.tm3WnNo,
        item.tm4WnNo,
        item.tm5WnNo,
        item.tm6WnNo,
      ].sort((a, b) => a - b);

      return {
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
        totSellamnt: item.wholEpsdSumNtslAmt || 0,
      };
    }
    return null;
  } catch (err) {
    console.warn(`Failed to fetch drwNo=${drwNo} from DHLottery:`, err.message);
    return null;
  }
}

// Calculate comprehensive statistics over recent N draws
function computeStatistics(historyList, limit = 100) {
  const recent = historyList.slice(0, limit);
  const totalDraws = recent.length;

  const frequencies = {};
  for (let i = 1; i <= 45; i++) {
    frequencies[i] = { number: i, count: 0, bonusCount: 0, percentage: 0 };
  }

  let totalOdd = 0;
  let totalEven = 0;

  const colorCounts = {
    yellow: 0,
    blue: 0,
    red: 0,
    gray: 0,
    green: 0,
  };

  let lowCount = 0;
  let highCount = 0;
  const ratioCounts = {};

  recent.forEach((item) => {
    const mainNums = [
      item.drwtNo1,
      item.drwtNo2,
      item.drwtNo3,
      item.drwtNo4,
      item.drwtNo5,
      item.drwtNo6,
    ];

    let roundOdd = 0;
    let roundEven = 0;

    mainNums.forEach((num) => {
      if (frequencies[num]) {
        frequencies[num].count++;
      }

      if (num % 2 === 0) {
        roundEven++;
        totalEven++;
      } else {
        roundOdd++;
        totalOdd++;
      }

      if (num <= 10) colorCounts.yellow++;
      else if (num <= 20) colorCounts.blue++;
      else if (num <= 30) colorCounts.red++;
      else if (num <= 40) colorCounts.gray++;
      else colorCounts.green++;

      if (num <= 22) lowCount++;
      else highCount++;
    });

    if (item.bnusNo && frequencies[item.bnusNo]) {
      frequencies[item.bnusNo].bonusCount++;
    }

    const ratioKey = `${roundOdd}:${roundEven}`;
    ratioCounts[ratioKey] = (ratioCounts[ratioKey] || 0) + 1;
  });

  Object.keys(frequencies).forEach((num) => {
    frequencies[num].percentage = Number(
      ((frequencies[num].count / (totalDraws || 1)) * 100).toFixed(1)
    );
  });

  const frequencyArray = Object.values(frequencies);

  const sortedByFreq = [...frequencyArray].sort((a, b) => b.count - a.count);
  const hotNumbers = sortedByFreq.slice(0, 10);
  const coldNumbers = [...sortedByFreq].reverse().slice(0, 10);

  return {
    totalDraws,
    frequencies: frequencyArray,
    hotNumbers,
    coldNumbers,
    oddEven: {
      totalOdd,
      totalEven,
      oddPercentage: Number(((totalOdd / (totalOdd + totalEven || 1)) * 100).toFixed(1)),
      evenPercentage: Number(((totalEven / (totalOdd + totalEven || 1)) * 100).toFixed(1)),
      ratios: ratioCounts,
    },
    colorCounts,
    highLow: {
      lowCount,
      highCount,
      lowPercentage: Number(((lowCount / (lowCount + highCount || 1)) * 100).toFixed(1)),
      highPercentage: Number(((highCount / (lowCount + highCount || 1)) * 100).toFixed(1)),
    },
  };
}

// REST Endpoints
app.get('/api/lotto/latest', async (req, res) => {
  let history = loadHistory();
  history.sort((a, b) => b.drwNo - a.drwNo);

  if (history.length > 0) {
    const latest = history[0];
    // Check if a newer round exists
    const nextRoundNo = latest.drwNo + 1;
    const liveNext = await fetchDHLotteryRound(nextRoundNo);
    if (liveNext) {
      history.unshift(liveNext);
      saveHistory(history);
      return res.json({ source: 'live', data: liveNext });
    }
    return res.json({ source: 'cache', data: latest });
  }

  return res.status(404).json({ error: '데이터가 존재하지 않습니다.' });
});

app.get('/api/lotto/draw/:round', async (req, res) => {
  const roundNo = parseInt(req.params.round, 10);
  if (isNaN(roundNo)) {
    return res.status(400).json({ error: '유효한 회차 번호를 입력해주세요.' });
  }

  const history = loadHistory();
  const found = history.find((h) => h.drwNo === roundNo);
  if (found) {
    return res.json({ source: 'cache', data: found });
  }

  // Live fetch from new DHLottery API
  const liveData = await fetchDHLotteryRound(roundNo);
  if (liveData) {
    history.push(liveData);
    saveHistory(history);
    return res.json({ source: 'live', data: liveData });
  }

  return res.status(404).json({ error: `${roundNo}회차 데이터를 찾을 수 없습니다.` });
});

app.get('/api/lotto/history', (req, res) => {
  const limit = parseInt(req.query.limit || '100', 10);
  let history = loadHistory();
  history.sort((a, b) => b.drwNo - a.drwNo);
  return res.json({
    total: history.length,
    history: history.slice(0, limit),
  });
});

app.get('/api/lotto/stats', (req, res) => {
  const limit = parseInt(req.query.limit || '100', 10);
  let history = loadHistory();
  history.sort((a, b) => b.drwNo - a.drwNo);
  const stats = computeStatistics(history, limit);
  return res.json(stats);
});

// Trigger live sync with DHLottery
app.post('/api/lotto/sync', async (req, res) => {
  let history = loadHistory();
  history.sort((a, b) => b.drwNo - a.drwNo);
  const maxRound = history.length > 0 ? history[0].drwNo : 1137;

  let newFetches = 0;
  let checkRound = maxRound + 1;

  while (true) {
    const live = await fetchDHLotteryRound(checkRound);
    if (!live) break;
    history.unshift(live);
    newFetches++;
    checkRound++;
  }

  if (newFetches > 0) {
    saveHistory(history);
  }

  return res.json({
    message: newFetches > 0 ? `${newFetches}개의 신규 회차가 동기화되었습니다.` : '이미 최신 회차입니다.',
    latestRound: history[0]?.drwNo || maxRound,
    syncedCount: newFetches,
  });
});

app.listen(PORT, () => {
  console.log(`🎰 Lotto Analyzer Backend running on http://localhost:${PORT}`);
});
