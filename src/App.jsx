import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LottoGenerator from './components/LottoGenerator';
import WinningResult from './components/WinningResult';
import StatisticsDashboard from './components/StatisticsDashboard';
import CombinationAnalyzer from './components/CombinationAnalyzer';
import { Dices, Trophy, BarChart3, Target, Sparkles, RefreshCw } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('generator'); // generator, winning, stats, analyzer
  const [latestDraw, setLatestDraw] = useState(null);
  const [currentDraw, setCurrentDraw] = useState(null);
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Initial Data Fetch
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      // 1. Fetch Latest Draw
      const latestRes = await axios.get('/api/lotto/latest');
      if (latestRes.data && latestRes.data.data) {
        setLatestDraw(latestRes.data.data);
        setCurrentDraw(latestRes.data.data);
      }

      // 2. Fetch Stats
      const statsRes = await axios.get('/api/lotto/stats?limit=100');
      if (statsRes.data) {
        setStats(statsRes.data);
      }

      // 3. Fetch History
      const historyRes = await axios.get('/api/lotto/history?limit=100');
      if (historyRes.data && historyRes.data.history) {
        setHistory(historyRes.data.history);
      }
    } catch (err) {
      console.error('Data loading error:', err);
      setErrorMsg('서버 데이터를 불러오는데 실패하였습니다. 백엔드 서버가 실행 중인지 확인해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchRound = async (roundNo) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/lotto/draw/${roundNo}`);
      if (res.data && res.data.data) {
        setCurrentDraw(res.data.data);
      }
    } catch (err) {
      alert(`${roundNo}회차 데이터를 가져오지 못했습니다.`);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncLatest = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/api/lotto/sync');
      alert(res.data.message || '최신 회차가 동기화되었습니다.');
      fetchInitialData();
    } catch (err) {
      alert('동기화 실패: 서버 응답을 확인하세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg shadow-amber-500/30">
              🎰
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-amber-400 bg-clip-text text-transparent">
                  LOTTO 6/45 LAB
                </h1>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  PRO
                </span>
              </div>
              <p className="text-xs text-slate-400">자동 추출 5회분 & 동행복권 연동 100회 통계 분석기</p>
            </div>
          </div>

          {/* Top Quick Status Pill */}
          {latestDraw && (
            <div className="hidden sm:flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl px-4 py-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-400">최신 {latestDraw.drwNo}회 당첨번호:</span>
              <div className="flex items-center gap-1 font-extrabold text-amber-400">
                {[
                  latestDraw.drwtNo1,
                  latestDraw.drwtNo2,
                  latestDraw.drwtNo3,
                  latestDraw.drwtNo4,
                  latestDraw.drwtNo5,
                  latestDraw.drwtNo6,
                ].join(', ')}
                <span className="text-slate-500 ml-1">+ {latestDraw.bnusNo}</span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {errorMsg && (
          <div className="p-4 bg-rose-500/20 border border-rose-500/40 rounded-2xl text-rose-300 text-sm flex items-center justify-between">
            <span>{errorMsg}</span>
            <button
              onClick={fetchInitialData}
              className="px-3 py-1 bg-rose-600 text-white font-bold rounded-lg text-xs"
            >
              재시도
            </button>
          </div>
        )}

        {/* Tab Navigation Menu */}
        <div className="flex items-center justify-center p-1.5 bg-slate-900/90 border border-slate-800/80 rounded-2xl max-w-2xl mx-auto shadow-inner flex-wrap sm:flex-nowrap gap-1">
          {[
            { id: 'generator', label: '번호 자동 생성기', icon: Dices },
            { id: 'winning', label: '동행복권 당첨결과', icon: Trophy },
            { id: 'stats', label: '100회 통계 분석', icon: BarChart3 },
            { id: 'analyzer', label: '조합 확률 분석기', icon: Target },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition transform active:scale-95 ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content View Switching */}
        <div className="transition-all duration-300">
          {activeTab === 'generator' && <LottoGenerator stats={stats} latestDraw={latestDraw} />}
          {activeTab === 'winning' && (
            <WinningResult
              currentDraw={currentDraw}
              onFetchRound={handleFetchRound}
              onSyncLatest={handleSyncLatest}
              loading={loading}
            />
          )}
          {activeTab === 'stats' && <StatisticsDashboard stats={stats} />}
          {activeTab === 'analyzer' && <CombinationAnalyzer history={history} stats={stats} />}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 LOTTO 6/45 LAB • 동행복권(dhlottery.co.kr) 연동 서비스</p>
          <div className="flex items-center gap-4 text-slate-400">
            <a
              href="https://www.dhlottery.co.kr/lt645/result"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-amber-400 transition"
            >
              동행복권 공식결과 바로가기
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
