import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      debugger;
      // Actual API call to backend
      const response = await axios.post<{
        access_token: string;
        token_type: string;
        expires_in: number;
        user: {
          userId: string;
          username: string;
          roles: string[];
        };
      }>(`${API_BASE_URL}/auth/login`, {
        username,
        password
      });

      // Store the auth token
      if (response.data.access_token) {
        localStorage.setItem('auth_token', response.data.access_token);
        localStorage.setItem('user_data', JSON.stringify(response.data.user));
        
        toast.success("Login successful!");
        console.log('Logged in user:', response.data.user);
        
        // Navigate to dashboard
        navigate("/inventory-dashboard");
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.response?.status === 401) {
        toast.error("Invalid username or password");
      } else if (error.response?.status === 400) {
        toast.error("Please provide valid credentials");
      } else if (!error.response) {
        toast.error("Cannot connect to server. Please check if backend is running at " + API_BASE_URL);
      } else {
        toast.error(error.response?.data?.message || "An error occurred during login");
      }
      
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <div className="hidden md:flex w-full md:w-1/2 items-center justify-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(220 52% 48%), hsl(222 55% 22%))' }}>
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
      
      <div className="flex w-full md:w-1/2 items-center justify-center bg-white p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
            <p className="mt-2 text-gray-600">Please sign in to continue</p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username / Email
                </label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="mt-1"
                  autoComplete="username"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary/50 border-border rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-primary hover:text-primary/80">
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
                <a href="#" className="font-medium text-primary hover:text-primary/80">
                  Contact Administrator
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
