// Single import source for the Ruang Belajar design system.
// Composite components are defined here; primitives are re-exported from antd
// (already themed by the illustration ConfigProvider) so all UI comes from one place.

// ---- Composite components (this kit) ----
export { PageContainer } from './PageContainer';
export type { PageContainerProps } from './PageContainer';
export { PageHeader } from './PageHeader';
export type { PageHeaderProps } from './PageHeader';
export { Section } from './Section';
export type { SectionProps } from './Section';
export { Toolbar } from './Toolbar';
export type { ToolbarProps } from './Toolbar';

export { EmptyState } from './EmptyState';
export type { EmptyStateProps } from './EmptyState';
export { Loading } from './Loading';
export type { LoadingProps } from './Loading';
export { StatCard } from './StatCard';
export type { StatCardProps } from './StatCard';
export { ErrorState } from './ErrorState';
export type { ErrorStateProps } from './ErrorState';

export { XPBar } from './XPBar';
export type { XPBarProps } from './XPBar';
export { LevelBadge } from './LevelBadge';
export type { LevelBadgeProps } from './LevelBadge';
export { AchievementBadge } from './AchievementBadge';
export type { AchievementBadgeProps } from './AchievementBadge';

// ---- Themed antd primitives (single import source) ----
export {
  Button,
  Input,
  InputNumber,
  Select,
  Checkbox,
  Radio,
  Switch,
  Form,
  Card,
  Modal,
  Drawer,
  Tag,
  Tooltip,
  Dropdown,
  Menu,
  Avatar,
  Typography,
  Space,
  Flex,
  Divider,
  Progress,
  Alert,
  Spin,
  Skeleton,
  Result,
  Badge,
  Table,
  Tabs,
  message,
  notification,
} from 'antd';
