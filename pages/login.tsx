
import { Login } from "@/src/pages/Login";
import Head from 'next/head';

export default function LoginPage() {
  return (
    <>
      <Head>
        <title>Login | Enterprise File Manager</title>
        <meta name="description" content="Enterprise File Manager - Login" />
      </Head>
      <Login />
    </>
  );
}
