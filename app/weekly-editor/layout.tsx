import { privateToolMetadata } from '@/lib/private-tool-metadata';

export const metadata = privateToolMetadata;

export default function WeeklyEditorLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
