import type { ReactNode, CSSProperties } from 'react';
import { createStyles } from 'antd-style';

const useStyles = createStyles(({ css, token }) => ({
  root: css`
    min-height: 100vh;
    background: ${token.colorBgBase};
    padding: ${token.paddingLG}px;
  `,
}));

export interface PageContainerProps {
  children: ReactNode;
  /** Max content width in px. Default 1080. */
  maxWidth?: number;
  className?: string;
  style?: CSSProperties;
}

/** Full-page wrapper: themed background, centered content with a max width. */
export function PageContainer({
  children,
  maxWidth = 1080,
  className,
  style,
}: PageContainerProps) {
  const { styles, cx } = useStyles();
  return (
    <div className={cx(styles.root, className)} style={style}>
      <div style={{ maxWidth, margin: '0 auto' }}>{children}</div>
    </div>
  );
}
