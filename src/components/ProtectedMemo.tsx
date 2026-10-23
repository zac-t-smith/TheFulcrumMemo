import { useState, useEffect } from 'react';
import { Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface ProtectedMemoProps {
  children: React.ReactNode;
  memoTitle: string;
}

const PASSCODE = 'rx2025';
const STORAGE_KEY = 'fulcrum_memo_access';

const ProtectedMemo = ({ children, memoTitle }: ProtectedMemoProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has already authenticated in this session
    const hasAccess = sessionStorage.getItem(STORAGE_KEY);
    if (hasAccess === 'true') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (passcode.toLowerCase() === PASSCODE.toLowerCase()) {
      sessionStorage.setItem(STORAGE_KEY, 'true');
      setIsAuthenticated(true);
    } else {
      setError('Incorrect passcode. Please try again.');
      setPasscode('');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground text-sm">
          Loading...
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-6 pt-24 pb-12 max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="surface-elevated border border-border p-8 md:p-12 text-center"
        >
          {/* Lock Icon */}
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock size={28} className="text-primary" />
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Protected Content
          </h1>
          <p className="text-muted-foreground text-sm mb-6">
            "{memoTitle}" is a private memo. Enter the passcode to continue.
          </p>

          {/* Passcode Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter passcode"
                className="w-full px-4 py-3 bg-background border border-border rounded text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                autoFocus
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-2 text-red-400 text-xs"
              >
                <AlertCircle size={14} />
                <span>{error}</span>
              </motion.div>
            )}

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground text-sm uppercase tracking-wider glow-subtle hover:bg-gold-glow transition-all duration-300 group"
            >
              <span>Access Memo</span>
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          {/* Hint */}
          <p className="text-muted-foreground/60 text-xs mt-6">
            Contact{' '}
            <a href="mailto:zac.ty.smith@gmail.com" className="text-primary hover:text-gold-glow transition-colors">
              zac.ty.smith@gmail.com
            </a>
            {' '}to request access.
          </p>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default ProtectedMemo;
