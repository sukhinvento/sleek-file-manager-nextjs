
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (email && password) {
        // Show success toast
        toast({
          title: "Success",
          description: "Welcome back!",
        });

        // Clear form fields
        setEmail('');
        setPassword('');
        setIsLoading(false);

        // Navigate to dashboard
        navigate('/dashboard');
      }
    } catch (error) {
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred during login. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Section */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute inset-0" 
               style={{
                 background: "linear-gradient(60deg, #000080 0%, #1a365d 50%, #2c5282 100%)",
                 opacity: 0.95
               }}
          />
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#000080]/10 -translate-x-1/3 -translate-y-1/3 backdrop-blur-lg transform rotate-45" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#1a365d]/10 translate-x-1/4 translate-y-1/4 backdrop-blur-lg transform -rotate-12" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-[#2c5282]/20 -translate-x-1/2 -translate-y-1/2 backdrop-blur-sm transform rotate-45" 
               style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
          <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-[#000080]/10 backdrop-blur-md transform rotate-12"
               style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }} />
        </div>
        
        {/* Content */}
        <div className="relative z-10 text-left px-12 space-y-4">
          <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg">
            Enterprise Portal
          </h1>
          <p className="text-lg text-gray-100 max-w-md leading-relaxed drop-shadow">
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
                disabled={isLoading}
              />
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
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
