import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, AlertCircle, RefreshCw, ChefHat } from 'lucide-react';
import { Card } from '@/components/Card';
import { TopoBg } from '@/components/TopoBg';
import { generateBattles } from '@/utils/ai';
import type { FoodBattle } from '@/types';

// Skeleton card for loading state
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-neutral-100">
        <div className="h-4 w-20 bg-neutral-200 rounded animate-pulse mb-3" />
        <div className="h-6 w-3/4 bg-neutral-200 rounded animate-pulse mb-2" />
        <div className="h-4 w-full bg-neutral-200 rounded animate-pulse" />
      </div>
      <div className="px-6 py-4 bg-neutral-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-200 animate-pulse" />
            <div>
              <div className="h-3 w-12 bg-neutral-200 rounded animate-pulse mb-1" />
              <div className="h-4 w-20 bg-neutral-200 rounded animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="h-3 w-12 bg-neutral-200 rounded animate-pulse mb-1" />
              <div className="h-4 w-20 bg-neutral-200 rounded animate-pulse" />
            </div>
            <div className="w-10 h-10 rounded-xl bg-neutral-200 animate-pulse" />
          </div>
        </div>
      </div>
      <div className="px-6 py-5 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-neutral-200 animate-pulse flex-shrink-0" />
            <div className="flex-1">
              <div className="h-3 w-12 bg-neutral-200 rounded animate-pulse mb-2" />
              <div className="h-4 w-full bg-neutral-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
      <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 space-y-3">
        <div className="h-3 w-24 bg-neutral-200 rounded animate-pulse" />
        <div className="h-12 w-full bg-neutral-200 rounded animate-pulse" />
      </div>
    </div>
  );
}

// Error card component
function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center max-w-md mx-auto"
    >
      <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-8 h-8 text-rose-500" />
      </div>
      <h3 className="text-lg font-semibold text-rose-900 mb-2">Generation Failed</h3>
      <p className="text-sm text-rose-700 mb-6">{message}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium rounded-xl transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Try Again
      </button>
    </motion.div>
  );
}

function App() {
  const [battles, setBattles] = useState<FoodBattle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGenerate = async () => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    setHasGenerated(true);

    try {
      const generatedBattles = await generateBattles();
      setBattles(generatedBattles);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
      setError(errorMessage);
      setBattles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    handleGenerate();
  };

  return (
    <div className="min-h-screen relative">
      <TopoBg />
      
      {/* Main Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="pt-12 pb-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-neutral-200 shadow-sm mb-6"
            >
              <ChefHat className="w-4 h-4 text-neutral-600" />
              <span className="text-sm font-medium text-neutral-600">AI-Powered Content Creator</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 tracking-tight mb-4"
            >
              Taizn{' '}
              <span className="relative">
                <span className="relative z-10">Viral Shorts</span>
                <span className="absolute bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-emerald-200 to-emerald-300 -skew-x-6 -z-0" />
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="text-lg text-neutral-500 max-w-2xl mx-auto"
            >
              Generate epic food battle scripts for viral short-form videos. 
              Healthy heroes vs junk food villains with cinematic dialogue.
            </motion.p>
          </div>
        </header>

        {/* Generate Button */}
        <section className="px-4 sm:px-6 lg:px-8 pb-12">
          <div className="max-w-5xl mx-auto text-center">
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              onClick={handleGenerate}
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className={`
                relative inline-flex items-center gap-3 px-8 py-4 
                text-lg font-semibold rounded-2xl
                transition-all duration-200
                ${loading 
                  ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed' 
                  : 'bg-neutral-900 text-white hover:bg-neutral-800 hover:shadow-xl hover:shadow-neutral-900/20'
                }
              `}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin" />
                  <span>Generating Battles...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>{hasGenerated ? 'Generate New Battles' : 'Generate Battles'}</span>
                  <Zap className="w-5 h-5" />
                </>
              )}
            </motion.button>
            
            {loading && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 text-sm text-neutral-500"
              >
                Crafting epic food battles with AI...
              </motion.p>
            )}
          </div>
        </section>

        {/* Results Grid */}
        <section className="px-4 sm:px-6 lg:px-8 pb-16">
          <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
              {error ? (
                <ErrorCard key="error" message={error} onRetry={handleRetry} />
              ) : loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </motion.div>
              ) : battles.length > 0 ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {battles.map((battle, index) => (
                    <Card
                      key={index}
                      battle={battle}
                      index={index}
                      isVisible={!loading}
                    />
                  ))}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-4 sm:px-6 lg:px-8 py-8 border-t border-neutral-200">
          <div className="max-w-5xl mx-auto text-center">
            <p className="text-sm text-neutral-400">
              Powered by AI • Create viral food content in seconds
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
