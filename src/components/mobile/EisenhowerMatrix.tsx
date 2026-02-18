import { motion } from 'motion/react';
import { AlertCircle, ArrowUpRight, Clock, Trash2 } from 'lucide-react';
import type { Quest } from '../../types/app';

interface EisenhowerMatrixProps {
  quests: Quest[];
  onQuestToggle: (questId: string) => void;
}

export default function EisenhowerMatrix({ quests, onQuestToggle }: EisenhowerMatrixProps) {
  const categorize = (quest: Quest) => {
    const duration = parseInt(quest.duration, 10);
    const isUrgent = quest.timeOfDay === 'morning';
    const isImportant = (!Number.isNaN(duration) && duration >= 60) || quest.timeOfDay === 'afternoon';

    if (isUrgent && isImportant) return 'do';
    if (!isUrgent && isImportant) return 'schedule';
    if (isUrgent && !isImportant) return 'delegate';
    return 'eliminate';
  };

  const matrix = {
    do: quests.filter((q) => categorize(q) === 'do'),
    schedule: quests.filter((q) => categorize(q) === 'schedule'),
    delegate: quests.filter((q) => categorize(q) === 'delegate'),
    eliminate: quests.filter((q) => categorize(q) === 'eliminate'),
  };

  const quadrants = [
    { id: 'do', title: 'DO FIRST', icon: AlertCircle, color: 'from-red-50 to-pink-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700' },
    { id: 'schedule', title: 'SCHEDULE', icon: Clock, color: 'from-blue-50 to-cyan-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700' },
    { id: 'delegate', title: 'DELEGATE', icon: ArrowUpRight, color: 'from-amber-50 to-yellow-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700' },
    { id: 'eliminate', title: 'ELIMINATE', icon: Trash2, color: 'from-gray-50 to-slate-50', border: 'border-gray-200', badge: 'bg-gray-100 text-gray-700' },
  ] as const;

  return (
    <div className="space-y-4">
      <div className="px-1">
        <h2 className="heading-2 text-gray-900 mb-1">우선순위 매트릭스</h2>
        <p className="body-14 text-gray-600">AI가 자동으로 분류했어요</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {quadrants.map((quadrant, idx) => {
          const Icon = quadrant.icon;
          const quadrantQuests = matrix[quadrant.id];
          const completed = quadrantQuests.filter((q) => q.completed).length;

          return (
            <motion.div
              key={quadrant.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className={`bg-gradient-to-br ${quadrant.color} rounded-2xl card-padding border-2 ${quadrant.border} min-h-[170px]`}
            >
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={16} className="text-gray-700" />
                  <h3 className="caption-12 font-bold text-gray-900">{quadrant.title}</h3>
                </div>
                <div className={`caption-11 inline-block px-2 py-0.5 rounded-full ${quadrant.badge} font-bold`}>
                  {completed}/{quadrantQuests.length}
                </div>
              </div>

              <div className="space-y-1.5 max-h-[90px] overflow-y-auto">
                {quadrantQuests.length === 0 ? (
                  <p className="caption-12 text-gray-400 text-center py-2">없음</p>
                ) : (
                  quadrantQuests.map((quest) => (
                    <motion.button
                      key={quest.id}
                      onClick={() => onQuestToggle(quest.id)}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full text-left p-2 rounded-lg border transition-all ${
                        quest.completed ? 'bg-white/40 border-white/70' : 'bg-white/85 border-white'
                      }`}
                    >
                      <p className={`caption-11 font-medium ${quest.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                        {quest.title}
                      </p>
                    </motion.button>
                  ))
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
