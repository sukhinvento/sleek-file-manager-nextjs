import Head from 'next/head';
import dynamic from 'next/dynamic';
import { Login } from '@/pages/Login';

const ClientLayout = dynamic(
  () => import('@/components/layout/ClientLayout').then(m => m.ClientLayout),
  { ssr: false }
);

export default function LoginPage() {
  return (
    <>
      <Head>
        <title>Login | Enterprise System</title>
        <meta name="description" content="Enterprise System - Login" />
      </Head>
      <ClientLayout>
        <Login />
      </ClientLayout>
    </>
  );
}