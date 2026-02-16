import { motion } from 'motion/react';

interface GitHubContributionChartProps {
  data: number[][];
  streak: number;
}

export default function GitHubContributionChart({ data, streak }: GitHubContributionChartProps) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const getColor = (level: number) => {
    if (level <= 0) return 'bg-gray-100';
    if (level === 1) return 'bg-green-200';
    if (level === 2) return 'bg-green-400';
    if (level === 3) return 'bg-green-600';
    return 'bg-green-700';
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-gray-900">Activity</h2>
        <span className="text-xs text-gray-500">{streak} day streak 🔥</span>
      </div>

      <div className="overflow-x-auto -mx-2 px-2">
        <div className="inline-flex gap-1 min-w-max">
          <div className="flex flex-col gap-1 pr-1">
            <div className="h-3" />
            {days.map((day, index) => (
              <div key={day + index} className="h-3 flex items-center justify-center text-[10px] text-gray-400">
                {index % 2 === 1 ? day : ''}
              </div>
            ))}
          </div>

          {data.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              <div className="h-3 text-[10px] text-gray-500">
                {weekIndex % 4 === 0 ? months[Math.floor(weekIndex / 4) % 12] : ''}
              </div>
              {week.map((level, dayIndex) => (
                <motion.div
                  key={`${weekIndex}-${dayIndex}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: (weekIndex * 7 + dayIndex) * 0.003 }}
                  className={`w-3 h-3 rounded-sm ${getColor(level)} transition-colors`}
                  title={`Level ${level}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-500">Less</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((level) => (
            <div key={level} className={`w-3 h-3 rounded-sm ${getColor(level)}`} />
          ))}
        </div>
        <span className="text-xs text-gray-500">More</span>
      </div>
    </div>
  );
}
