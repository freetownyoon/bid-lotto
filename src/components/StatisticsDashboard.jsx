import React, { useState } from 'react';
import LottoBall from './LottoBall';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { BarChart3, Flame, Snowflake, PieChart, Layers, HelpCircle } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const StatisticsDashboard = ({ stats }) => {
  const [selectedRange, setSelectedRange] = useState(100);

  if (!stats || !stats.frequencies) {
    return (
      <div className="p-12 text-center bg-slate-900/60 rounded-2xl border border-slate-800">
        <p className="text-slate-400">통계 데이터를 계산하는 중입니다...</p>
      </div>
    );
  }

  // Frequencies 1..45
  const frequencies = stats.frequencies || [];
  const labels = frequencies.map((f) => `${f.number}번`);
  const counts = frequencies.map((f) => f.count);

  // Background colors matching Lotto ball color scheme
  const barColors = frequencies.map((f) => {
    const num = f.number;
    if (num <= 10) return '#f1c40f'; // Yellow
    if (num <= 20) return '#3498db'; // Blue
    if (num <= 30) return '#e74c3c'; // Red
    if (num <= 40) return '#95a5a6'; // Gray
    return '#2ecc71'; // Green
  });

  const barData = {
    labels,
    datasets: [
      {
        label: '출현 횟수 (회)',
        data: counts,
        backgroundColor: barColors,
        borderRadius: 6,
        borderWidth: 0,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const count = context.parsed.y;
            const pct = ((count / stats.totalDraws) * 100).toFixed(1);
            return `출현: ${count}회 (${pct}%)`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false, drawBorder: false },
        ticks: { color: '#94a3b8', font: { size: 10 } },
      },
      y: {
        grid: { color: '#1e293b' },
        ticks: { color: '#94a3b8' },
        beginAtZero: true,
      },
    },
  };

  // Color Distribution Donut Chart Data
  const colorData = {
    labels: ['노랑 (1~10)', '파랑 (11~20)', '빨강 (21~30)', '회색 (31~40)', '초록 (41~45)'],
    datasets: [
      {
        data: [
          stats.colorCounts.yellow || 0,
          stats.colorCounts.blue || 0,
          stats.colorCounts.red || 0,
          stats.colorCounts.gray || 0,
          stats.colorCounts.green || 0,
        ],
        backgroundColor: ['#f1c40f', '#3498db', '#e74c3c', '#95a5a6', '#2ecc71'],
        borderWidth: 0,
      },
    ],
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: { color: '#cbd5e1', font: { size: 11 } },
      },
    },
  };

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-amber-400" />
            최근 {stats.totalDraws}회차 분석 & 번호별 출현 확률 시각화
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            1~45번 각 번호의 실제 당첨 출현 빈도, Hot/Cold 번호 분포 및 색상/홀짝 비중 통계입니다.
          </p>
        </div>

        <div className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-amber-400">
          총 {stats.totalDraws}회 샘플 분석 완료
        </div>
      </div>

      {/* Main Bar Chart */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-400" />
            1 ~ 45번 번호별 출현 빈도 (최근 {stats.totalDraws}회)
          </h3>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-3 h-3 rounded-full bg-amber-400 inline-block"></span>1-10
            <span className="w-3 h-3 rounded-full bg-sky-500 inline-block ml-1"></span>11-20
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block ml-1"></span>21-30
            <span className="w-3 h-3 rounded-full bg-slate-500 inline-block ml-1"></span>31-40
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block ml-1"></span>41-45
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <Bar data={barData} options={barOptions} />
        </div>
      </div>

      {/* Hot & Cold Top 10 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hot Numbers */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-500" />
              최다 출현 번호 Top 10 (Hot)
            </h3>
            <span className="text-xs text-rose-400 font-semibold">최근 출현 빈도 높음</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {stats.hotNumbers.map((item) => (
              <div
                key={item.number}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80"
              >
                <div className="flex items-center gap-3">
                  <LottoBall number={item.number} size="sm" />
                  <span className="text-xs font-bold text-slate-200">{item.number}번</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-amber-400">{item.count}회</span>
                  <p className="text-[10px] text-slate-500">{item.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cold Numbers */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Snowflake className="w-5 h-5 text-sky-400" />
              최저 출현 번호 Top 10 (Cold)
            </h3>
            <span className="text-xs text-sky-400 font-semibold">최근 출현 빈도 낮음</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {stats.coldNumbers.map((item) => (
              <div
                key={item.number}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80"
              >
                <div className="flex items-center gap-3">
                  <LottoBall number={item.number} size="sm" />
                  <span className="text-xs font-bold text-slate-200">{item.number}번</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-sky-400">{item.count}회</span>
                  <p className="text-[10px] text-slate-500">{item.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Distribution Ratios (Odd/Even, Color, High/Low) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Color Donut Chart */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3 shadow-xl">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-400" />
            공 색상별 출현 비중
          </h3>
          <div className="h-48 w-full pt-2">
            <Doughnut data={colorData} options={donutOptions} />
          </div>
        </div>

        {/* Odd/Even Ratio */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              홀수 / 짝수 비율
            </h3>
            <p className="text-xs text-slate-400 mt-1">당첨 번호 전체의 홀짝 분포</p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-amber-400">홀수 ({stats.oddEven.oddPercentage}%)</span>
                <span className="text-sky-400">짝수 ({stats.oddEven.evenPercentage}%)</span>
              </div>
              <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-amber-400 transition-all duration-500"
                  style={{ width: `${stats.oddEven.oddPercentage}%` }}
                ></div>
                <div
                  className="h-full bg-sky-500 transition-all duration-500"
                  style={{ width: `${stats.oddEven.evenPercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs space-y-1">
              <span className="font-bold text-slate-300">최다 발생 홀짝 패턴:</span>
              <div className="flex flex-wrap gap-2 pt-1">
                {Object.entries(stats.oddEven.ratios || {})
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 4)
                  .map(([ratio, count]) => (
                    <span
                      key={ratio}
                      className="px-2 py-0.5 bg-slate-800 rounded text-[11px] text-slate-300 border border-slate-700"
                    >
                      홀:짝 {ratio} ({count}회)
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* High / Low Ratio */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              저번호 / 고번호 비율
            </h3>
            <p className="text-xs text-slate-400 mt-1">1~22번(저) vs 23~45번(고)</p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-emerald-400">저번호 1~22 ({stats.highLow.lowPercentage}%)</span>
                <span className="text-rose-400">고번호 23~45 ({stats.highLow.highPercentage}%)</span>
              </div>
              <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-emerald-400 transition-all duration-500"
                  style={{ width: `${stats.highLow.lowPercentage}%` }}
                ></div>
                <div
                  className="h-full bg-rose-500 transition-all duration-500"
                  style={{ width: `${stats.highLow.highPercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-400 leading-relaxed">
              최근 {stats.totalDraws}회차 분석 결과, 로또 1등 당첨번호는 평균적으로 저번호 3개와 고번호 3개의 조화로운 분포를 보입니다.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsDashboard;
