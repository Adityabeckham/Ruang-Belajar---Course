import { Flex, Progress, Typography } from 'antd';
import { LevelBadge } from './LevelBadge';

const { Text } = Typography;

export interface XPBarProps {
  /** Current XP within the level. */
  value: number;
  /** XP needed to reach the next level. */
  max: number;
  level?: number;
  /** Show the circular level badge on the left. Default true. */
  showLevel?: boolean;
}

/** Gamified XP progress: level badge + labeled progress bar. */
export function XPBar({ value, max, level, showLevel = true }: XPBarProps) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <Flex align="center" gap={12} style={{ width: '100%' }}>
      {showLevel && level != null && <LevelBadge level={level} size={40} />}
      <Flex vertical flex={1} gap={2}>
        <Flex justify="space-between" gap={8}>
          <Text strong>{level != null ? `Level ${level}` : 'XP'}</Text>
          <Text type="secondary">
            {value} / {max} XP
          </Text>
        </Flex>
        <Progress percent={percent} showInfo={false} />
      </Flex>
    </Flex>
  );
}
