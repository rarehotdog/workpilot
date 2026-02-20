import type { Metadata } from 'next';

import { TutorialPage } from '@/components/tutorial/tutorial-page';

export const metadata: Metadata = {
  title: 'Motion Graphics Tutorial – WorkPilot',
  description: 'Create motion graphics with AI using Claude Code and Remotion. A simple tutorial for beginners.'
};

export default function Tutorial() {
  return <TutorialPage />;
}
