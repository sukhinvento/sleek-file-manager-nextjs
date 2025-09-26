import { VendorManagement } from '@/pages/VendorManagement';
import Head from 'next/head';
import dynamic from 'next/dynamic';

const ClientLayout = dynamic(
  () => import('@/components/layout/ClientLayout').then(m => m.ClientLayout),
  { ssr: false }
);

export default function VendorsPage() {
  return (
    <>
      <Head>
        <title>Vendor Management | Enterprise System</title>
        <meta name="description" content="Enterprise System - Vendor Management" />
      </Head>
      <ClientLayout>
        <VendorManagement />
      </ClientLayout>
    </>
  );
}