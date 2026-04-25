import { Zap, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OutOfCreditsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function OutOfCreditsModal({ open, onClose }: OutOfCreditsModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', duration: 0.35 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-8 shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>

            {/* Icon */}
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100">
              <Zap size={32} className="text-amber-500" />
            </div>

            <h2 className="text-center text-2xl font-bold text-gray-900 mb-2">Out of Credits</h2>
            <p className="text-center text-sm text-gray-500 mb-6">
              You've used all your AI credits. Purchase more to continue using AI features.
            </p>

            {/* Credit packages preview */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { credits: 100, price: '$4.99', popular: false },
                { credits: 300, price: '$9.99', popular: true },
                { credits: 1000, price: '$24.99', popular: false },
              ].map(({ credits, price, popular }) => (
                <div
                  key={credits}
                  className={`relative rounded-xl border p-3 text-center ${popular ? 'border-purple-300 bg-purple-50' : 'border-gray-200 bg-gray-50'}`}
                >
                  {popular && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-purple-600 px-2 py-0.5 text-[10px] font-bold text-white whitespace-nowrap">
                      Best value
                    </span>
                  )}
                  <div className="text-lg font-bold text-gray-900">{credits}</div>
                  <div className="text-[10px] text-gray-500 mb-1">credits</div>
                  <div className="text-sm font-semibold text-purple-600">{price}</div>
                </div>
              ))}
            </div>

            <button
              disabled
              className="w-full rounded-xl bg-purple-600 py-3 text-sm font-semibold text-white opacity-60 cursor-not-allowed"
            >
              Buy Credits — Coming Soon
            </button>

            <p className="mt-3 text-center text-xs text-gray-400">
              Payment system launching soon. Check back shortly.
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
