import type { ReactNode } from 'react';
import { Flex } from 'antd';

export interface ToolbarProps {
  children: ReactNode;
  justify?: 'flex-start' | 'flex-end' | 'space-between' | 'center';
  align?: 'flex-start' | 'center' | 'flex-end';
  gap?: number;
  wrap?: boolean;
}

/** A horizontal row for actions/controls with consistent spacing. */
export function Toolbar({
  children,
  justify = 'flex-start',
  align = 'center',
  gap = 12,
  wrap = true,
}: ToolbarProps) {
  return (
    <Flex justify={justify} align={align} gap={gap} wrap={wrap}>
      {children}
    </Flex>
  );
}
