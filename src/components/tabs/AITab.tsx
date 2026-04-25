import { Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CREDIT_COSTS } from '../../hooks/useCredits';

interface AITabProps {
  aiConversation: string;
  setAiConversation: (v: string) => void;
  aiExtracting: boolean;
  aiSuccess: { itemCount: number; clientName: string } | null;
  setAiSuccess: (v: { itemCount: number; clientName: string } | null) => void;
  handleExtractQuotation: () => void;
}

export default function AITab({
  aiConversation, setAiConversation, aiExtracting, aiSuccess, setAiSuccess, handleExtractQuotation,
}: AITabProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid gap-6">

      {/* Header */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/40 dark:to-gray-800 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600">
            <Wand2 size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">AI Quotation Generator</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Paste a client conversation and let AI build the entire quotation for you.</p>
          </div>
        </div>
      </div>

      {/* Conversation Input */}
      <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 block">Client Conversation</label>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
          Paste any conversation — WhatsApp, email, Slack message, meeting notes. The AI will extract client name, services, prices, quantities, and delivery time.
        </p>
        <textarea
          value={aiConversation}
          onChange={(e) => { setAiConversation(e.target.value); setAiSuccess(null); }}
          rows={14}
          className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 px-4 py-3 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 dark:focus:ring-purple-900 resize-y font-mono leading-relaxed"
          placeholder={`Paste your client conversation here...\n\nExample:\nHi, I'm Sarah from Bloom Bakery. We need a new website.\n- 6 pages total (Home, About, Menu, Gallery, Blog, Contact)\n- We have 24 blog posts ready\n- Need it done in 3 weeks\n- Budget is around $800 for the main site, $5 per blog post\nCan you help?`}
        />

        {/* Success Banner */}
        <AnimatePresence>
          {aiSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-3 flex items-center gap-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 px-4 py-3 text-sm text-green-700 dark:text-green-400"
            >
              <span className="text-lg">✓</span>
              <span>
                <strong>{aiSuccess.itemCount} line items</strong> extracted for <strong>{aiSuccess.clientName}</strong>. Switching to Edit tab…
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-gray-400 dark:text-gray-500">Tip: The more detail in the conversation, the better the quotation.</p>
          <button
            onClick={handleExtractQuotation}
            disabled={!aiConversation.trim() || aiExtracting}
            className="flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: aiExtracting ? '#7c3aed' : 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
          >
            {aiExtracting
              ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Analysing conversation…</>
              : <><Wand2 size={16} />Generate Quotation<span className="ml-1.5 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-bold">{CREDIT_COSTS.FULL_QUOTATION} credits</span></>
            }
          </button>
        </div>
      </section>

    </motion.div>
  );
}
