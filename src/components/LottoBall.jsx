import React from 'react';

export const getBallColorClass = (num) => {
  if (num >= 1 && num <= 10) {
    return 'bg-amber-400 text-slate-950 ring-amber-300/50';
  } else if (num >= 11 && num <= 20) {
    return 'bg-sky-500 text-white ring-sky-300/50';
  } else if (num >= 21 && num <= 30) {
    return 'bg-rose-500 text-white ring-rose-300/50';
  } else if (num >= 31 && num <= 40) {
    return 'bg-slate-500 text-white ring-slate-300/50';
  } else if (num >= 41 && num <= 45) {
    return 'bg-emerald-500 text-white ring-emerald-300/50';
  }
  return 'bg-indigo-500 text-white ring-indigo-300/50';
};

const LottoBall = ({ number, size = 'md', isBonus = false, onClick, selected = false }) => {
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs font-bold',
    md: 'w-10 h-10 text-sm font-extrabold',
    lg: 'w-12 h-12 text-base font-black',
    xl: 'w-14 h-14 text-lg font-black',
  };

  const ballColor = getBallColorClass(number);

  return (
    <div className="relative inline-flex flex-col items-center">
      <div
        onClick={onClick}
        className={`lotto-ball-3d ${sizeClasses[size]} ${ballColor} ${
          onClick ? 'cursor-pointer' : ''
        } ${selected ? 'ring-4 ring-amber-300 scale-110' : ''}`}
      >
        {number}
      </div>
      {isBonus && (
        <span className="text-[10px] text-amber-400 font-bold mt-1 tracking-wider uppercase">
          보너스
        </span>
      )}
    </div>
  );
};

export default LottoBall;
