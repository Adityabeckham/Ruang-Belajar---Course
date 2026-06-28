import type { RouteObject } from 'react-router-dom';
import ExercisesHarness from '@/pages/harness/ExercisesHarness';
import DiscussionHarness from '@/pages/harness/DiscussionHarness';
import GamificationHarness from '@/pages/harness/GamificationHarness';
import Showcase from '@/Showcase';

/**
 * Harness route `/_harness/*` (Task 0.8). Halaman uji mandiri tiap stream,
 * berdiri di luar shell utama & tanpa guard — tak menunggu LessonView Dev A.
 */
export const harnessRoutes: RouteObject[] = [
  { path: '_harness/exercises', element: <ExercisesHarness /> },
  { path: '_harness/discussion', element: <DiscussionHarness /> },
  { path: '_harness/gamification', element: <GamificationHarness /> },
  { path: '_harness/ui-kit', element: <Showcase /> },
];
