import type { ReactNode } from 'react';
import { Flex, Typography } from 'antd';

const { Title, Text } = Typography;

export interface EmptyStateProps {
  /** Emoji or node shown above the title. */
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Optional call-to-action (e.g. a button). */
  action?: ReactNode;
}

/** Centered empty placeholder with icon, message, and optional action. */
export function EmptyState({ icon = '🗂️', title, description, action }: EmptyStateProps) {
  return (
    <Flex
      vertical
      align="center"
      gap={12}
      style={{ padding: '48px 16px', textAlign: 'center' }}
    >
      <div style={{ fontSize: 48, lineHeight: 1 }}>{icon}</div>
      <Title level={4} style={{ margin: 0 }}>
        {title}
      </Title>
      {description && <Text type="secondary">{description}</Text>}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </Flex>
  );
}
