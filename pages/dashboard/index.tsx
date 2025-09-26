
import { Dashboard } from "@/src/pages/Dashboard";
import { AppLayout } from "@/src/components/layout/AppLayout";
import Head from 'next/head';

export default function DashboardPage() {
  return (
    <>
      <Head>
        <title>Dashboard | Enterprise File Manager</title>
        <meta name="description" content="Enterprise File Manager - Dashboard" />
      </Head>
      <AppLayout>
        <Dashboard />
      </AppLayout>
    </>
  );
}
