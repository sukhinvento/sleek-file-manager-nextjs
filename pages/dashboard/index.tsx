import Head from 'next/head';
import { AppLayout } from '@/components/layout/AppLayout';
import { Dashboard } from '@/pages/Dashboard';

export default function DashboardPage() {
  return (
    <>
      <Head>
        <title>Dashboard | Enterprise File Manager</title>
        <meta name="description" content="Enterprise File Manager - Dashboard" />
      </Head>
      <AppLayout>
        <Dashboard />
      </AppLayout>
    </>
  );
}