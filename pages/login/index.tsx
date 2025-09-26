import { Login } from '@/pages/Login';
import Head from 'next/head';

export default function LoginPage() {
  return (
    <>
      <Head>
        <title>Login | Enterprise System</title>
        <meta name="description" content="Enterprise System - Login" />
      </Head>
      <Login />
    </>
  );
}