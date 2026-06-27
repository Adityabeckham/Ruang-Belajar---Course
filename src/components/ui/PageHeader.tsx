import type { ReactNode } from 'react';
import { Flex, Typography, Button } from 'antd';

const { Title, Text } = Typography;

export interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Actions rendered on the right (e.g. buttons). */
  extra?: ReactNode;
  onBack?: () => void;
}

/** Page title block: title + optional subtitle, back button, and right-aligned actions. */
export function PageHeader({ title, subtitle, extra, onBack }: PageHeaderProps) {
  return (
    <Flex
      align="flex-start"
      justify="space-between"
      gap={16}
      wrap
      style={{ marginBottom: 24 }}
    >
      <Flex align="center" gap={12}>
        {onBack && (
          <Button onClick={onBack} aria-label="Kembali">
            ←
          </Button>
        )}
        <div>
          <Title level={2} style={{ margin: 0 }}>
            {title}
          </Title>
          {subtitle && <Text type="secondary">{subtitle}</Text>}
        </div>
      </Flex>
      {extra && <div>{extra}</div>}
    </Flex>
  );
}
