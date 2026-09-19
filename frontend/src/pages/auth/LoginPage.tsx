import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  Shield,
  User,
  ArrowRight,
  Lock,
  Mail,
  Check,
} from 'lucide-react';
import { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { allEmployees, switchUser, setRole } = useApp();

  const [activeTab, setActiveTab] = useState<UserRole>('employee');

  // Employee Selection
  const employeeAccounts = allEmployees.filter((e) => e.personaTitle !== 'Team Leader');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(employeeAccounts[0]?.id || 'emp-growth-jane');

  // Team Leader Selection
  const leaderAccounts = allEmployees.filter((e) => e.personaTitle === 'Team Leader');
  const [selectedLeaderId, setSelectedLeaderId] = useState<string>(leaderAccounts[0]?.id || 'emp-tl-sarah');

  // Form Fields
  const [employeeEmail, setEmployeeEmail] = useState('jane.doe@company.internal');
  const [employeePassword, setEmployeePassword] = useState('••••••••••••');
  const [leaderEmail, setLeaderEmail] = useState('sarah.jenkins@company.internal');
  const [leaderPassword, setLeaderPassword] = useState('••••••••••••');

  const handleSelectEmployee = (empId: string) => {
    setSelectedEmployeeId(empId);
    const emp = allEmployees.find((e) => e.id === empId);
    if (emp) {
      setEmployeeEmail(emp.email);
    }
  };

  const handleSelectLeader = (leadId: string) => {
    setSelectedLeaderId(leadId);
    const lead = allEmployees.find((e) => e.id === leadId);
    if (lead) {
      setLeaderEmail(lead.email);
    }
  };

  const handleEmployeeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    switchUser(selectedEmployeeId);
    setRole('employee');
    navigate('/');
  };

  const handleLeaderLogin = (e: React.FormEvent) => {
    e.preventDefault();
    switchUser(selectedLeaderId);
    setRole('team_leader');
    navigate('/tl/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Background glow accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-violet-600/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start z-10 my-8">
        {/* Left Column: Brand Hero Information (5 Cols) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-12">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-violet-500 to-cyan-400 flex items-center justify-center shadow-xl shadow-indigo-500/30">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">EAGLE VISION</h1>
              <p className="text-xs text-indigo-400 font-semibold tracking-wider uppercase">
                Internal Talent Mobility Platform
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">
              Continuous employee profiles & team talent discovery.
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Eagle Vision maintains living professional talent records across engineering teams.
              Employees build and evolve their profiles while Team Leaders discover talent, staff projects,
              and guide career development.
            </p>
          </div>

          {/* Value pillars */}
          <div className="space-y-3 pt-2 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center space-x-2 text-indigo-300 font-bold">
                <User className="w-4 h-4 text-indigo-400" />
                <span>Profile-First Employee Portal</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Continuous record of personal identity, verified skills, ongoing sprint work, and learning goals.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center space-x-2 text-violet-300 font-bold">
                <Shield className="w-4 h-4 text-violet-400" />
                <span>Dedicated Team Leader Workspace</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Team overview, member skill matrices, 20% innovation gig staffing, and development approvals.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Authentication Form with Distinct Tabs (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          {/* Separate Login Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Select Portal Login:
            </label>
            <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-950/80 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('employee')}
                className={`py-3 px-4 rounded-xl font-bold text-xs transition flex items-center justify-center space-x-2 border ${
                  activeTab === 'employee'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white border-transparent'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Employee Login</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('team_leader')}
                className={`py-3 px-4 rounded-xl font-bold text-xs transition flex items-center justify-center space-x-2 border ${
                  activeTab === 'team_leader'
                    ? 'bg-violet-600 text-white border-violet-500 shadow-md shadow-violet-600/30'
                    : 'text-slate-400 hover:text-white border-transparent'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Team Leader Login</span>
              </button>
            </div>
          </div>

          {/* TAB 1: EMPLOYEE LOGIN */}
          {activeTab === 'employee' && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <span>Employee Sign In</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                    Profile Portal
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Access your personal professional profile, skills, current sprint work, and internal opportunities.
                </p>
              </div>

              {/* 1-Click Employee Persona Directory (10 Employees across 4 Teams) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>Select Demo Employee ({employeeAccounts.length} profiles):</span>
                  <span className="text-indigo-400 lowercase font-normal">Click to quick-select</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {employeeAccounts.map((emp) => (
                    <div
                      key={emp.id}
                      onClick={() => handleSelectEmployee(emp.id)}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition flex items-center space-x-2.5 ${
                        selectedEmployeeId === emp.id
                          ? 'bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500'
                          : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <img
                        src={emp.avatar}
                        alt={emp.name}
                        className="w-8 h-8 rounded-lg object-cover border border-slate-700 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-xs truncate flex items-center space-x-1.5">
                          <span>{emp.name}</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                              emp.personaType === 'new_employee'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            }`}
                          >
                            {emp.personaType === 'new_employee' ? '🌱 New' : '📈 Growth'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {emp.title} • {emp.teamName.split(' ')[0]}
                        </div>
                      </div>
                      {selectedEmployeeId === emp.id && (
                        <Check className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleEmployeeLogin} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Company Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      value={employeeEmail}
                      onChange={(e) => setEmployeeEmail(e.target.value)}
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 font-mono text-xs"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      value={employeePassword}
                      onChange={(e) => setEmployeePassword(e.target.value)}
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 text-xs"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 text-xs"
                >
                  <span>Sign In as Employee & Open My Profile</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: TEAM LEADER LOGIN */}
          {activeTab === 'team_leader' && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <span>Team Leader Sign In</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-semibold">
                    Leader Portal
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Manage your team roster, inspect member profiles, staff projects, and evaluate internal talent requests.
                </p>
              </div>

              {/* 1-Click Team Leader Directory */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>Select Team Leader ({leaderAccounts.length} Leaders):</span>
                  <span className="text-violet-400 lowercase font-normal">Click to quick-select</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {leaderAccounts.map((lead) => (
                    <div
                      key={lead.id}
                      onClick={() => handleSelectLeader(lead.id)}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition flex items-center space-x-2.5 ${
                        selectedLeaderId === lead.id
                          ? 'bg-violet-600/20 border-violet-500 text-white ring-1 ring-violet-500'
                          : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <img
                        src={lead.avatar}
                        alt={lead.name}
                        className="w-8 h-8 rounded-lg object-cover border border-slate-700 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-xs truncate flex items-center space-x-1.5">
                          <span>{lead.name}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-violet-500/20 text-violet-300 font-mono">
                            Leader
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">{lead.teamName}</div>
                      </div>
                      {selectedLeaderId === lead.id && (
                        <Check className="w-4 h-4 text-violet-400 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLeaderLogin} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Leader Work Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      value={leaderEmail}
                      onChange={(e) => setLeaderEmail(e.target.value)}
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-slate-100 focus:outline-none focus:border-violet-500 font-mono text-xs"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      value={leaderPassword}
                      onChange={(e) => setLeaderPassword(e.target.value)}
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-slate-100 focus:outline-none focus:border-violet-500 text-xs"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl transition shadow-lg shadow-violet-600/30 flex items-center justify-center space-x-2 text-xs"
                >
                  <span>Sign In as Team Leader & Open Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
