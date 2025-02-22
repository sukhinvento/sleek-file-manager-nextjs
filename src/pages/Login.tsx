
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if email is from admin domain
  useEffect(() => {
    setIsAdmin(email.endsWith('@admin.com'));
  }, [email]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      // Store the user type in sessionStorage
      sessionStorage.setItem('userType', isAdmin ? 'admin' : 'user');
      
      toast({
        title: "Success",
        description: `Welcome back, ${isAdmin ? 'Admin' : 'User'}!`,
      });
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Section */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center">
        <div className="absolute inset-0" 
             style={{
               background: "linear-gradient(102.3deg, rgba(147,39,143,1) 5.9%, rgba(234,172,232,1) 64%, rgba(246,219,245,1) 89%)",
               opacity: 0.9
             }}
        />
        <div className="relative z-10 text-center p-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Enterprise Portal
          </h1>
          <p className="text-xl text-white/90 max-w-md">
            Streamline your workflow with our powerful file management system
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-enterprise-900">
              Welcome Back
            </h2>
            <p className="mt-2 text-enterprise-500">
              Please sign in to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-enterprise-700" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-enterprise-300 rounded-md text-enterprise-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
              {email && (
                <p className="mt-1 text-sm text-enterprise-500">
                  Logging in as {isAdmin ? 'Administrator' : 'Standard User'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-enterprise-700" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-enterprise-300 rounded-md text-enterprise-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
            >
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
