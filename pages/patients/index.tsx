import { Patients } from '@/src/pages/Patients';
import Head from 'next/head';
import dynamic from 'next/dynamic';

const ClientLayout = dynamic(
  () => import('@/src/components/layout/ClientLayout').then(m => m.ClientLayout),
  { ssr: false }
);

export default function PatientsPage() {
  return (
    <>
      <Head>
        <title>Patients | Enterprise System</title>
        <meta name="description" content="Enterprise System - Patient Management" />
      </Head>
      <ClientLayout>
        <Patients />
      </ClientLayout>
    </>
  );
}