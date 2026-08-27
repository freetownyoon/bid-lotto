import React, { useState } from 'react';
import LottoBall from './LottoBall';
import { Target, Sparkles, AlertCircle, CheckCircle2, RotateCcw, Award } from 'lucide-react';

const CombinationAnalyzer = ({ history, stats }) => {
  const [selectedNums, setSelectedNums] = useState([]);

  const toggleNumber = (n) => {
    if (selectedNums.includes(n)) {
      setSelectedNums(selectedNums.filter((x) => x !== n));
    } else {
      if (selectedNums.length < 6) {
        setSelectedNums([...selectedNums, n].sort((a, b) => a - b));
      }
    }
  };

  const handleRandomSelect = () => {
    const set = new Set();
    while (set.size < 6) {
      set.add(Math.floor(Math.random() * 45) + 1);
    }
    setSelectedNums(Array.from(set).sort((a, b) => a - b));
  };

  // Analyze selected 6 numbers against recent history
  const analyzeCombination = () => {
    if (selectedNums.length !== 6 || !history) return null;

    let hit6 = 0;
    let hit5Bonus = 0;
    let hit5 = 0;
    let hit4 = 0;
    let hit3 = 0;

    history.forEach((draw) => {
      const winning = [
        draw.drwtNo1,
        draw.drwtNo2,
        draw.drwtNo3,
        draw.drwtNo4,
        draw.drwtNo5,
        draw.drwtNo6,
      ];
      const bonus = draw.bnusNo;

      const matched = selectedNums.filter((n) => winning.includes(n)).length;
      const hasBonus = selectedNums.includes(bonus);

      if (matched === 6) hit6++;
      else if (matched === 5 && hasBonus) hit5Bonus++;
      else if (matched === 5) hit5++;
      else if (matched === 4) hit4++;
      else if (matched === 3) hit3++;
    });

    // Odd/Even breakdown
    const odds = selectedNums.filter((n) => n % 2 !== 0).length;
    const evens = 6 - odds;

    // High/Low breakdown
    const lows = selectedNums.filter((n) => n <= 22).length;
    const highs = 6 - lows;

    // Hot/Cold composition
    const freqMap = {};
    if (stats && stats.frequencies) {
      stats.frequencies.forEach((f) => (freqMap[f.number] = f.count));
    }

    const hotCount = selectedNums.filter((n) => (freqMap[n] || 0) >= 15).length;
    const coldCount = selectedNums.filter((n) => (freqMap[n] || 0) <= 10).length;

    // Score calculation
    let score = 70;
    const tips = [];

    if (odds >= 2 && odds <= 4) {
      score += 10;
      tips.push('✅ 홀짝 비율이 안정적입니다 (추천 3:3 또는 4:2)');
    } else {
      score -= 10;
      tips.push('⚠️ 홀수/짝수 편향이 큽니다. 조화로운 구성을 고려하세요.');
    }

    if (lows >= 2 && lows <= 4) {
      score += 10;
      tips.push('✅ 저번호(1~22)와 고번호(23~45)가 균형을 이룹니다.');
    } else {
      score -= 10;
      tips.push('⚠️ 고저 번호가 한쪽으로 치우쳐 있습니다.');
    }

    if (hotCount >= 1 && coldCount >= 1) {
      score += 10;
      tips.push('✅ Hot(자주 나오는 수)와 Cold(오랫동안 안나온 수)의 적절한 조합입니다.');
    }

    return {
      hit6,
      hit5Bonus,
      hit5,
      hit4,
      hit3,
      totalChecked: history.length,
      odds,
      evens,
      lows,
      highs,
      hotCount,
      coldCount,
      score: Math.min(100, Math.max(30, score)),
      tips,
    };
  };

  const analysis = selectedNums.length === 6 ? analyzeCombination() : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Target className="w-6 h-6 text-amber-400" />
            나만의 로또 조합 당첨 확률 & 과거 데이터 대조 분석
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            원하는 6개 번호를 직접 선택하고 최근 100회 당첨 이력과 통계적 당첨 지수를 확인해보세요.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRandomSelect}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
          >
            <Sparkles className="w-4 h-4 fill-slate-950" />
            랜덤 6개 선택
          </button>
          <button
            onClick={() => setSelectedNums([])}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-1 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            초기화
          </button>
        </div>
      </div>

      {/* Selected Balls Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-slate-300">
            선택된 번호 ({selectedNums.length} / 6개)
          </span>
          {selectedNums.length < 6 && (
            <span className="text-xs text-amber-400 font-semibold">
              {6 - selectedNums.length}개의 번호를 더 선택하세요
            </span>
          )}
        </div>

        <div className="flex items-center justify-center gap-3 min-h-[64px] p-4 bg-slate-950/80 rounded-xl border border-slate-800/80 flex-wrap">
          {selectedNums.length > 0 ? (
            selectedNums.map((n) => <LottoBall key={n} number={n} size="lg" />)
          ) : (
            <span className="text-slate-500 text-sm">아래 번호 판에서 6개 번호를 선택해주세요</span>
          )}
        </div>

        {/* 45 Number Matrix Selector */}
        <div className="grid grid-cols-5 sm:grid-cols-9 md:grid-cols-15 gap-2 pt-2">
          {Array.from({ length: 45 }, (_, i) => i + 1).map((n) => {
            const isSelected = selectedNums.includes(n);
            return (
              <button
                key={n}
                onClick={() => toggleNumber(n)}
                className={`h-10 rounded-xl font-extrabold text-sm transition transform border ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/30 scale-105'
                    : 'bg-slate-800/80 text-slate-200 border-slate-700/60 hover:bg-slate-700'
                }`}
              >
                {n}
              </button>
            );
          })}
        </div>
      </div>

      {/* Analysis Results Display */}
      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Score & Rating */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                조합 통계 지수
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-amber-400">{analysis.score}</span>
                <span className="text-slate-400 font-bold">/ 100점</span>
              </div>
              <p className="text-xs text-slate-400">
                수학적 이론 확률(1/8,145,060) 및 최근 100회 출현 밸런스 점수입니다.
              </p>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-800">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">홀수:짝수</span>
                <span className="font-bold text-slate-200">
                  {analysis.odds}:{analysis.evens}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">저번호(1-22):고번호(23-45)</span>
                <span className="font-bold text-slate-200">
                  {analysis.lows}:{analysis.highs}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Hot 번호 포함 수</span>
                <span className="font-bold text-amber-400">{analysis.hotCount}개</span>
              </div>
            </div>
          </div>

          {/* Historical Hit Matrix */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-400" />
              최근 {analysis.totalChecked}회차 내 이력 대조
            </h3>

            <div className="space-y-2.5">
              <div className="flex justify-between items-center p-2.5 bg-slate-950/60 rounded-xl text-xs border border-slate-800">
                <span className="font-bold text-slate-300">1등 (6개 전부 일치)</span>
                <span className="font-black text-amber-400">{analysis.hit6} 회</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-slate-950/60 rounded-xl text-xs border border-slate-800">
                <span className="font-bold text-slate-300">2등 (5개+보너스 일치)</span>
                <span className="font-bold text-sky-400">{analysis.hit5Bonus} 회</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-slate-950/60 rounded-xl text-xs border border-slate-800">
                <span className="font-bold text-slate-300">3등 (5개 일치)</span>
                <span className="font-bold text-rose-400">{analysis.hit5} 회</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-slate-950/60 rounded-xl text-xs border border-slate-800">
                <span className="font-bold text-slate-300">4등 (4개 일치 - 5만원)</span>
                <span className="font-bold text-emerald-400">{analysis.hit4} 회</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-slate-950/60 rounded-xl text-xs border border-slate-800">
                <span className="font-bold text-slate-300">5등 (3개 일치 - 5천원)</span>
                <span className="font-bold text-indigo-400">{analysis.hit3} 회</span>
              </div>
            </div>
          </div>

          {/* AI Tips & Feedback */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-amber-400" />
              조합 진단 리포트
            </h3>

            <div className="space-y-3">
              {analysis.tips.map((tip, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed"
                >
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CombinationAnalyzer;
