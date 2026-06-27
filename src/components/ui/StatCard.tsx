import type { ReactNode } from 'react';
import { Card, Flex, Typography } from 'antd';

const { Text } = Typography;

export interface StatCardProps {
  label: ReactNode;
  value: ReactNode;
  /** Emoji or node shown beside the value. */
  icon?: ReactNode;
  /** Small text after the value (e.g. "/ 8", "hari"). */
  suffix?: ReactNode;
}

/** Compact metric card: label, big value, optional icon and suffix. */
export function StatCard({ label, value, icon, suffix }: StatCardProps) {
  return (
    <Card style={{ flex: 1, minWidth: 160 }}>
      <Flex align="center" gap={16}>
        {icon && <div style={{ fontSize: 32, lineHeight: 1 }}>{icon}</div>}
        <Flex vertical>
          <Text type="secondary" style={{ fontSize: 13 }}>
            {label}
          </Text>
          <Flex align="baseline" gap={4}>
            <span style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.1 }}>{value}</span>
            {suffix && <Text type="secondary">{suffix}</Text>}
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
}
