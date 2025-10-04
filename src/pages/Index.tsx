import { Link } from 'react-router-dom';
import { ArrowRight, Activity, Package, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import medSystemLogo from '@/assets/medsystem-logo.svg';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="flex justify-center mb-8 animate-fade-in">
          <img src={medSystemLogo} alt="MedSystem Logo" className="h-32 w-32" />
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent animate-fade-in">
          Welcome to MedSystem
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto animate-fade-in">
          Your comprehensive healthcare management platform for inventory, patients, billing, and diagnostics.
        </p>
        <div className="flex gap-4 justify-center animate-fade-in">
          <Link to="/dashboard">
            <Button size="lg" className="gap-2">
              Go to Dashboard
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="outline">
              Login
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow animate-fade-in border-none bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Patient Management</h3>
              <p className="text-sm text-muted-foreground">
                Comprehensive patient records and history tracking
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow animate-fade-in border-none bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Inventory Control</h3>
              <p className="text-sm text-muted-foreground">
                Real-time stock tracking and automated reordering
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow animate-fade-in border-none bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Diagnostics</h3>
              <p className="text-sm text-muted-foreground">
                Advanced diagnostic tools and test management
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow animate-fade-in border-none bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Comprehensive insights and trend analysis
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-muted-foreground">
        <p>© 2025 MedSystem. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
