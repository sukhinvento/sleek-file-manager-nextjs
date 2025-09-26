import { PurchaseOrders } from '@/pages/PurchaseOrders';
import Head from 'next/head';
import dynamic from 'next/dynamic';

const ClientLayout = dynamic(
  () => import('@/components/layout/ClientLayout').then(m => m.ClientLayout),
  { ssr: false }
);

export default function PurchaseOrdersPage() {
  return (
    <>
      <Head>
        <title>Purchase Orders | Enterprise System</title>
        <meta name="description" content="Enterprise System - Purchase Orders Management" />
      </Head>
      <ClientLayout>
        <PurchaseOrders />
      </ClientLayout>
    </>
  );
}