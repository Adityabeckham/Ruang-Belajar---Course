import { Flex, Spin, Typography } from 'antd';

const { Text } = Typography;

export interface LoadingProps {
  tip?: string;
  /** Min height of the centered container in px. Default 200. */
  minHeight?: number;
  size?: 'small' | 'default' | 'large';
}

/** Centered loading spinner with an optional caption. */
export function Loading({ tip, minHeight = 200, size = 'large' }: LoadingProps) {
  return (
    <Flex align="center" justify="center" vertical gap={12} style={{ minHeight }}>
      <Spin size={size} />
      {tip && <Text type="secondary">{tip}</Text>}
    </Flex>
  );
}
