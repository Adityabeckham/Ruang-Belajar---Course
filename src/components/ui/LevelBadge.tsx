import { createStyles } from 'antd-style';

const useStyles = createStyles(({ css, token }) => ({
  badge: css`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: ${token.lineWidth}px solid ${token.colorBorder};
    box-shadow: 3px 3px 0 ${token.colorBorder};
    background: ${token.colorPrimary};
    color: #fff;
    font-weight: 700;
    border-radius: 50%;
    flex: none;
  `,
}));

export interface LevelBadgeProps {
  level: number;
  /** Diameter in px. Default 48. */
  size?: number;
}

/** Circular level chip in the illustration style (bordered + hard shadow). */
export function LevelBadge({ level, size = 48 }: LevelBadgeProps) {
  const { styles } = useStyles();
  return (
    <span
      className={styles.badge}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
    >
      {level}
    </span>
  );
}
