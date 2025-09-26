import { StockTransfer } from '@/pages/StockTransfer';
import Head from 'next/head';
import dynamic from 'next/dynamic';

const ClientLayout = dynamic(
  () => import('@/components/layout/ClientLayout').then(m => m.ClientLayout),
  { ssr: false }
);

export default function StockTransferPage() {
  return (
    <>
      <Head>
        <title>Stock Transfer | Enterprise System</title>
        <meta name="description" content="Enterprise System - Stock Transfer Management" />
      </Head>
      <ClientLayout>
        <StockTransfer />
      </ClientLayout>
    </>
  );
}