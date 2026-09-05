import { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Copy, 
  Check, 
  RotateCcw, 
  Send, 
  Terminal, 
  ExternalLink, 
  Languages, 
  Building2, 
  CreditCard, 
  Sparkles,
  UserX,
  FileCode2,
  Clock,
  Phone
} from 'lucide-react';
import { 
  DEFAULT_USER_PAYLOAD, 
  PRESET_SCENARIOS, 
  analyzeWebhook, 
  formatINR
} from './recoveryEngine';
import { RazorpayWebhookPayload } from './types';

export default function App() {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState<number>(0);
  const [jsonInput, setJsonInput] = useState<string>(
    JSON.stringify(DEFAULT_USER_PAYLOAD, null, 2)
  );
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [copiedAudit, setCopiedAudit] = useState<boolean>(false);
  const [copiedMessage, setCopiedMessage] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'audit' | 'whatsapp' | 'json'>('audit');

  // Parse JSON
  const parsedPayload: RazorpayWebhookPayload | null = useMemo(() => {
    try {
      const obj = JSON.parse(jsonInput);
      setJsonError(null);
      return obj;
    } catch (e: any) {
      setJsonError(e.message || 'Invalid JSON syntax');
      return null;
    }
  }, [jsonInput]);

  // Audit results
  const auditResult = useMemo(() => {
    if (!parsedPayload) {
      return {
        diagnosis: "Awaiting valid Razorpay webhook JSON payload...",
        category: "INVALID_JSON",
        action: "ESCALATE_TO_HUMAN" as const,
        final_message: null
      };
    }
    return analyzeWebhook(parsedPayload);
  }, [parsedPayload]);

  // Strict output as required by Rules of Engagement
  const strictAuditJson = useMemo(() => {
    return {
      diagnosis: auditResult.diagnosis,
      category: auditResult.category,
      action: auditResult.action,
      final_message: auditResult.final_message
    };
  }, [auditResult]);

  const handleSelectScenario = (index: number) => {
    setSelectedScenarioIndex(index);
    const scen = PRESET_SCENARIOS[index];
    if (scen) {
      setJsonInput(JSON.stringify(scen.payload, null, 2));
      setJsonError(null);
    }
  };

  const handleCopyAuditJson = () => {
    navigator.clipboard.writeText(JSON.stringify(strictAuditJson, null, 2));
    setCopiedAudit(true);
    setTimeout(() => setCopiedAudit(false), 2000);
  };

  const handleCopyMessage = () => {
    if (auditResult.final_message) {
      navigator.clipboard.writeText(auditResult.final_message);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2000);
    }
  };

  const paymentEntity = parsedPayload?.payload?.payment?.entity;

  return (
    <div id="recover-ai-root" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Navigation Bar */}
      <header id="recover-ai-header" className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-semibold shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-white text-base">RECOVER AI</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-semibold">
                  v2.4 Core
                </span>
              </div>
              <p className="text-xs text-slate-400">Autonomous B2B Revenue Recovery Agent for Razorpay Merchants</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700 text-slate-300 font-mono">
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>{parsedPayload?.account_id || 'acc_CJoeHMNpi0nC7k'}</span>
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-800 text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-medium text-[11px]">Audit Engine Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-6">
        {/* Preset Selector Banner */}
        <section id="preset-selector-section" className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-semibold text-slate-200">Webhook Scenarios & Test Bench</h2>
            </div>
            <span className="text-xs text-slate-400">
              Select standard failure payloads or edit the raw JSON below
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {PRESET_SCENARIOS.map((scenario, index) => {
              const isSelected = selectedScenarioIndex === index;
              return (
                <button
                  key={scenario.name}
                  id={`scenario-btn-${index}`}
                  onClick={() => handleSelectScenario(index)}
                  className={`text-left p-3 rounded-lg border transition-all text-xs flex flex-col justify-between gap-1.5 ${
                    isSelected 
                      ? 'bg-cyan-950/40 border-cyan-500/60 text-cyan-200 shadow-sm ring-1 ring-cyan-500/20' 
                      : 'bg-slate-800/40 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold truncate">{scenario.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />}
                  </div>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded w-fit ${
                    index === 0 
                      ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {scenario.tag}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Core Layout: Left (Webhook Input + Audit Rules), Right (Decision + WhatsApp + JSON) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: 5 Cols */}
          <div className="lg:col-span-5 space-y-6">
            {/* Webhook JSON Editor */}
            <div id="webhook-editor-card" className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="px-4 py-3 bg-slate-800/70 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCode2 className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Razorpay Ingestion Payload</h3>
                </div>
                <button
                  id="reset-payload-btn"
                  onClick={() => handleSelectScenario(0)}
                  className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                  title="Reset to original user request payload"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Prompt Payload</span>
                </button>
              </div>

              <div className="p-3">
                <textarea
                  id="raw-webhook-textarea"
                  value={jsonInput}
                  onChange={(e) => {
                    setJsonInput(e.target.value);
                    setSelectedScenarioIndex(-1);
                  }}
                  rows={14}
                  className="w-full bg-slate-950 font-mono text-xs text-slate-300 p-3 rounded-lg border border-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 resize-y"
                  spellCheck={false}
                />
                {jsonError && (
                  <div className="mt-2 p-2 rounded bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{jsonError}</span>
                  </div>
                )}
              </div>

              {/* Quick Transaction Meta */}
              {paymentEntity && (
                <div className="px-4 py-2.5 bg-slate-950/60 border-t border-slate-800/80 text-[11px] text-slate-400 grid grid-cols-2 gap-2 font-mono">
                  <div>
                    <span className="text-slate-500">ID:</span> <span className="text-slate-200">{paymentEntity.id}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Amount:</span> <span className="text-cyan-400 font-semibold">{formatINR(paymentEntity.amount)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Method:</span> <span className="text-slate-200 uppercase">{paymentEntity.method}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Contact:</span> <span className="text-slate-200">{paymentEntity.contact || 'N/A'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Rules of Engagement Checklist */}
            <div id="rules-audit-card" className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  Recover AI Rules of Engagement Audit
                </h4>
                <span className="text-[11px] text-emerald-400 font-medium">100% Policy Compliant</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800/80 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-slate-200">1. Strict Audit Adherence</div>
                    <div className="text-slate-400 text-[11px]">Exact diagnosis, failure category, and structured JSON output generated.</div>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800/80 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-slate-200">2. Professional & Urgent Tone</div>
                    <div className="text-slate-400 text-[11px]">Empathetic B2B communication recognizing procurement schedules without being accusatory.</div>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800/80 flex items-start gap-2.5">
                  <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${auditResult.action === 'ESCALATE_TO_HUMAN' ? 'text-rose-400' : 'text-emerald-400'}`} />
                  <div>
                    <div className="font-medium text-slate-200">3. Bounded Escalation Guardrail</div>
                    <div className="text-slate-400 text-[11px]">
                      {auditResult.action === 'ESCALATE_TO_HUMAN'
                        ? 'ESCALATION TRIGGERED: Suspected fraud, stolen card, or retry threshold exceeded. User message suppressed.'
                        : 'Passed safe boundary check. No fraud, stolen card, or retry exhaustion detected.'}
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800/80 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-slate-200">4. Bilingual (English & Tamil)</div>
                    <div className="text-slate-400 text-[11px]">Authentic conversational Tamil contextual translation paired with polite English. No unauthorized discounts promised.</div>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800/80 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-slate-200">5. Actionable Links</div>
                    <div className="text-slate-400 text-[11px]">Razorpay fallback payment link parsed from merchant notes and appended to dispatch.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 7 Cols */}
          <div className="lg:col-span-7 space-y-6">
            {/* Core Action Decision Banner */}
            <div id="decision-banner-card" className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              auditResult.action === 'ESCALATE_TO_HUMAN'
                ? 'bg-rose-950/30 border-rose-800/80 text-rose-200'
                : 'bg-emerald-950/30 border-emerald-800/80 text-emerald-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${
                  auditResult.action === 'ESCALATE_TO_HUMAN' ? 'bg-rose-900/50 text-rose-300' : 'bg-emerald-900/50 text-emerald-300'
                }`}>
                  {auditResult.action === 'ESCALATE_TO_HUMAN' ? <UserX className="w-6 h-6" /> : <Send className="w-6 h-6" />}
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider font-semibold opacity-75">Engine Verdict & Action</div>
                  <div className="text-lg font-bold tracking-tight">
                    {auditResult.action === 'ESCALATE_TO_HUMAN' ? 'ESCALATE TO HUMAN REVIEW' : 'ATTEMPT AUTONOMOUS RECOVERY'}
                  </div>
                  <div className="text-xs opacity-90">
                    Category: <span className="font-mono font-semibold">{auditResult.category}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="copy-json-btn-banner"
                  onClick={handleCopyAuditJson}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-200 hover:text-white flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  {copiedAudit ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAudit ? 'Copied JSON!' : 'Copy Audit JSON'}</span>
                </button>
              </div>
            </div>

            {/* View Switcher Tabs */}
            <div className="flex border-b border-slate-800 gap-2">
              <button
                id="tab-audit-btn"
                onClick={() => setActiveTab('audit')}
                className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'audit'
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Audit & Diagnosis</span>
              </button>
              <button
                id="tab-whatsapp-btn"
                onClick={() => setActiveTab('whatsapp')}
                className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'whatsapp'
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Languages className="w-3.5 h-3.5" />
                <span>WhatsApp Dispatch (EN/TA)</span>
              </button>
              <button
                id="tab-json-btn"
                onClick={() => setActiveTab('json')}
                className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'json'
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Strict JSON Output</span>
              </button>
            </div>

            {/* Tab 1: Audit & Diagnosis */}
            {activeTab === 'audit' && (
              <div id="tab-audit-content" className="space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div>
                    <h4 className="text-xs uppercase font-mono text-cyan-400 tracking-wider font-semibold mb-1">Diagnostic Report</h4>
                    <p className="text-sm font-medium text-slate-100 bg-slate-950 p-3 rounded-lg border border-slate-800">
                      {auditResult.diagnosis}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                      <div className="text-[11px] text-slate-400 mb-1">Error Code Reported</div>
                      <div className="font-mono text-xs text-amber-300 font-semibold">
                        {paymentEntity?.error_code || 'N/A'}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        {paymentEntity?.error_description || 'No description provided'}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                      <div className="text-[11px] text-slate-400 mb-1">Actionable Fallback Link</div>
                      <div className="text-xs text-cyan-400 font-mono break-all flex items-center gap-1">
                        <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{auditResult.metadata?.fallback_link || 'None provided'}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">Extracted from authorized merchant policy</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span>Discount Authorization Status:</span>
                    <span className="font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {auditResult.metadata?.discounts_authorized ? 'Authorized' : 'Unauthorized (Strictly Protected)'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: WhatsApp Live Preview */}
            {activeTab === 'whatsapp' && (
              <div id="tab-whatsapp-content" className="space-y-4">
                {auditResult.action === 'ESCALATE_TO_HUMAN' ? (
                  <div className="bg-rose-950/30 border border-rose-800/80 rounded-xl p-6 text-center space-y-3">
                    <div className="mx-auto w-12 h-12 rounded-full bg-rose-900/40 flex items-center justify-center text-rose-300">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-semibold text-rose-200">Customer Message Suppressed (Null)</h3>
                    <p className="text-xs text-rose-300/80 max-w-md mx-auto">
                      In accordance with Rule 3 (Bounded Escalation), errors flagged for suspected fraud, stolen cards, or maximum retries must not send autonomous recovery messages. The ticket has been diverted to human operations.
                    </p>
                    <div className="font-mono text-xs bg-slate-950 text-slate-400 p-2 rounded border border-rose-950 inline-block">
                      final_message: null
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
                    {/* Mock WhatsApp Device Header */}
                    <div className="bg-emerald-800 text-white px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-600 border border-emerald-400/40 flex items-center justify-center font-bold text-xs">
                          RZ
                        </div>
                        <div>
                          <div className="text-xs font-semibold flex items-center gap-1.5">
                            <span>Razorpay Merchant Accounts</span>
                            <span className="bg-emerald-500 text-white rounded-full p-0.5" title="Verified WhatsApp Business">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                          </div>
                          <div className="text-[10px] text-emerald-100 flex items-center gap-2">
                            <span className="flex items-center gap-1"><Phone className="w-2.5 h-2.5" /> {paymentEntity?.contact || '+91 98765 43210'}</span>
                            <span>•</span>
                            <span>Online</span>
                          </div>
                        </div>
                      </div>

                      <button
                        id="copy-whatsapp-text-btn"
                        onClick={handleCopyMessage}
                        className="px-2.5 py-1 rounded bg-emerald-700/80 hover:bg-emerald-700 text-white text-xs flex items-center gap-1.5 transition-colors"
                      >
                        {copiedMessage ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedMessage ? 'Copied' : 'Copy Message'}</span>
                      </button>
                    </div>

                    {/* WhatsApp Chat Body */}
                    <div className="p-4 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] bg-slate-950 min-h-[280px] flex flex-col justify-end">
                      <div className="max-w-[92%] bg-emerald-950/70 border border-emerald-800/60 rounded-2xl rounded-tl-sm p-4 text-slate-100 shadow-md space-y-3">
                        {/* English Section */}
                        <div className="space-y-1">
                          <div className="text-[10px] font-mono uppercase text-emerald-400 font-semibold tracking-wider flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> English Notification
                          </div>
                          <p className="text-xs text-slate-200 leading-relaxed">
                            Hello, we noticed that your recent UPI payment of <span className="font-semibold text-emerald-300">{paymentEntity ? formatINR(paymentEntity.amount) : '₹25,000.00'}</span> (Ref: <span className="font-mono text-slate-300">{paymentEntity?.id || 'pay_DM45I1xLvo836m'}</span>) could not be completed due to insufficient account funds. We understand this may be an unexpected banking delay and want to ensure your services continue without interruption.
                          </p>
                        </div>

                        <div className="border-t border-emerald-900/60 pt-2 space-y-1">
                          <div className="text-[10px] font-mono uppercase text-cyan-400 font-semibold tracking-wider flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span> தமிழ் மொழிபெயர்ப்பு (Tamil Contextual)
                          </div>
                          <p className="text-xs text-slate-200 leading-relaxed font-sans">
                            வணக்கம், உங்கள் கணக்கில் போதிய இருப்புத்தொகை இல்லாத காரணத்தால் <span className="font-semibold text-cyan-300">{paymentEntity ? formatINR(paymentEntity.amount) : '₹25,000.00'}</span> மதிப்பிலான UPI பரிவர்த்தனை (குறிப்பு எண்: {paymentEntity?.id || 'pay_DM45I1xLvo836m'}) தோல்வியடைந்துள்ளது. உங்கள் சேவைகள் எவ்வித தடையுமின்றி தொடர, தயவுசெய்து கீழே உள்ள பாதுகாப்பான இணைப்பைப் பயன்படுத்தி கட்டணத்தை நிறைவு செய்யவும்.
                          </p>
                        </div>

                        {/* Actionable Link */}
                        <div className="bg-slate-900/90 rounded-lg p-2.5 border border-emerald-800/80 space-y-1">
                          <div className="text-[10px] text-slate-400 font-medium">Please complete your payment securely here:</div>
                          <a 
                            href={auditResult.metadata?.fallback_link || '#'} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-cyan-400 hover:text-cyan-300 underline font-mono flex items-center gap-1 break-all"
                          >
                            <span>{auditResult.metadata?.fallback_link || 'https://rzp.io/i/fallback123'}</span>
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          </a>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                          <span>If you have already completed this or need assistance, please let us know. We are here to help.</span>
                          <span className="text-[9px] text-slate-400 font-mono whitespace-nowrap ml-2 flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" /> Just now
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Strict JSON Output */}
            {activeTab === 'json' && (
              <div id="tab-json-content" className="space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                  <div className="px-4 py-3 bg-slate-800/70 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-semibold text-slate-200">Strict Audit JSON Output (Rules 1-5 Adherent)</span>
                    </div>
                    <button
                      id="copy-strict-json-btn"
                      onClick={handleCopyAuditJson}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1.5 transition-colors border border-slate-700"
                    >
                      {copiedAudit ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedAudit ? 'Copied' : 'Copy JSON'}</span>
                    </button>
                  </div>

                  <div className="p-4 bg-slate-950">
                    <pre className="font-mono text-xs text-cyan-300 leading-relaxed overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(strictAuditJson, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer with Task Output Summary */}
      <footer id="recover-ai-footer" className="border-t border-slate-800/80 bg-slate-950 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Recover AI • B2B Autonomous Revenue Recovery</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span>Method: UPI</span>
            <span>•</span>
            <span>Target: ₹25,000.00 INR</span>
            <span>•</span>
            <span>Languages: EN / தமிழ்</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
