import { Billing } from '@/pages/Billing';
import Head from 'next/head';
import dynamic from 'next/dynamic';

const ClientLayout = dynamic(
  () => import('@/components/layout/ClientLayout').then(m => m.ClientLayout),
  { ssr: false }
);

export default function BillingPage() {
  return (
    <>
      <Head>
        <title>Billing | Enterprise System</title>
        <meta name="description" content="Enterprise System - Billing Management" />
      </Head>
      <ClientLayout>
        <Billing />
      </ClientLayout>
    </>
  );
}