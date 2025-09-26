import Head from 'next/head';
import dynamic from 'next/dynamic';
import { EditFiles } from '@/pages/EditFiles';

const ClientLayout = dynamic(
  () => import('@/components/layout/ClientLayout').then(m => m.ClientLayout),
  { ssr: false }
);

export default function EditPage() {
  return (
    <>
      <Head>
        <title>Edit Files | Enterprise File Manager</title>
        <meta name="description" content="Edit your files in the Enterprise File Manager" />
      </Head>
      <ClientLayout>
        <EditFiles />
      </ClientLayout>
    </>
  );
}