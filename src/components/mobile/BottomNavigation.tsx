import { Home, Map, TrendingUp, User } from 'lucide-react';
import { Button } from '../ui';

type Screen = 'home' | 'techTree' | 'progress' | 'profile';

interface BottomNavigationProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

export default function BottomNavigation({ currentScreen, onNavigate }: BottomNavigationProps) {
  const tabs = [
    { id: 'home' as Screen, label: 'Home', icon: Home },
    { id: 'techTree' as Screen, label: 'Journey', icon: Map },
    { id: 'progress' as Screen, label: 'Progress', icon: TrendingUp },
    { id: 'profile' as Screen, label: 'Profile', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-white border-t border-gray-200 safe-bottom z-50">
      <div className="flex items-center justify-around h-20 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentScreen === tab.id;

          return (
            <Button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              variant="ghost"
              className="h-full flex-1 flex-col items-center justify-center gap-1 rounded-none"
            >
              <Icon size={24} className={isActive ? 'text-blue-500' : 'text-gray-400'} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`caption-12 ${isActive ? 'text-blue-500 font-semibold' : 'text-gray-500'}`}>{tab.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
