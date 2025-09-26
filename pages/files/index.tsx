import Head from 'next/head';
import dynamic from 'next/dynamic';
import { ViewFiles } from '@/pages/ViewFiles';

const ClientLayout = dynamic(
  () => import('@/components/layout/ClientLayout').then(m => m.ClientLayout),
  { ssr: false }
);

export default function FilesPage() {
  return (
    <>
      <Head>
        <title>Files | Enterprise File Manager</title>
        <meta name="description" content="Browse and manage files in the Enterprise File Manager" />
      </Head>
      <ClientLayout>
        <ViewFiles />
      </ClientLayout>
    </>
  );
}