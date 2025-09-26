import { Inventory } from '@/pages/Inventory';
import Head from 'next/head';
import dynamic from 'next/dynamic';

const ClientLayout = dynamic(
  () => import('@/components/layout/ClientLayout').then(m => m.ClientLayout),
  { ssr: false }
);

export default function InventoryPage() {
  return (
    <>
      <Head>
        <title>Inventory | Enterprise System</title>
        <meta name="description" content="Enterprise System - Inventory Management" />
      </Head>
      <ClientLayout>
        <Inventory />
      </ClientLayout>
    </>
  );
}