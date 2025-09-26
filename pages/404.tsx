
import Link from 'next/link';
import { Button } from '@/src/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <h1 className="text-5xl font-bold text-enterprise-900 mb-4">404</h1>
      <p className="text-xl text-enterprise-600 mb-8">Page not found</p>
      <p className="text-enterprise-500 max-w-md mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link href="/dashboard" passHref>
        <Button>Return to Dashboard</Button>
      </Link>
    </div>
  );
}
