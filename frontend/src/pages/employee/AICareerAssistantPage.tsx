import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bot,
  Send,
  Sparkles,
  User,
  ArrowRight,
} from 'lucide-react';
import { ChatMessage } from '../../types';
import { useNavigate } from 'react-router-dom';

export const AICareerAssistantPage: React.FC = () => {
  const { currentUser } = useApp();
  const navigate = useNavigate();

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'assistant',
      text: `Hello ${currentUser.name}! I am your Eagle Vision AI Career Assistant powered by Gemini 2.5 Flash and internal skills ontology graphs. How can I help with your internal mobility, skill diagnostics, or project recommendations today?`,
      timestamp: 'Just now',
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const samplePrompts = [
    'What skills am I missing for my target role?',
    'Why am I matched with the Lead AI Application Engineer role?',
    'Which course should I take next to improve my MLOps capability?',
    'Recommend a 20% gig matching my Python and vector search skills.',
  ];

  const handleSend = (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      let replyText = '';
      let actions: any[] = [];

      const lower = textToSend.toLowerCase();

      if (lower.includes('missing') || lower.includes('gap') || lower.includes('target')) {
        replyText = `Based on your target milestone of **${currentUser.careerAspiration.targetRole}**, here is your gap analysis:\n\n• **Missing Competencies**: ${currentUser.careerAspiration.missingSkills.join(', ')}\n• **Developing Competencies**: ${currentUser.careerAspiration.developingSkills.join(', ')}\n• **Readiness Score**: ${currentUser.careerAspiration.readinessScore}%\n\nI recommend submitting a course request for *Production MLOps* or exploring a 20% gig with the Cloud & Platform team.`;
        actions = [
          { label: 'View Skill Gap Path', actionType: 'navigate', payload: '/skill-gaps' },
          { label: 'Browse Courses', actionType: 'navigate', payload: '/learning' },
        ];
      } else if (lower.includes('why') || lower.includes('match') || lower.includes('lead ai')) {
        replyText = `You have a **94% semantic match** for the *Lead AI Application Engineer* role! \n\n**Reasoning Breakdown**:\n1. **Direct Skill Fit (50%)**: Verified expert in Python and FastAPI.\n2. **Semantic Vector Match (35%)**: High cosine similarity between your pgvector experience and the project's vector retrieval requirements.\n3. **Transferable Bonus (15%)**: Demonstrated React & TypeScript proficiency allows full-stack cross-collaboration.`;
        actions = [{ label: 'View Opportunity Details', actionType: 'navigate', payload: '/opportunities' }];
      } else if (lower.includes('course') || lower.includes('learn') || lower.includes('mlops')) {
        replyText = `For closing your MLOps deficit, I highly recommend enrolling in **Production MLOps: Continuous Integration & Model Delivery** (DeepLearning.AI). It directly covers automated model drift testing, Triton serving, and CI/CD pipelines.`;
        actions = [{ label: 'Request Course Approval', actionType: 'navigate', payload: '/learning' }];
      } else if (lower.includes('gig') || lower.includes('project')) {
        replyText = `I found a high-compatibility 20% gig for you: **Cross-Functional Talent Matching ML Gig (8 weeks)** in the AI / Machine Learning Team. It leverages your Python and NetworkX skills while offering direct mentorship under Sarah Jenkins.`;
        actions = [{ label: 'Apply for Gig', actionType: 'navigate', payload: '/opportunities' }];
      } else {
        replyText = `You currently have **${currentUser.skills.length} verified competencies** on your profile, with strong core foundations in Python, FastAPI, and pgvector. You are in a prime position to pursue Staff ML Architecture milestones or take on internal 20% time gigs.`;
        actions = [{ label: 'Explore Opportunities', actionType: 'navigate', payload: '/opportunities' }];
      }

      const botReply: ChatMessage = {
        id: `msg-bot-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: 'Just now',
        suggestedActions: actions,
      };

      setMessages((prev) => [...prev, botReply]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/30">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">AI Career Assistant</h1>
            <p className="text-slate-400 text-xs mt-0.5">
              Personalized career guidance, project match reasoning, and skill upskilling advice.
            </p>
          </div>
        </div>
      </div>

      {/* Chat Area Card */}
      <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-md flex flex-col h-[550px] shadow-2xl justify-between">
        {/* Messages Scroll Area */}
        <div className="overflow-y-auto space-y-4 pr-2 flex-1">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 text-xs ${
                msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-violet-600/20 border border-violet-500/40 text-violet-300'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>

              <div
                className={`p-4 rounded-2xl max-w-lg space-y-2 leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-900/80 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                <p className="whitespace-pre-line text-xs">{msg.text}</p>

                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80">
                    {msg.suggestedActions.map((act, i) => (
                      <button
                        key={i}
                        onClick={() => navigate(act.payload)}
                        className="px-3 py-1.5 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 font-semibold text-[11px] transition flex items-center space-x-1"
                      >
                        <span>{act.label}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center space-x-2 text-xs text-slate-400 p-2">
              <Sparkles className="w-4 h-4 text-violet-400 animate-spin" />
              <span>Analyzing knowledge graph & generating recommendation...</span>
            </div>
          )}
        </div>

        {/* Suggested Prompts & Input Area */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {samplePrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="text-[11px] px-3 py-1 rounded-full bg-slate-900/90 text-slate-300 border border-slate-700/60 hover:border-violet-500/50 hover:text-white transition"
              >
                {prompt}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask about your skills, project fit reasons, or career path recommendations..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim()}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-2xl transition shadow-lg shadow-indigo-600/30"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
