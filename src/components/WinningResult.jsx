import React, { useState } from 'react';
import LottoBall from './LottoBall';
import { Trophy, ExternalLink, Search, RefreshCw, ChevronLeft, ChevronRight, Users, Coins } from 'lucide-react';

const WinningResult = ({ currentDraw, onFetchRound, onSyncLatest, loading }) => {
  const [searchInput, setSearchInput] = useState('');

  if (!currentDraw) {
    return (
      <div className="p-12 text-center bg-slate-900/60 rounded-2xl border border-slate-800">
        <RefreshCw className="w-8 h-8 text-amber-400 mx-auto animate-spin mb-3" />
        <p className="text-slate-300 font-medium">동행복권 당첨 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  const mainNumbers = [
    currentDraw.drwtNo1,
    currentDraw.drwtNo2,
    currentDraw.drwtNo3,
    currentDraw.drwtNo4,
    currentDraw.drwtNo5,
    currentDraw.drwtNo6,
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const roundNo = parseInt(searchInput, 10);
    if (!isNaN(roundNo) && roundNo > 0) {
      onFetchRound(roundNo);
      setSearchInput('');
    }
  };

  const formatMoney = (amount) => {
    if (!amount) return '0원';
    if (amount >= 100000000) {
      const uk = Math.floor(amount / 100000000);
      const man = Math.floor((amount % 100000000) / 10000);
      return `${uk.toLocaleString()}억 ${man > 0 ? man.toLocaleString() + '만' : ''}원`;
    }
    return `${amount.toLocaleString()}원`;
  };

  return (
    <div className="space-y-6">
      {/* Header Search & Nav */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-xl shadow-inner">
            {currentDraw.drwNo}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-100">제 {currentDraw.drwNo}회 당첨결과</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {currentDraw.drwNoDate} 추첨
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              동행복권 공식 데이터베이스 연동 정보입니다.
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="number"
              placeholder="회차 검색 (예: 1150)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-40 px-3 py-2 pl-9 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-2.5" />
          </form>

          <button
            onClick={() => onFetchRound(currentDraw.drwNo - 1)}
            disabled={loading || currentDraw.drwNo <= 1}
            className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-xl border border-slate-700 transition"
            title="이전 회차"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => onFetchRound(currentDraw.drwNo + 1)}
            disabled={loading}
            className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-xl border border-slate-700 transition"
            title="다음 회차"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={onSyncLatest}
            disabled={loading}
            className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            최신 동기화
          </button>

          <a
            href="https://www.dhlottery.co.kr/lt645/result"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-1 transition"
          >
            동행복권 공식 <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>
      </div>

      {/* Main Result Display Board */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-8 shadow-xl">
        <div className="text-center space-y-4">
          <span className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-full text-xs font-bold uppercase tracking-wider">
            Winning Numbers
          </span>
          <h3 className="text-2xl md:text-3xl font-extrabold text-slate-100">
            {currentDraw.drwNo}회 당첨 번호
          </h3>

          {/* Balls Row */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap pt-4 pb-2">
            {mainNumbers.map((num, idx) => (
              <LottoBall key={idx} number={num} size="xl" />
            ))}
            <div className="text-2xl font-bold text-slate-500 px-2">+</div>
            <LottoBall number={currentDraw.bnusNo} size="xl" isBonus={true} />
          </div>
        </div>

        {/* Prize Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold">1등 당첨금 (1인당)</p>
              <p className="text-lg font-extrabold text-amber-400">
                {formatMoney(currentDraw.firstWinamnt)}
              </p>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold">1등 당첨자 수</p>
              <p className="text-lg font-extrabold text-slate-100">
                {currentDraw.firstPrzwnerCo || 0} 명
              </p>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold">총 판매 금액</p>
              <p className="text-lg font-extrabold text-slate-100">
                {formatMoney(currentDraw.totSellamnt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WinningResult;
