import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import OnboardingFlow from './src/components/OnboardingFlow';
import HomeScreen from './src/components/mobile/HomeScreen';
import TechTreeScreen from './src/components/mobile/TechTreeScreen';
import ProgressScreen from './src/components/mobile/ProgressScreen';
import ProfileScreen from './src/components/mobile/ProfileScreen';
import BottomNavigation from './src/components/mobile/BottomNavigation';
import FailureSheet from './src/components/mobile/FailureSheet';
import {
  generatePersonalizedQuests,
  generateTechTree,
  getAIInsight,
  isGeminiConfigured,
  type TechTreeResponse,
} from './src/lib/gemini';
import {
  saveProfile,
  saveQuests,
  saveTechTree,
  saveQuestHistory,
  isSupabaseConfigured,
} from './src/lib/supabase';

type Screen = 'onboarding' | 'home' | 'techTree' | 'progress' | 'profile';

export interface UserProfile {
  name: string;
  goal: string;
  deadline: string;
  routineTime: string;
  constraints: string;
  currentDay: number;
  streak: number;
  weeklyCompletion: number;
  estimatedGoalDate: string;
  joinedDate: string;
  daysUntilDeadline?: number;
}

export interface Quest {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  alternative?: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  description?: string;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [todayQuests, setTodayQuests] = useState<Quest[]>([]);
  const [isCustomized, setIsCustomized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingQuests, setIsGeneratingQuests] = useState(false);
  const [techTree, setTechTree] = useState<TechTreeResponse | null>(null);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [failureQuest, setFailureQuest] = useState<Quest | null>(null);
  const [isFailureSheetOpen, setIsFailureSheetOpen] = useState(false);

  // ── Load saved state ──
  useEffect(() => {
    const savedProfile = localStorage.getItem('ltr_profile');
    const savedQuests = localStorage.getItem('ltr_quests');
    const savedTree = localStorage.getItem('ltr_techTree');
    const customized = localStorage.getItem('ltr_customized');

    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      setUserProfile(profile);
      setIsCustomized(customized === 'true');

      // Check if quests need daily refresh
      const lastQuestDate = localStorage.getItem('ltr_questDate');
      const todayStr = new Date().toISOString().split('T')[0];

      if (lastQuestDate !== todayStr && isGeminiConfigured()) {
        // New day - regenerate quests
        refreshDailyQuests(profile);
      } else if (savedQuests) {
        setTodayQuests(JSON.parse(savedQuests));
      } else {
        setDefaultQuests(profile);
      }

      // Load AI insight
      if (isGeminiConfigured()) {
        loadAIInsight(profile);
      }
    } else {
      const defaultProfile: UserProfile = {
        name: '게스트',
        goal: '하루 하루 성장하기',
        deadline: '무제한',
        routineTime: 'morning',
        constraints: '없음',
        currentDay: 1,
        streak: 0,
        weeklyCompletion: 0,
        estimatedGoalDate: '지속적',
        joinedDate: new Date().toISOString().split('T')[0],
      };
      setUserProfile(defaultProfile);
      setDefaultQuests(defaultProfile);
    }

    if (savedTree) {
      try { setTechTree(JSON.parse(savedTree)); } catch { /* ignore */ }
    }

    setIsLoading(false);
  }, []);

  // ── AI Insight ──
  const loadAIInsight = async (profile: UserProfile) => {
    try {
      const savedQuests = localStorage.getItem('ltr_quests');
      const quests: Quest[] = savedQuests ? JSON.parse(savedQuests) : [];
      const rate = quests.length > 0
        ? (quests.filter(q => q.completed).length / quests.length) * 100
        : 0;
      const insight = await getAIInsight(profile, rate);
      if (insight) setAiMessage(insight);
    } catch { /* silent fail */ }
  };

  // ── Refresh daily quests via AI ──
  const refreshDailyQuests = async (profile: UserProfile) => {
    if (!isGeminiConfigured()) return;

    setIsGeneratingQuests(true);
    try {
      const aiQuests = await generatePersonalizedQuests(profile);
      if (aiQuests && aiQuests.length > 0) {
        setTodayQuests(aiQuests);
        localStorage.setItem('ltr_quests', JSON.stringify(aiQuests));
        localStorage.setItem('ltr_questDate', new Date().toISOString().split('T')[0]);
      } else {
        setDefaultQuests(profile);
      }
    } catch {
      setDefaultQuests(profile);
    } finally {
      setIsGeneratingQuests(false);
    }
  };

  // ── Onboarding complete ──
  const handleOnboardingComplete = async (profile: UserProfile) => {
    const newProfile: UserProfile = {
      ...profile,
      joinedDate: new Date().toISOString().split('T')[0],
    };

    setUserProfile(newProfile);
    setIsCustomized(true);
    setCurrentScreen('home');
    localStorage.setItem('ltr_profile', JSON.stringify(newProfile));
    localStorage.setItem('ltr_customized', 'true');

    // Sync to Supabase
    if (isSupabaseConfigured()) saveProfile(newProfile);

    if (isGeminiConfigured()) {
      setIsGeneratingQuests(true);
      setAiMessage('AI가 맞춤 퀘스트를 생성하고 있어요...');

      try {
        const [aiQuests, aiTree, insight] = await Promise.all([
          generatePersonalizedQuests(newProfile),
          generateTechTree(newProfile),
          getAIInsight(newProfile, 0),
        ]);

        if (aiQuests && aiQuests.length > 0) {
          setTodayQuests(aiQuests);
          localStorage.setItem('ltr_quests', JSON.stringify(aiQuests));
          localStorage.setItem('ltr_questDate', new Date().toISOString().split('T')[0]);
          if (isSupabaseConfigured()) saveQuests(aiQuests);
        } else {
          setDefaultQuests(newProfile);
        }

        if (aiTree) {
          setTechTree(aiTree);
          localStorage.setItem('ltr_techTree', JSON.stringify(aiTree));
          if (isSupabaseConfigured()) saveTechTree(aiTree);
        }

        if (insight) setAiMessage(insight);
        else setAiMessage('AI가 맞춤 퀘스트를 생성했어요! 🎯');
      } catch {
        setDefaultQuests(newProfile);
      } finally {
        setIsGeneratingQuests(false);
        setTimeout(() => setAiMessage(null), 5000);
      }
    } else {
      setDefaultQuests(newProfile);
    }
  };

  // ── Default quests fallback ──
  const setDefaultQuests = (profile: UserProfile) => {
    const quests: Quest[] = [
      {
        id: '1',
        title: '오늘의 목표 설정하기',
        duration: '5분',
        completed: false,
        timeOfDay: 'morning',
        description: '하루를 시작하기 전 목표를 정해보세요',
      },
      {
        id: '2',
        title: '집중 시간 갖기',
        duration: '25분',
        completed: false,
        timeOfDay: 'afternoon',
        description: '포모도로 타이머로 집중해보세요',
      },
      {
        id: '3',
        title: '하루 되돌아보기',
        duration: '10분',
        completed: false,
        timeOfDay: 'evening',
        description: '오늘 무엇을 이뤘는지 기록해보세요',
      },
    ];
    setTodayQuests(quests);
    localStorage.setItem('ltr_quests', JSON.stringify(quests));
    localStorage.setItem('ltr_questDate', new Date().toISOString().split('T')[0]);
  };

  // ── Regenerate quests ──
  const handleRegenerateQuests = useCallback(async () => {
    if (!userProfile || !isGeminiConfigured()) return;

    setIsGeneratingQuests(true);
    setAiMessage('새로운 퀘스트를 생성하고 있어요...');

    try {
      const aiQuests = await generatePersonalizedQuests(userProfile);
      if (aiQuests && aiQuests.length > 0) {
        setTodayQuests(aiQuests);
        localStorage.setItem('ltr_quests', JSON.stringify(aiQuests));
        localStorage.setItem('ltr_questDate', new Date().toISOString().split('T')[0]);
        setAiMessage('새로운 퀘스트가 준비되었어요! ✨');
      }
    } catch {
      setAiMessage('퀘스트 생성에 실패했어요. 다시 시도해주세요.');
    } finally {
      setIsGeneratingQuests(false);
      setTimeout(() => setAiMessage(null), 3000);
    }
  }, [userProfile]);

  // ── Quest toggle ──
  const handleQuestToggle = useCallback((questId: string) => {
    if (!userProfile) return;

    setTodayQuests(prev => {
      const updated = prev.map(q =>
        q.id === questId ? { ...q, completed: !q.completed } : q
      );
      localStorage.setItem('ltr_quests', JSON.stringify(updated));

      // Sync to Supabase
      if (isSupabaseConfigured()) {
        saveQuests(updated);
        const done = updated.filter(q => q.completed).length;
        saveQuestHistory(done, updated.length);
      }

      // Check if all completed
      const allCompleted = updated.every(q => q.completed);
      const wasAllCompleted = prev.every(q => q.completed);

      if (allCompleted && !wasAllCompleted) {
        const updatedProfile: UserProfile = {
          ...userProfile,
          currentDay: userProfile.currentDay + 1,
          streak: userProfile.streak + 1,
          weeklyCompletion: Math.min(100, userProfile.weeklyCompletion + 14),
        };
        setUserProfile(updatedProfile);
        localStorage.setItem('ltr_profile', JSON.stringify(updatedProfile));
        if (isSupabaseConfigured()) saveProfile(updatedProfile);

        // Update tech tree: advance in_progress quest to completed
        if (techTree) {
          const updatedTree = advanceTechTree(techTree);
          setTechTree(updatedTree);
          localStorage.setItem('ltr_techTree', JSON.stringify(updatedTree));
          if (isSupabaseConfigured()) saveTechTree(updatedTree);
        }

        // Refresh AI insight
        if (isGeminiConfigured()) loadAIInsight(updatedProfile);
      }

      return updated;
    });
  }, [userProfile, techTree]);

  // ── TechTree update handler ──
  const handleTechTreeUpdate = useCallback((tree: TechTreeResponse) => {
    setTechTree(tree);
    localStorage.setItem('ltr_techTree', JSON.stringify(tree));
  }, []);

  // ── Advance tech tree when all quests completed ──
  function advanceTechTree(tree: TechTreeResponse): TechTreeResponse {
    const newTree = JSON.parse(JSON.stringify(tree)) as TechTreeResponse;
    const root = newTree.root;

    if (!root.children) return newTree;

    for (const phase of root.children) {
      if (phase.status === 'in_progress' && phase.children) {
        // Find current in_progress quest and advance it
        let advanced = false;
        for (let i = 0; i < phase.children.length; i++) {
          const quest = phase.children[i];
          if (quest.status === 'in_progress') {
            quest.status = 'completed';
            // Unlock next quest
            if (i + 1 < phase.children.length && phase.children[i + 1].status === 'locked') {
              phase.children[i + 1].status = 'in_progress';
            }
            advanced = true;
            break;
          }
        }

        // Check if entire phase is completed
        const allDone = phase.children.every(q => q.status === 'completed');
        if (allDone) {
          phase.status = 'completed';
          // Unlock next phase
          const phaseIdx = root.children.indexOf(phase);
          if (phaseIdx + 1 < root.children.length) {
            const nextPhase = root.children[phaseIdx + 1];
            nextPhase.status = 'in_progress';
            if (nextPhase.children && nextPhase.children.length > 0) {
              nextPhase.children[0].status = 'in_progress';
            }
          }
        }

        if (advanced) break;
      }
    }

    // Check if all phases completed
    const allPhasesComplete = root.children.every(p => p.status === 'completed');
    if (allPhasesComplete) root.status = 'completed';

    return newTree;
  }

  // ── Quest failure ──
  const handleQuestFail = useCallback((questId: string) => {
    const quest = todayQuests.find(q => q.id === questId);
    if (quest) {
      setFailureQuest(quest);
      setIsFailureSheetOpen(true);
    }
  }, [todayQuests]);

  // ── Accept recovery quest ──
  const handleAcceptRecovery = useCallback((recoveryQuest: Quest) => {
    setTodayQuests(prev => {
      const updated = prev.map(q =>
        q.id === failureQuest?.id ? { ...recoveryQuest, id: q.id } : q
      );
      localStorage.setItem('ltr_quests', JSON.stringify(updated));
      if (isSupabaseConfigured()) saveQuests(updated);
      return updated;
    });
    setFailureQuest(null);
  }, [failureQuest]);

  const handleStartCustomization = () => setCurrentScreen('onboarding');

  const completedCount = todayQuests.filter(q => q.completed).length;
  const totalCount = todayQuests.length;
  const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#F9FAFB] max-w-[430px] mx-auto">
      {/* Status Bar */}
      {currentScreen !== 'onboarding' && (
        <div className="fixed top-0 left-0 right-0 max-w-[430px] mx-auto h-11 bg-white/80 backdrop-blur-md z-50 flex items-center justify-between px-6 text-sm border-b border-[#F3F4F6]">
          <span className="font-semibold text-gray-900">
            {new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-11 font-semibold text-[#7C3AED]">LTR</span>
            <div className="w-6 h-3 bg-[#7C3AED] rounded-sm flex items-center justify-end pr-0.5">
              <div className="w-0.5 h-2 bg-purple-900 rounded-full" />
            </div>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {currentScreen === 'onboarding' && (
          <motion.div key="onboarding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <OnboardingFlow onComplete={handleOnboardingComplete} />
          </motion.div>
        )}

        {currentScreen === 'home' && userProfile && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-11 pb-24">
            <HomeScreen
              profile={userProfile}
              quests={todayQuests}
              onQuestToggle={handleQuestToggle}
              onQuestFail={handleQuestFail}
              completionRate={completionRate}
              isGeneratingQuests={isGeneratingQuests}
              onRegenerateQuests={handleRegenerateQuests}
              aiMessage={aiMessage}
              isAiEnabled={isGeminiConfigured()}
            />
          </motion.div>
        )}

        {currentScreen === 'techTree' && userProfile && (
          <motion.div key="techTree" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-11 pb-24">
            <TechTreeScreen
              profile={userProfile}
              techTree={techTree}
              onTechTreeUpdate={handleTechTreeUpdate}
            />
          </motion.div>
        )}

        {currentScreen === 'progress' && userProfile && (
          <motion.div key="progress" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-11 pb-24">
            <ProgressScreen
              profile={userProfile}
              completionRate={completionRate}
              completedCount={completedCount}
              totalCount={totalCount}
            />
          </motion.div>
        )}

        {currentScreen === 'profile' && userProfile && (
          <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-11 pb-24">
            <ProfileScreen
              profile={userProfile}
              onStartCustomization={handleStartCustomization}
              isCustomized={isCustomized}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {currentScreen !== 'onboarding' && (
        <BottomNavigation
          currentScreen={currentScreen}
          onNavigate={(screen) => setCurrentScreen(screen as Screen)}
        />
      )}

      {/* Failure Recovery Sheet */}
      {userProfile && (
        <FailureSheet
          isOpen={isFailureSheetOpen}
          onClose={() => setIsFailureSheetOpen(false)}
          quest={failureQuest}
          profile={userProfile}
          onAcceptRecovery={handleAcceptRecovery}
        />
      )}
    </div>
  );
}
