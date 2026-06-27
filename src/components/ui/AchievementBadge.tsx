import type { ReactNode } from 'react';
import { Typography } from 'antd';
import { createStyles } from 'antd-style';

const { Text } = Typography;

const useStyles = createStyles(({ css, token }) => ({
  tile: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    text-align: center;
    width: 124px;
    padding: ${token.padding}px;
    border: ${token.lineWidth}px solid ${token.colorBorder};
    box-shadow: 4px 4px 0 ${token.colorBorder};
    border-radius: ${token.borderRadiusLG}px;
    background: ${token.colorBgContainer};
  `,
  locked: css`
    opacity: 0.5;
    filter: grayscale(1);
  `,
  icon: css`
    font-size: 40px;
    line-height: 1;
  `,
}));

export interface AchievementBadgeProps {
  /** Emoji or node for the achievement. */
  icon: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** When false, the badge is greyed out and shows a lock. Default true. */
  unlocked?: boolean;
}

/** Achievement/badge tile in the illustration style; greyed + locked when unlocked=false. */
export function AchievementBadge({
  icon,
  title,
  description,
  unlocked = true,
}: AchievementBadgeProps) {
  const { styles, cx } = useStyles();
  return (
    <div className={cx(styles.tile, !unlocked && styles.locked)}>
      <div className={styles.icon}>{unlocked ? icon : '🔒'}</div>
      <Text strong style={{ lineHeight: 1.2 }}>
        {title}
      </Text>
      {description && (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {description}
        </Text>
      )}
    </div>
  );
}
