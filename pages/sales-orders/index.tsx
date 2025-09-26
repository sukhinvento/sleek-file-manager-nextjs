import { SalesOrders } from '@/pages/SalesOrders';
import Head from 'next/head';
import dynamic from 'next/dynamic';

const ClientLayout = dynamic(
  () => import('@/components/layout/ClientLayout').then(m => m.ClientLayout),
  { ssr: false }
);

export default function SalesOrdersPage() {
  return (
    <>
      <Head>
        <title>Sales Orders | Enterprise System</title>
        <meta name="description" content="Enterprise System - Sales Orders Management" />
      </Head>
      <ClientLayout>
        <SalesOrders />
      </ClientLayout>
    </>
  );
}