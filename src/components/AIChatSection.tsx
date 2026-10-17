import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Globe,
  Trash2,
  Copy,
  Check,
  Cpu,
  Layers,
  Search,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface AIChatSectionProps {
  onNotify?: (message: string, isError?: boolean) => void;
}

export const AIChatSection: React.FC<AIChatSectionProps> = ({ onNotify }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content:
        "Welcome to the **SWID-SHRK Research Lab AI Assistant**! I am grounded in the research group's work directed by **Pouria Hejazi Rekavandi**, including multiaxial fatigue & fracture mechanics, neural biomechanics (brain injury simulations), energy-absorbing metamaterials, and Abaqus CAE modeling.\n\nHow can I assist your investigation today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.8-flash',
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'gemini-3.8-flash' | 'gemini-3.1-flash-lite'>(
    'gemini-3.8-flash'
  );
  const [useSearch, setUseSearch] = useState(true);
  const [persona, setPersona] = useState<'research_specialist' | 'literature_scout' | 'fea_tutor'>(
    'research_specialist'
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isInitialMount = useRef(true);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    // Avoid scrolling on initial page load so the user starts at the top of the site
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    scrollToBottom();
  }, [messages, isLoading]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'reset',
        role: 'model',
        content: 'Conversation thread refreshed. What research challenge would you like to explore?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: selectedModel,
      },
    ]);
    if (onNotify) onNotify('Conversation history cleared.');
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Send conversation history to backend proxy
      const apiPayload = {
        messages: newMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        model: selectedModel,
        useSearch: useSearch,
        persona: persona,
      };

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPayload),
      });

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error(
            'The Gemini AI backend endpoint (/api/chat) is not available on static hosting (such as GitHub Pages). ' +
            'GitHub Pages only serves static files. To enable live AI reasoning and search grounding, run locally with `npm run dev` or deploy the backend to Cloud Run, Vercel, or Render.'
          );
        }
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}: Failed to reach Gemini API`);
      }

      const data = await res.json();

      const modelMessage: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        content: data.text || 'No response returned.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: data.sources || [],
        modelUsed: data.modelUsed || selectedModel,
      };

      setMessages((prev) => [...prev, modelMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const isStaticNotice = err.message && err.message.includes('GitHub Pages');
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        content: isStaticNotice
          ? `ℹ️ **Static Hosting Environment Notice**\n\n${err.message}\n\n*All research modules, publications, thesis registry, gear inventory, and Abaqus tutorials are fully interactive on GitHub Pages!*`
          : `**Error communicating with Gemini:**\n${err.message || 'Please check server logs or connectivity.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: !isStaticNotice,
      };
      setMessages((prev) => [...prev, errorMessage]);
      if (onNotify) onNotify(isStaticNotice ? 'Static hosting notice: AI backend requires Node server.' : `Error: ${err.message}`, !isStaticNotice);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const samplePrompts = [
    {
      label: 'LCE & PINN Design',
      prompt: 'Explain the Liquid Crystal Elastomer (LCE) and PINN neural inverse design initiative at SWID-SHRK.',
    },
    {
      label: 'Cracked Cylinders',
      prompt: 'How are stress intensity factors calculated for functionally graded cylinders with multiple longitudinal cracks?',
    },
    {
      label: 'Bouligand Composites (Search)',
      prompt: 'What are the latest 2026 developments in bio-inspired helicoidal Bouligand composites for impact absorption?',
    },
    {
      label: 'Abaqus FEA Modeling',
      prompt: 'What are recommended guidelines for modeling viscoelastic brain parenchyma deformation in Abaqus explicit solvers?',
    },
  ];

  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b dark:border-zinc-800 border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-wider dark:bg-[#00ff41]/10 dark:text-[#00ff41] bg-emerald-50 text-emerald-700 dark:border dark:border-[#00ff41]/30 border border-emerald-300 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Gemini Multimodal Reasoning &amp; Grounding
          </div>
          <h2 className="text-2xl sm:text-3xl font-section-title font-bold dark:text-white text-slate-900 tracking-wide uppercase flex items-center">
            <span className="dark:text-[#00ff41] text-emerald-600 font-mono mr-2 select-none">//</span>
            <span>SWID-SHRK AI Research Assistant</span>
          </h2>
          <p className="text-xs sm:text-sm font-mono dark:text-zinc-400 text-slate-600 mt-1">
            Real-time mechanical &amp; aerospace intelligence, Abaqus FEA guidance, and search-grounded citation queries.
          </p>
        </div>

        {/* Clear & Settings Actions */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleClearChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-300 bg-slate-100 hover:bg-slate-200 text-slate-700 border dark:border-zinc-700 border-slate-300 transition-colors cursor-pointer"
            title="Reset conversation"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Thread
          </button>
        </div>
      </div>

      {/* Control Bar: Model, Persona, and Search Grounding */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4 p-3 rounded-lg dark:bg-zinc-900/60 bg-slate-100/90 border dark:border-zinc-800 border-slate-300 text-xs font-mono">
        {/* Model Selector */}
        <div className="flex flex-col gap-1">
          <label className="dark:text-zinc-400 text-slate-600 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1">
            <Cpu className="w-3 h-3 text-[#00b8ff]" />
            Gemini Model
          </label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as any)}
            className="px-2.5 py-1.5 rounded dark:bg-black dark:text-white bg-white text-slate-800 border dark:border-zinc-700 border-slate-300 focus:outline-none focus:border-[#00b8ff] cursor-pointer"
          >
            <option value="gemini-3.8-flash">gemini-3.8-flash (General &amp; Research Specialist)</option>
            <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (High-Speed Reasoning)</option>
          </select>
        </div>

        {/* Persona Selector */}
        <div className="flex flex-col gap-1">
          <label className="dark:text-zinc-400 text-slate-600 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1">
            <Layers className="w-3 h-3 text-[#00ff41]" />
            Assistant Role
          </label>
          <select
            value={persona}
            onChange={(e) => setPersona(e.target.value as any)}
            className="px-2.5 py-1.5 rounded dark:bg-black dark:text-white bg-white text-slate-800 border dark:border-zinc-700 border-slate-300 focus:outline-none focus:border-[#00ff41] cursor-pointer"
          >
            <option value="research_specialist">🔬 Lab &amp; Research Specialist</option>
            <option value="literature_scout">🌐 Literature &amp; Citation Scout</option>
            <option value="fea_tutor">💻 Abaqus CAE &amp; FEA Tutor</option>
          </select>
        </div>

        {/* Google Search Grounding Toggle */}
        <div className="flex flex-col justify-end">
          <button
            type="button"
            onClick={() => setUseSearch(!useSearch)}
            className={`flex items-center justify-between px-3 py-2 rounded border transition-all cursor-pointer ${
              useSearch
                ? 'dark:bg-[#00b8ff]/15 dark:border-[#00b8ff] dark:text-[#00b8ff] bg-sky-100 border-sky-400 text-sky-800 font-bold'
                : 'dark:bg-black/50 dark:border-zinc-700 dark:text-zinc-400 bg-white border-slate-300 text-slate-500'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              Google Search Grounding
            </span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                useSearch ? 'bg-sky-500 text-white' : 'bg-slate-300 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300'
              }`}
            >
              {useSearch ? 'Active' : 'Off'}
            </span>
          </button>
        </div>
      </div>

      {/* Suggested Starter Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-2 scrollbar-thin">
        <span className="text-[11px] font-mono dark:text-zinc-400 text-slate-500 flex items-center gap-1 flex-none">
          <HelpCircle className="w-3 h-3 text-[#00ff41]" />
          Topics:
        </span>
        {samplePrompts.map((s, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(s.prompt)}
            disabled={isLoading}
            className="flex-none px-2.5 py-1 rounded text-xs font-mono dark:bg-zinc-900/80 dark:hover:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition-all cursor-pointer hover:border-sky-500 dark:hover:border-[#00ff41]"
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Chat Thread */}
      <div className="flex flex-col h-[520px] rounded-xl dark:bg-[#080c10] bg-white border dark:border-zinc-800 border-slate-200 shadow-sm overflow-hidden">
        {/* Scrollable Message List */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`flex gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full border dark:border-[#00ff41] border-emerald-500 flex-none flex items-center justify-center dark:bg-black bg-emerald-50 text-emerald-600 dark:text-[#00ff41] shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-lg p-3 sm:p-4 text-xs sm:text-sm font-mono leading-relaxed transition-all shadow-sm ${
                    isUser
                      ? 'dark:bg-[#00ff41]/10 bg-sky-50 text-slate-900 dark:text-zinc-100 border dark:border-[#00ff41]/40 border-sky-300'
                      : m.isError
                      ? 'dark:bg-red-950/40 bg-red-50 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-900'
                      : 'dark:bg-zinc-900/90 bg-slate-50 text-slate-800 dark:text-zinc-200 border dark:border-zinc-800 border-slate-200'
                  }`}
                >
                  {/* Sender & Timestamp Header */}
                  <div className="flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b dark:border-white/5 border-slate-200 text-[10px] dark:text-zinc-400 text-slate-500">
                    <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
                      {isUser ? (
                        <>
                          <User className="w-3 h-3 text-sky-600 dark:text-[#00ff41]" />
                          You
                        </>
                      ) : (
                        <>
                          <Bot className="w-3 h-3 text-[#00b8ff]" />
                          SWID-SHRK Assistant
                          {m.modelUsed && (
                            <span className="px-1 py-0.2 rounded text-[9px] dark:bg-black/60 bg-white border dark:border-zinc-700 border-slate-200">
                              {m.modelUsed}
                            </span>
                          )}
                        </>
                      )}
                    </span>
                    <div className="flex items-center gap-2">
                      <span>{m.timestamp}</span>
                      <button
                        onClick={() => handleCopy(m.id, m.content)}
                        className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                        title="Copy message"
                      >
                        {copiedId === m.id ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Message Body with Markdown formatting support */}
                  <div className="whitespace-pre-wrap break-words">{m.content}</div>

                  {/* Grounding Citations */}
                  {m.sources && m.sources.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t dark:border-white/10 border-slate-200">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold dark:text-[#00b8ff] text-sky-700 uppercase tracking-wider mb-1.5">
                        <Globe className="w-3 h-3" />
                        Verified Google Search Sources:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {m.sources.map((src, sIdx) => (
                          <a
                            key={sIdx}
                            href={src.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] dark:bg-black/70 bg-white dark:hover:bg-[#00b8ff]/20 hover:bg-sky-100 text-sky-700 dark:text-sky-300 border dark:border-sky-500/30 border-sky-300 transition-colors"
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                            <span className="truncate max-w-[200px]">{src.title}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full border dark:border-[#00b8ff] border-sky-500 flex-none flex items-center justify-center dark:bg-black bg-sky-50 text-sky-600 dark:text-[#00b8ff] shadow-sm">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 items-center text-xs font-mono dark:text-[#00ff41] text-emerald-600 animate-pulse">
              <div className="w-8 h-8 rounded-full border border-dashed dark:border-[#00ff41] border-emerald-500 flex items-center justify-center animate-spin">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold">
                  {useSearch
                    ? 'Retrieving research data & grounding with Google Search...'
                    : 'Reasoning with Gemini...'}
                </span>
                <span className="text-[10px] dark:text-zinc-400 text-slate-500">
                  Model: {selectedModel} | Persona: {persona}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t dark:border-zinc-800 border-slate-200 dark:bg-black/80 bg-slate-50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-end gap-2"
          >
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about fracture mechanics, brain trauma FEA, Bouligand composites, or thesis supervision..."
                rows={2}
                disabled={isLoading}
                className="w-full px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-mono dark:bg-zinc-900 bg-white dark:text-white text-slate-900 border dark:border-zinc-700 border-slate-300 focus:outline-none dark:focus:border-[#00ff41] focus:border-sky-500 transition-colors resize-none placeholder:text-slate-400 dark:placeholder:text-zinc-600"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="flex items-center justify-center h-[52px] px-5 rounded-lg dark:bg-[#00ff41] dark:hover:bg-[#00ff41]/90 dark:text-black bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer dark:hover:shadow-[0_0_15px_rgba(0,255,65,0.5)] shadow-sm"
              title="Send message (Enter)"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="flex items-center justify-between text-[10px] font-mono dark:text-zinc-500 text-slate-500 mt-2 px-1">
            <span>Press Enter to send, Shift+Enter for newline</span>
            <span>Server-side @google/genai proxy</span>
          </div>
        </div>
      </div>
    </section>
  );
};
