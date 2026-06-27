import type { ReactNode } from 'react';
import { Result } from 'antd';

export interface ErrorStateProps {
  title?: ReactNode;
  description?: ReactNode;
  /** Optional action (e.g. a retry/back button). */
  action?: ReactNode;
  status?: 'error' | 'warning' | '404' | '403' | '500';
}

/** Full error/result placeholder built on antd Result. */
export function ErrorState({
  title = 'Terjadi kesalahan',
  description,
  action,
  status = 'error',
}: ErrorStateProps) {
  return <Result status={status} title={title} subTitle={description} extra={action} />;
}
