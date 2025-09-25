import Head from 'next/head';
import dynamic from 'next/dynamic';

const ClientLayout = dynamic(
  () => import('@/src/components/layout/ClientLayout').then(m => m.ClientLayout),
  { ssr: false }
);

export default function ConsolidatedPage() {
  return (
    <>
      <Head>
        <title>Consolidated Data | Enterprise System</title>
        <meta name="description" content="Enterprise System - Consolidated Data View" />
      </Head>
      <ClientLayout>
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Consolidated Data View</h1>
          <p>Consolidated data and reports will be displayed here.</p>
        </div>
      </ClientLayout>
    </>
  );
}