import Head from 'next/head';
import dynamic from 'next/dynamic';
import { Settings } from '@/pages/Settings';

const ClientLayout = dynamic(
  () => import('@/components/layout/ClientLayout').then(m => m.ClientLayout),
  { ssr: false }
);

export default function SettingsPage() {
  return (
    <>
      <Head>
        <title>Settings | Enterprise System</title>
        <meta name="description" content="Manage application settings for the Enterprise System" />
      </Head>
      <ClientLayout>
        <Settings />
      </ClientLayout>
    </>
  );
}