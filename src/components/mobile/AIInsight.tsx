import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import type { Quest } from '../../types/app';

interface AIInsightProps {
  currentQuest?: Quest;
  completionRate: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
}

export default function AIInsight({ currentQuest, completionRate, timeOfDay }: AIInsightProps) {
  const getInsight = () => {
    if (currentQuest && !currentQuest.completed) {
      const duration = parseInt(currentQuest.duration, 10);

      if (!Number.isNaN(duration) && duration >= 120) {
        return {
          text: `${currentQuest.title}은(는) 긴 작업이에요. 25분 단위로 나눠서 진행해보세요!`,
          emoji: '⏱️',
          color: 'from-blue-400 to-cyan-500',
        };
      }

      if (timeOfDay === 'morning' && !Number.isNaN(duration) && duration >= 60) {
        return {
          text: '아침 시간을 활용해서 집중력이 필요한 작업을 먼저 끝내세요!',
          emoji: '🌅',
          color: 'from-orange-400 to-amber-500',
        };
      }

      return {
        text: `${currentQuest.title}을(를) 지금 바로 시작해보세요. 시작이 반입니다!`,
        emoji: '🚀',
        color: 'from-purple-400 to-pink-500',
      };
    }

    if (completionRate === 100) {
      return {
        text: '오늘 모든 퀘스트 완료! 스스로에게 보상을 주세요 🎉',
        emoji: '🏆',
        color: 'from-green-400 to-emerald-500',
      };
    }

    if (completionRate >= 50) {
      return {
        text: '절반 이상 완료! 남은 작업도 같은 페이스로 이어가세요.',
        emoji: '💪',
        color: 'from-indigo-400 to-purple-500',
      };
    }

    return {
      text: '오늘의 첫 퀘스트를 시작해보세요. 작은 실행이 큰 변화를 만듭니다.',
      emoji: '✨',
      color: 'from-blue-400 to-cyan-500',
    };
  };

  const insight = getInsight();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r ${insight.color} rounded-2xl card-padding shadow-lg`}
    >
      <div className="flex items-start gap-3">
        <div className="text-3xl">{insight.emoji}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={14} className="text-white" />
            <span className="caption-12 text-white font-bold">AI 조언</span>
          </div>
          <p className="body-14 text-white font-medium">{insight.text}</p>
        </div>
      </div>
    </motion.div>
  );
}
