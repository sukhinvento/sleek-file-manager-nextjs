import Head from 'next/head';
import dynamic from 'next/dynamic';
import { UploadFiles } from '@/pages/UploadFiles';

const ClientLayout = dynamic(
  () => import('@/components/layout/ClientLayout').then(m => m.ClientLayout),
  { ssr: false }
);

export default function UploadPage() {
  return (
    <>
      <Head>
        <title>Upload Files | Enterprise File Manager</title>
        <meta name="description" content="Upload files to the Enterprise File Manager" />
      </Head>
      <ClientLayout>
        <UploadFiles />
      </ClientLayout>
    </>
  );
}