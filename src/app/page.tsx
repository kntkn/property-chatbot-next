'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

type UserIntent = 'investment' | 'residence' | 'minpaku' | null;

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userIntent, setUserIntent] = useState<UserIntent>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: messageText.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setShowWelcome(false);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          userIntent: userIntent
        }),
      });

      const data = await response.json();

      if (data.error) {
        setMessages([...newMessages, { role: 'assistant', content: data.error }]);
      } else {
        setMessages([...newMessages, { role: 'assistant', content: data.message }]);
      }
    } catch {
      setMessages([
        ...newMessages,
        { role: 'assistant', content: 'エラーが発生しました。もう一度お試しください。' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage(input);
  };

  const handleIntentSelect = (intent: UserIntent) => {
    setUserIntent(intent);
    const intentMessages: Record<string, string> = {
      investment: '投資用物件を探しています。利回りの良い物件を教えてください。',
      residence: '自分で住む物件を探しています。リノベーション可能な物件はありますか？',
      minpaku: '民泊・旅館業を始めたいです。収益が見込める物件を教えてください。',
    };
    if (intent) {
      sendMessage(intentMessages[intent]);
    }
  };

  const quickActions = [
    { label: '全物件を見る', query: '現在販売中の全物件を一覧で教えてください。' },
    { label: '1000万円以下', query: '1000万円以下で購入できる物件はありますか？' },
    { label: '高利回り物件', query: '利回り10%以上が期待できる投資物件を教えてください。' },
    { label: '民泊向き', query: 'AirDNAデータを踏まえて、民泊に最適な物件を教えてください。' },
  ];

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* ヘッダー */}
      <header className="flex-shrink-0 px-4 py-4 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">空き家コンシェルジュ</h1>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <p className="text-xs text-slate-500">24時間対応・AIアドバイザー</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => window.open('https://example.com/contact', '_blank')}
            className="px-4 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
          >
            人間に相談
          </button>
        </div>
      </header>

      {/* メインエリア */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {/* ウェルカム画面 */}
          {showWelcome && messages.length === 0 && (
            <div className="animate-fade-in">
              {/* ヒーローセクション */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full mb-4">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  無料・登録不要でご相談いただけます
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                  空き家投資、何でもご相談ください
                </h2>
                <p className="text-slate-500 text-sm max-w-md mx-auto">
                  物件探しから投資シミュレーション、民泊運営のアドバイスまで。
                  AIが24時間、あなたの疑問にお答えします。
                </p>
              </div>

              {/* 目的選択カード */}
              <div className="mb-8">
                <p className="text-sm font-medium text-slate-700 mb-3 text-center">まずは、ご検討の目的をお聞かせください</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => handleIntentSelect('investment')}
                    className="group p-4 bg-white border-2 border-slate-200 rounded-xl hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10 transition-all text-left"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-500 transition-colors">
                      <svg className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-1">投資目的</h3>
                    <p className="text-xs text-slate-500">利回り重視で資産運用したい</p>
                  </button>

                  <button
                    onClick={() => handleIntentSelect('residence')}
                    className="group p-4 bg-white border-2 border-slate-200 rounded-xl hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10 transition-all text-left"
                  >
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-orange-500 transition-colors">
                      <svg className="w-5 h-5 text-orange-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-1">自分で住む</h3>
                    <p className="text-xs text-slate-500">リノベして理想の暮らしを</p>
                  </button>

                  <button
                    onClick={() => handleIntentSelect('minpaku')}
                    className="group p-4 bg-white border-2 border-slate-200 rounded-xl hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10 transition-all text-left"
                  >
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-purple-500 transition-colors">
                      <svg className="w-5 h-5 text-purple-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-1">民泊・旅館業</h3>
                    <p className="text-xs text-slate-500">宿泊ビジネスを始めたい</p>
                  </button>
                </div>
              </div>

              {/* クイックアクション */}
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-medium text-slate-500 mb-3">よくあるご質問</p>
                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => sendMessage(action.query)}
                      className="px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-full hover:border-emerald-400 hover:text-emerald-600 transition-colors"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 信頼性バッジ */}
              <div className="mt-8 flex items-center justify-center gap-6 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>安心のサポート体制</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>24時間即時回答</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>データに基づく提案</span>
                </div>
              </div>
            </div>
          )}

          {/* チャット履歴 */}
          {messages.length > 0 && (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`animate-fade-in ${message.role === 'user' ? 'flex justify-end' : ''}`}
                >
                  {message.role === 'user' ? (
                    <div className="max-w-[85%] px-4 py-3 bg-emerald-500 text-white rounded-2xl rounded-br-md shadow-lg shadow-emerald-500/20">
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                      </div>
                      <div className="max-w-[85%]">
                        <div className="px-4 py-3 bg-white border border-slate-200 rounded-2xl rounded-tl-md shadow-sm">
                          <p className="text-sm whitespace-pre-wrap leading-relaxed text-slate-700">{message.content}</p>
                        </div>
                        {/* アクションボタン（アシスタント回答の下に表示） */}
                        <div className="flex gap-2 mt-2 ml-1">
                          <button
                            onClick={() => sendMessage('もっと詳しく教えてください')}
                            className="text-xs text-slate-400 hover:text-emerald-600 transition-colors"
                          >
                            詳しく聞く
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            onClick={() => sendMessage('他の物件も見せてください')}
                            className="text-xs text-slate-400 hover:text-emerald-600 transition-colors"
                          >
                            他の物件
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            onClick={() => window.open('https://example.com/contact', '_blank')}
                            className="text-xs text-slate-400 hover:text-emerald-600 transition-colors"
                          >
                            担当者に相談
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 animate-fade-in">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <div className="px-4 py-3 bg-white border border-slate-200 rounded-2xl rounded-tl-md shadow-sm">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full typing-dot"></span>
                      <span className="w-2 h-2 bg-emerald-400 rounded-full typing-dot"></span>
                      <span className="w-2 h-2 bg-emerald-400 rounded-full typing-dot"></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      {/* 入力エリア */}
      <footer className="flex-shrink-0 border-t border-slate-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 py-4">
          {/* クイックアクション（チャット中も表示） */}
          {messages.length > 0 && (
            <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => sendMessage(action.query)}
                  className="flex-shrink-0 px-3 py-1 text-xs bg-slate-100 text-slate-600 rounded-full hover:bg-emerald-100 hover:text-emerald-700 transition-colors"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="物件について何でもお聞きください..."
              rows={1}
              className="w-full px-4 py-3 pr-12 bg-slate-50 border border-slate-200 rounded-xl resize-none focus:bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all text-sm"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 bottom-2 p-2 rounded-lg bg-emerald-500 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-slate-400">
              Shift + Enter で改行
            </p>
            <p className="text-xs text-slate-400">
              Powered by AI
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
