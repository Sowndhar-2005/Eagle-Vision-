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

export const AITalentAssistantPage: React.FC = () => {
  const { currentUser, allEmployees, allProjects } = useApp();
  const navigate = useNavigate();

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-tl-init',
      sender: 'assistant',
      text: `Hello ${currentUser.name}! I am your Eagle Vision AI Talent Assistant for the ${currentUser.teamName}. I can search internal engineering talent across company teams, match team members to open project requirements, or analyze skill shortages. How can I assist you today?`,
      timestamp: 'Just now',
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const samplePrompts = [
    'Which employees across the company have Python + pgvector experience?',
    'Who in my team can fit the Cross-Functional Talent Matching Gig?',
    'What are the critical skill deficits in our AI/ML team?',
    'What development support does Jane Doe need for Staff ML role?',
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

      if (lower.includes('pgvector') || lower.includes('python') || lower.includes('vector')) {
        replyText = `Found **3 qualified engineers** with verified Python & vector database proficiencies:\n\n1. **Jane Doe** (Senior AI/ML Engineer — AI/ML Team)\n   • Python (Expert, 5 yrs) | pgvector (Advanced, 3 yrs) | 20% Gig Available\n2. **Alex Chen** (Associate AI Engineer — AI/ML Team)\n   • Python (Advanced, 2 yrs) | Currently onboarding on pgvector\n3. **David Kumar** (Cloud DevOps — Cloud & Platform Team)\n   • Python (Intermediate, 3 yrs) | EKS Vector cluster deployer`;
        actions = [{ label: 'Open Talent Discovery', actionType: 'navigate', payload: '/tl/talent-discovery' }];
      } else if (lower.includes('matching gig') || lower.includes('cross-functional') || lower.includes('fit')) {
        replyText = `For the **Cross-Functional Talent Matching ML Gig**, here is the top candidate recommendation:\n\n• **Jane Doe** (94% Compatibility Match): Proven expertise in async microservices and semantic embeddings.\n• **Priya Sharma** (88% Compatibility Match): Graph data specialist with expert NetworkX mastery, ideal for the graph centrality heuristics.`;
        actions = [{ label: 'Invite Member to Project', actionType: 'navigate', payload: '/tl/projects' }];
      } else if (lower.includes('deficit') || lower.includes('missing') || lower.includes('shortage')) {
        replyText = `Analysis of **${currentUser.teamName}** capability distribution shows:\n\n• **Critical Deficit**: **Kubernetes & Cloud Infrastructure (30% coverage)**. Highly recommended to staff a 20% gig engineer from the Cloud Team (e.g. David Kumar).\n• **Developing Shortage**: **Production MLOps (45% coverage)**. Currently being closed by Jane Doe's enrolled course.`;
        actions = [{ label: 'View Team Skills Matrix', actionType: 'navigate', payload: '/tl/team-skills' }];
      } else if (lower.includes('jane') || lower.includes('support') || lower.includes('staff ml')) {
        replyText = `To support **Jane Doe**'s transition to *Staff ML Infrastructure Engineer*:\n\n1. **Approve MLOps Course Request**: Will enable her to architect automated CI/CD model delivery pipelines.\n2. **Assign 20% Cloud Migration Gig**: Gives hands-on production Kubernetes experience alongside Vikram Patel's team.`;
        actions = [{ label: 'Review Jane\'s Request', actionType: 'navigate', payload: '/tl/requests' }];
      } else {
        replyText = `I have indexed all **${allEmployees.length} company employees** and **${allProjects.length} team projects**. You can ask me to evaluate candidates, draft role requirements, or find available 20% gig contributors.`;
        actions = [{ label: 'Talent Discovery', actionType: 'navigate', payload: '/tl/talent-discovery' }];
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
            <h1 className="text-2xl font-black text-white tracking-tight">AI Talent Assistant</h1>
            <p className="text-slate-400 text-xs mt-0.5">
              Internal talent search, project candidate matching, and team capability intelligence for Team Leaders.
            </p>
          </div>
        </div>
      </div>

      {/* Chat Box */}
      <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-md flex flex-col h-[550px] shadow-2xl justify-between">
        {/* Messages */}
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
                    ? 'bg-violet-600 text-white'
                    : 'bg-indigo-600/20 border border-indigo-500/40 text-indigo-300'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>

              <div
                className={`p-4 rounded-2xl max-w-lg space-y-2 leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-violet-600 text-white rounded-tr-none'
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
                        className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-semibold text-[11px] transition flex items-center space-x-1"
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
              <span>Analyzing internal talent graph and matching competencies...</span>
            </div>
          )}
        </div>

        {/* Suggested Prompts & Input */}
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
              placeholder="Ask for talent with specific skills, project fit evaluation, or team gap analysis..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim()}
              className="p-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white rounded-2xl transition shadow-lg shadow-violet-600/30"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
