import { privateToolMetadata } from '@/lib/private-tool-metadata';

export const metadata = privateToolMetadata;

export default function JokesEditorLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
