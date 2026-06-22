import type { ReactNode } from 'react';
import { Card } from 'antd';

export interface SectionProps {
  title?: ReactNode;
  /** Right-aligned content in the card header. */
  extra?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** A titled card section. Inherits the illustration theme's bordered/shadowed card. */
export function Section({ title, extra, children, className }: SectionProps) {
  return (
    <Card title={title} extra={extra} className={className} style={{ marginBottom: 24 }}>
      {children}
    </Card>
  );
}
