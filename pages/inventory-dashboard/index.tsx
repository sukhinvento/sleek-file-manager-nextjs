import Head from 'next/head';
import { InventoryDashboard } from '@/pages/InventoryDashboard';
import dynamic from 'next/dynamic';

const ClientLayout = dynamic(
  () => import('@/components/layout/ClientLayout').then(m => m.ClientLayout),
  { ssr: false }
);

export default function InventoryDashboardPage() {
  return (
    <>
      <Head>
        <title>Inventory Dashboard | Enterprise System</title>
        <meta name="description" content="Enterprise System - Inventory Management Dashboard" />
      </Head>
      <ClientLayout>
        <InventoryDashboard />
      </ClientLayout>
    </>
  );
}