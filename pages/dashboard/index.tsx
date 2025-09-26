import Head from 'next/head';
import dynamic from 'next/dynamic';
import { Dashboard } from '@/pages/Dashboard';

const ClientLayout = dynamic(
  () => import('@/components/layout/ClientLayout').then(m => m.ClientLayout),
  { ssr: false }
);

export default function DashboardPage() {
  return (
    <>
      <Head>
        <title>Dashboard | Enterprise File Manager</title>
        <meta name="description" content="Enterprise File Manager - Dashboard" />
      </Head>
      <ClientLayout>
        <Dashboard />
      </ClientLayout>
    </>
  );
}