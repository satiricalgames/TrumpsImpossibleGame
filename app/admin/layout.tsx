import { privateToolMetadata } from '@/lib/private-tool-metadata';

export const metadata = privateToolMetadata;

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
