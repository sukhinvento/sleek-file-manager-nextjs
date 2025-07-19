import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock login - replace with actual authentication logic
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (email === "admin@example.com" && password === "password") {
        toast.success("Login successful!");
        navigate("/dashboard");
      } else {
        toast.error("Invalid credentials. Try admin@example.com / password");
        setIsLoading(false);
      }
    } catch (error) {
      toast.error("An error occurred during login.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-full md:w-1/2 bg-gradient-to-br from-indigo-900 via-indigo-800 to-[#556B2F] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 w-full h-full overflow-hidden opacity-20">
          <svg className="absolute top-10 left-10" width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="60" r="60" fill="white" />
          </svg>
          <svg className="absolute bottom-40 left-20" width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="90" cy="90" r="90" fill="white" />
          </svg>
          <svg className="absolute -bottom-20 right-20" width="220" height="220" viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="110" cy="110" r="110" fill="white" />
          </svg>
          
          <svg className="absolute top-1/4 right-10" width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="80" height="80" rx="8" fill="white" />
          </svg>
          <svg className="absolute bottom-20 left-40" width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="140" height="140" rx="24" fill="white" />
          </svg>
          
          <svg className="absolute top-1/3 left-1/3" width="100" height="86" viewBox="0 0 100 86" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polygon points="50,0 100,86 0,86" fill="white" />
          </svg>
          <svg className="absolute top-20 right-40" width="60" height="52" viewBox="0 0 60 52" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polygon points="30,0 60,52 0,52" fill="white" />
          </svg>
          
          <svg className="absolute bottom-10 right-10" width="120" height="104" viewBox="0 0 120 104" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polygon points="30,0 90,0 120,52 90,104 30,104 0,52" fill="white" />
          </svg>
          
          <div className="absolute top-0 left-0 grid grid-cols-6 gap-4 opacity-30">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={`dot-tl-${i}`} className="w-2 h-2 rounded-full bg-white"></div>
            ))}
          </div>
          
          <div className="absolute bottom-10 right-10 grid grid-cols-8 gap-3 opacity-30">
            {Array.from({ length: 32 }).map((_, i) => (
              <div key={`dot-br-${i}`} className="w-1.5 h-1.5 rounded-full bg-white"></div>
            ))}
          </div>
        </div>
        
        <div className="px-12 w-full max-w-lg relative z-10">
          <h1 className="text-5xl font-bold text-white mb-4">Enterprise Portal</h1>
          <p className="text-xl text-gray-300">
            Streamline your workflow with our powerful file management system
          </p>
        </div>
      </div>
      
      <div className="hidden md:flex md:w-1/2 items-center justify-center bg-white p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
            <p className="mt-2 text-gray-600">Please sign in to continue</p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-slate-600 focus:ring-slate-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-slate-600 hover:text-slate-500">
                  Forgot your password?
                </a>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="mt-4 text-center text-sm">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <a href="#" className="font-medium text-slate-600 hover:text-slate-500">
                  Sign up
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
