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
      <div className="rounded-xl border border-qs-border bg-qs-surface p-6 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ background: 'linear-gradient(135deg, var(--qs-primary) 0%, var(--qs-secondary) 100%)' }} />
        <div className="flex items-center gap-3 mb-2 relative z-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-qs-primary">
            <Wand2 size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-qs-text">AI Quotation Generator</h2>
            <p className="text-sm text-qs-text-sec">Paste a client conversation and let AI build the entire quotation for you.</p>
          </div>
        </div>
      </div>

      {/* Conversation Input */}
      <section className="rounded-xl border border-qs-border bg-qs-surface p-6 shadow-sm">
        <label className="text-xs font-bold uppercase tracking-wider text-qs-text-sec mb-3 block">Client Conversation</label>
        <p className="text-xs text-qs-text-muted mb-3">
          Paste any conversation — WhatsApp, email, Slack message, meeting notes. The AI will extract client name, services, prices, quantities, and delivery time.
        </p>
        <textarea
          value={aiConversation}
          onChange={(e) => { setAiConversation(e.target.value); setAiSuccess(null); }}
          rows={14}
          className="w-full rounded-lg border border-qs-border bg-qs-bg text-qs-text placeholder:text-qs-text-muted px-4 py-3 text-sm focus:border-qs-primary focus:outline-none focus:ring-2 focus:ring-qs-primary/20 resize-y font-mono leading-relaxed"
          placeholder={`Paste your client conversation here...\n\nExample:\nHi, I'm Sarah from Bloom Bakery. We need a new website.\n- 6 pages total (Home, About, Menu, Gallery, Blog, Contact)\n- We have 24 blog posts ready\n- Need it done in 3 weeks\n- Budget is around $800 for the main site, $5 per blog post\nCan you help?`}
        />

        {/* Success Banner */}
        <AnimatePresence>
          {aiSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-3 flex items-center gap-3 rounded-lg bg-qs-success/10 border border-qs-success/20 px-4 py-3 text-sm text-qs-success"
            >
              <span className="text-lg">✓</span>
              <span>
                <strong>{aiSuccess.itemCount} line items</strong> extracted for <strong>{aiSuccess.clientName}</strong>. Switching to Edit tab…
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-qs-text-muted">Tip: The more detail in the conversation, the better the quotation.</p>
          <button
            onClick={handleExtractQuotation}
            disabled={!aiConversation.trim() || aiExtracting}
            className="flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, var(--qs-primary) 0%, var(--qs-secondary) 100%)' }}
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
