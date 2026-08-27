import React, { useState } from 'react';
import LottoBall from './LottoBall';
import { Dices, Copy, Check, Sparkles, Filter, CheckCircle2, RotateCcw } from 'lucide-react';

const LottoGenerator = ({ stats, latestDraw }) => {
  const [tickets, setTickets] = useState([]);
  const [algorithm, setAlgorithm] = useState('random'); // random, weighted, hot, cold
  const [fixedNumbers, setFixedNumbers] = useState([]);
  const [excludedNumbers, setExcludedNumbers] = useState([]);
  const [copied, setCopied] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [matchResults, setMatchResults] = useState(null);

  // Generate 6 numbers for 1 game based on selected algorithm
  const generateOneGame = (algo, fixed, excluded, statistics) => {
    const available = [];
    for (let i = 1; i <= 45; i++) {
      if (!excluded.includes(i)) {
        available.push(i);
      }
    }

    const selected = new Set(fixed.filter((num) => available.includes(num)));

    // Frequencies mapping
    const freqMap = {};
    if (statistics && statistics.frequencies) {
      statistics.frequencies.forEach((f) => {
        freqMap[f.number] = f.count;
      });
    }

    const maxCount = Math.max(...Object.values(freqMap), 1);
    const minCount = Math.min(...Object.values(freqMap), 0);

    // Build probability pool based on algorithm
    const pool = [];
    available.forEach((num) => {
      if (selected.has(num)) return;

      let weight = 10;
      const count = freqMap[num] || 0;

      if (algo === 'weighted') {
        weight = Math.max(1, count * 2);
      } else if (algo === 'hot') {
        weight = Math.max(1, Math.floor(((count - minCount + 1) / (maxCount - minCount + 1)) * 30));
      } else if (algo === 'cold') {
        weight = Math.max(1, Math.floor(((maxCount - count + 1) / (maxCount - minCount + 1)) * 30));
      }

      for (let w = 0; w < weight; w++) {
        pool.push(num);
      }
    });

    while (selected.size < 6 && pool.length > 0) {
      const idx = Math.floor(Math.random() * pool.length);
      const picked = pool[idx];
      selected.add(picked);
      // Remove picked from pool
      for (let i = pool.length - 1; i >= 0; i--) {
        if (pool[i] === picked) {
          pool.splice(i, 1);
        }
      }
    }

    // Fallback if pool emptied
    while (selected.size < 6) {
      const rand = Math.floor(Math.random() * 45) + 1;
      if (!excluded.includes(rand)) {
        selected.add(rand);
      }
    }

    return Array.from(selected).sort((a, b) => a - b);
  };

  // Generate 5 Games (A to E)
  const handleGenerate = () => {
    const gameLabels = ['A', 'B', 'C', 'D', 'E'];
    const newTickets = gameLabels.map((label) => {
      const nums = generateOneGame(algorithm, fixedNumbers, excludedNumbers, stats);
      let typeLabel = '자동';
      if (fixedNumbers.length > 0) typeLabel = '반자동';
      return {
        label,
        type: typeLabel,
        numbers: nums,
      };
    });

    setTickets(newTickets);
    setMatchResults(null);
  };

  // Copy tickets to clipboard
  const handleCopy = () => {
    if (tickets.length === 0) return;
    const text = tickets
      .map((t) => `[게임 ${t.label}] ${t.numbers.map((n) => String(n).padStart(2, '0')).join(', ')}`)
      .join('\n');
    navigator.clipboard.writeText(`🎰 로또6/45 추천 번호 (5회분)\n${text}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Check matching status against latest draw
  const handleCheckMatch = () => {
    if (!latestDraw || tickets.length === 0) return;

    const winning = [
      latestDraw.drwtNo1,
      latestDraw.drwtNo2,
      latestDraw.drwtNo3,
      latestDraw.drwtNo4,
      latestDraw.drwtNo5,
      latestDraw.drwtNo6,
    ];
    const bonus = latestDraw.bnusNo;

    const results = tickets.map((t) => {
      const matched = t.numbers.filter((n) => winning.includes(n));
      const hasBonus = t.numbers.includes(bonus);
      let rank = '낙첨';
      let rankBadge = 'bg-slate-800 text-slate-400';

      if (matched.length === 6) {
        rank = '🎉 1등 (6개 일치)';
        rankBadge = 'bg-amber-500 text-slate-950 font-black animate-bounce';
      } else if (matched.length === 5 && hasBonus) {
        rank = '🥈 2등 (5개+보너스)';
        rankBadge = 'bg-sky-400 text-slate-950 font-bold';
      } else if (matched.length === 5) {
        rank = '🥉 3등 (5개 일치)';
        rankBadge = 'bg-rose-400 text-slate-950 font-bold';
      } else if (matched.length === 4) {
        rank = '4등 (4개 일치 - 5만원)';
        rankBadge = 'bg-emerald-500 text-slate-950 font-bold';
      } else if (matched.length === 3) {
        rank = '5등 (3개 일치 - 5천원)';
        rankBadge = 'bg-indigo-500 text-white font-bold';
      }

      return {
        ...t,
        matched,
        hasBonus,
        rank,
        rankBadge,
      };
    });

    setMatchResults(results);
  };

  const toggleFixed = (num) => {
    if (excludedNumbers.includes(num)) return;
    if (fixedNumbers.includes(num)) {
      setFixedNumbers(fixedNumbers.filter((n) => n !== num));
    } else {
      if (fixedNumbers.length < 5) {
        setFixedNumbers([...fixedNumbers, num]);
      }
    }
  };

  const toggleExcluded = (num) => {
    if (fixedNumbers.includes(num)) return;
    if (excludedNumbers.includes(num)) {
      setExcludedNumbers(excludedNumbers.filter((n) => n !== num));
    } else {
      if (excludedNumbers.length < 20) {
        setExcludedNumbers([...excludedNumbers, num]);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Dices className="w-6 h-6 text-amber-400" />
              자동 로또 번호 추출기 (5회분)
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              무작위 랜덤 추출 및 최근 100회 통계 기반 알고리즘을 선택하여 A~E 5개 게임을 생성합니다.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition flex items-center gap-1.5 border ${
                showFilters || fixedNumbers.length > 0 || excludedNumbers.length > 0
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Filter className="w-4 h-4" />
              고정수/제외수 ({fixedNumbers.length}/{excludedNumbers.length})
            </button>

            <button
              onClick={handleGenerate}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-amber-500/25 transition transform active:scale-95 flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5 fill-slate-950" />
              5회분 번호 자동 생성
            </button>
          </div>
        </div>

        {/* Algorithm selection tabs */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold uppercase mr-2">생성 알고리즘:</span>
          {[
            { id: 'random', name: '🎲 순수 무작위' },
            { id: 'weighted', name: '📊 100회 빈도 가중치' },
            { id: 'hot', name: '🔥 Hot 번호 선호' },
            { id: 'cold', name: '❄️ Cold 번호 선호' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setAlgorithm(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                algorithm === item.id
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>

        {/* Fixed & Excluded Numbers Filter Modal/Section */}
        {showFilters && (
          <div className="mt-4 p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">
                📌 번호 선택 (클릭 1회: <span className="text-amber-400">고정수</span> / 클릭 2회: <span className="text-rose-400">제외수</span> / 클릭 3회: 해제)
              </span>
              <button
                onClick={() => {
                  setFixedNumbers([]);
                  setExcludedNumbers([]);
                }}
                className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> 초기화
              </button>
            </div>

            <div className="grid grid-cols-9 sm:grid-cols-15 gap-1.5 pt-2">
              {Array.from({ length: 45 }, (_, i) => i + 1).map((n) => {
                const isFixed = fixedNumbers.includes(n);
                const isExcluded = excludedNumbers.includes(n);

                return (
                  <button
                    key={n}
                    onClick={() => {
                      if (!isFixed && !isExcluded) toggleFixed(n);
                      else if (isFixed) {
                        setFixedNumbers(fixedNumbers.filter((x) => x !== n));
                        toggleExcluded(n);
                      } else {
                        setExcludedNumbers(excludedNumbers.filter((x) => x !== n));
                      }
                    }}
                    className={`h-8 rounded-lg font-bold text-xs transition border ${
                      isFixed
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/30'
                        : isExcluded
                        ? 'bg-rose-950/80 text-rose-400 border-rose-800 line-through opacity-60'
                        : 'bg-slate-800/60 text-slate-300 border-slate-700/60 hover:bg-slate-700'
                    }`}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main Ticket Results Display */}
      {tickets.length > 0 ? (
        <div className="lotto-ticket rounded-2xl p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-full text-xs font-bold">
                  로또6/45 추천 영수증
                </span>
                <span className="text-xs text-slate-400">발급: {new Date().toLocaleDateString('ko-KR')}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-100 mt-1">자동 추출 5게임 (A ~ E)</h3>
            </div>

            <div className="flex items-center gap-2">
              {latestDraw && (
                <button
                  onClick={handleCheckMatch}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-lg shadow-indigo-600/30"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {latestDraw.drwNo}회 당첨 대조
                </button>
              )}

              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition border border-slate-700"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? '복사 완료!' : '전체 복사'}
              </button>
            </div>
          </div>

          {/* Ticket Rows */}
          <div className="space-y-4">
            {(matchResults || tickets).map((ticket) => (
              <div
                key={ticket.label}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition"
              >
                <div className="flex items-center gap-4 mb-3 sm:mb-0">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 font-extrabold text-base flex items-center justify-center shadow-inner">
                    {ticket.label}
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {ticket.type}
                  </span>
                </div>

                {/* 6 Lotto Balls */}
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  {ticket.numbers.map((num) => {
                    const isMatched = ticket.matched && ticket.matched.includes(num);
                    return (
                      <div key={num} className="relative">
                        <LottoBall number={num} size="md" />
                        {isMatched && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-slate-950 rounded-full flex items-center justify-center text-[9px] font-black shadow">
                            ✓
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Rank Badge if checked */}
                {ticket.rank && (
                  <div className="mt-3 sm:mt-0 text-right">
                    <span className={`px-3 py-1.5 rounded-lg text-xs ${ticket.rankBadge}`}>
                      {ticket.rank}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>추천 번호는 참고용 통계 번호이며 당첨을 보장하지 않습니다.</span>
            <span className="font-mono">HL-645-AUTO</span>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-slate-900/40 border border-slate-800/60 rounded-2xl">
          <Dices className="w-12 h-12 text-slate-600 mx-auto mb-3 animate-pulse" />
          <h3 className="text-base font-bold text-slate-300">상단 생성 버튼을 눌러 로또 5회분 번호를 추출하세요</h3>
          <p className="text-xs text-slate-400 mt-1">
            순수 랜덤 또는 최근 100회 통계 기반 알고리즘을 설정할 수 있습니다.
          </p>
        </div>
      )}
    </div>
  );
};

export default LottoGenerator;
