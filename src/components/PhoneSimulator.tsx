import React, { useState } from 'react';
import {
  Phone,
  Clock,
  Hash,
  Database,
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
  Plus,
  Trash2,
  ChevronRight,
  Sparkles,
  PhoneOutgoing,
  PhoneIncoming,
  PhoneMissed,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Volume2,
  Mic,
  ArrowLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CallRecord, PermissionState, ActivePhoneScreen } from '../types/callLog';

interface PhoneSimulatorProps {
  records: CallRecord[];
  onInjectCalls: (
    numbers: string[],
    hours: number,
    count: number,
    isPerNumber: boolean
  ) => { success: boolean; message: string; count: number; numbersCount: number };
  onClearRecords: () => void;
  onSeedSampleRecords: () => void;
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({
  records,
  onInjectCalls,
  onClearRecords,
  onSeedSampleRecords,
}) => {
  // Screen state
  const [activeScreen, setActiveScreen] = useState<ActivePhoneScreen>('injector');

  // Multi-number mode toggle
  const [isMultiMode, setIsMultiMode] = useState<boolean>(false);
  const [singleNumber, setSingleNumber] = useState<string>('+1 (555) 019-2834');
  const [multiNumbersText, setMultiNumbersText] = useState<string>(
    '+1 (555) 019-2834\n+1 (555) 847-2910\n+1 (555) 334-9921'
  );
  const [isPerNumber, setIsPerNumber] = useState<boolean>(false);

  // Time & count inputs
  const [hoursWindow, setHoursWindow] = useState<string>('24');
  const [callCount, setCallCount] = useState<string>('5');
  const [statusMessage, setStatusMessage] = useState<string>('Ready to inject fake calls.');
  const [statusType, setStatusType] = useState<'neutral' | 'success' | 'error'>('neutral');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Helper to parse numbers
  const parseTargetNumbers = (): string[] => {
    if (!isMultiMode) {
      return singleNumber.trim() ? [singleNumber.trim()] : [];
    }
    return multiNumbersText
      .split(/[\n,;]+/)
      .map(n => n.trim())
      .filter(n => n.length > 0);
  };

  const parsedNumbers = parseTargetNumbers();

  // Permission simulation state
  const [writePermission, setWritePermission] = useState<PermissionState>('prompt');
  const [showPermissionDialog, setShowPermissionDialog] = useState<boolean>(false);
  const [selectedCallDetail, setSelectedCallDetail] = useState<CallRecord | null>(null);

  // Current phone time
  const currentTime = new Date();
  const timeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Handle Inject Fake Calls button click
  const handleInjectClick = () => {
    // If permission has not been granted yet, show native Android runtime dialog
    if (writePermission === 'prompt') {
      setShowPermissionDialog(true);
      return;
    }

    if (writePermission === 'denied') {
      setStatusType('error');
      setStatusMessage(
        'SecurityException: Permission android.permission.WRITE_CALL_LOG denied. System ContentResolver rejected insertion.'
      );
      return;
    }

    executeInjection();
  };

  const executeInjection = () => {
    const hours = parseInt(hoursWindow, 10);
    const count = parseInt(callCount, 10);
    const numbers = parseTargetNumbers();

    if (numbers.length === 0) {
      setStatusType('error');
      setStatusMessage('Error: Please enter at least one valid target phone number.');
      return;
    }

    if (isNaN(hours) || hours <= 0 || isNaN(count) || count <= 0) {
      setStatusType('error');
      setStatusMessage('Error: Hours and Call Count must be positive numbers.');
      return;
    }

    const totalToInject = isMultiMode && isPerNumber ? count * numbers.length : count;

    setIsProcessing(true);
    setStatusType('neutral');
    setStatusMessage(`Injecting ${totalToInject} calls across ${numbers.length} number(s)...`);

    setTimeout(() => {
      const res = onInjectCalls(numbers, hours, count, isMultiMode && isPerNumber);
      setIsProcessing(false);
      if (res.success) {
        setStatusType('success');
        setStatusMessage(res.message);
        // Trigger celebratory confetti
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.6 }
        });
      } else {
        setStatusType('error');
        setStatusMessage(res.message);
      }
    }, 450);
  };

  // Permission dialog handlers
  const handleAllowPermission = () => {
    setWritePermission('granted');
    setShowPermissionDialog(false);
    executeInjection();
  };

  const handleDenyPermission = () => {
    setWritePermission('denied');
    setShowPermissionDialog(false);
    setStatusType('error');
    setStatusMessage(
      'SecurityException: Permission android.permission.WRITE_CALL_LOG denied by user. Insertion aborted.'
    );
  };

  // Format relative timestamp
  const formatRelativeTime = (timestamp: number) => {
    const diffMs = Date.now() - timestamp;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  return (
    <div className="flex flex-col items-center">
      {/* Device Mode Switcher bar */}
      <div className="w-full max-w-sm mb-4 flex items-center justify-between p-1 bg-slate-900/90 border border-slate-800 rounded-xl">
        <button
          onClick={() => setActiveScreen('injector')}
          className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-lg transition-all ${
            activeScreen === 'injector'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Injector App
        </button>
        <button
          onClick={() => setActiveScreen('dialer')}
          className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeScreen === 'dialer'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Phone Recents
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
            {records.length}
          </span>
        </button>
        <button
          onClick={() => setActiveScreen('database')}
          className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-lg transition-all ${
            activeScreen === 'database'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          DB Inspector
        </button>
      </div>

      {/* Simulated Android Device Outer Bezel */}
      <div className="relative w-full max-w-[340px] h-[670px] sm:h-[690px] bg-slate-950 rounded-[40px] sm:rounded-[44px] p-2.5 sm:p-3 shadow-2xl border-[4px] border-slate-700/80 ring-1 ring-white/10 flex flex-col justify-between overflow-hidden">
        {/* Device screen viewport */}
        <div className="relative w-full h-full bg-slate-900 rounded-[30px] sm:rounded-[34px] overflow-hidden flex flex-col select-none">
          {/* Status bar */}
          <div className="h-7 bg-transparent px-5 pt-2 flex items-center justify-between text-[11px] font-semibold text-slate-300 z-20">
            <span>{timeString}</span>
            {/* Camera punch hole */}
            <div className="w-3.5 h-3.5 rounded-full bg-slate-950 border border-slate-800/80 mx-auto" />
            <div className="flex items-center gap-1.5 text-[10px]">
              <span>5G</span>
              <span>100%</span>
            </div>
          </div>

          {/* SCREEN CONTENT */}
          <div className="flex-1 overflow-y-auto flex flex-col bg-slate-950">
            {/* SCREEN 1: Jetpack Compose Injector App */}
            {activeScreen === 'injector' && (
              <div className="flex-1 flex flex-col bg-slate-950 text-slate-100">
                {/* Compose TopAppBar */}
                <div className="px-4 py-3 bg-indigo-950/70 border-b border-indigo-900/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <h1 className="text-sm font-bold text-white tracking-tight">Call Log Injector</h1>
                      <p className="text-[10px] text-indigo-300">Jetpack Compose minSdk 24</p>
                    </div>
                  </div>
                  {/* Runtime permission status pill */}
                  <button
                    onClick={() => {
                      // Toggle permission state for testing
                      setWritePermission(prev =>
                        prev === 'granted' ? 'denied' : prev === 'denied' ? 'prompt' : 'granted'
                      );
                    }}
                    title="Click to toggle permission test state"
                    className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 border transition-colors ${
                      writePermission === 'granted'
                        ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300'
                        : writePermission === 'denied'
                        ? 'bg-rose-950/60 border-rose-700 text-rose-300'
                        : 'bg-amber-950/60 border-amber-700 text-amber-300'
                    }`}
                  >
                    {writePermission === 'granted' ? (
                      <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                    ) : (
                      <ShieldAlert className="w-2.5 h-2.5 text-amber-400" />
                    )}
                    <span>{writePermission.toUpperCase()}</span>
                  </button>
                </div>

                {/* Form Body */}
                <div className="p-4 space-y-3.5 flex-1">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Inject simulated outgoing calls directly into Android’s system CallLog via ContentResolver.
                  </p>

                  {/* Single vs Multiple Number Mode Switch */}
                  <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl">
                    <button
                      onClick={() => setIsMultiMode(false)}
                      className={`flex-1 py-1 px-2 text-[11px] font-semibold rounded-lg transition-all ${
                        !isMultiMode
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Single Number
                    </button>
                    <button
                      onClick={() => setIsMultiMode(true)}
                      className={`flex-1 py-1 px-2 text-[11px] font-semibold rounded-lg transition-all flex items-center justify-center gap-1 ${
                        isMultiMode
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>Multiple Numbers</span>
                      {parsedNumbers.length > 1 && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-800 text-indigo-300">
                          {parsedNumbers.length}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* 1. Target Number Input (Single or Multi) */}
                  {!isMultiMode ? (
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                        <span>Target Phone Number</span>
                        <span className="text-[10px] text-slate-500 font-normal">KeyboardType.Phone</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="tel"
                          value={singleNumber}
                          onChange={e => setSingleNumber(e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 outline-none transition-all font-mono"
                        />
                      </div>
                      {/* Quick presets */}
                      <div className="flex items-center gap-1.5 pt-0.5 overflow-x-auto pb-0.5">
                        <button
                          onClick={() => setSingleNumber('+1 (555) 019-2834')}
                          className="text-[10px] px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-md transition-colors"
                        >
                          +1 555-0192
                        </button>
                        <button
                          onClick={() => setSingleNumber('+1 (555) 847-2910')}
                          className="text-[10px] px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-md transition-colors"
                        >
                          +1 555-8472
                        </button>
                        <button
                          onClick={() => setSingleNumber('+44 20 7946 0912')}
                          className="text-[10px] px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-md transition-colors"
                        >
                          +44 London
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
                        <span>Multiple Phone Numbers</span>
                        <span className="text-[10px] text-emerald-400 font-mono">
                          {parsedNumbers.length} {parsedNumbers.length === 1 ? 'number' : 'numbers'} detected
                        </span>
                      </div>
                      <div className="relative">
                        <textarea
                          rows={3}
                          value={multiNumbersText}
                          onChange={e => setMultiNumbersText(e.target.value)}
                          placeholder="+1 555 0192&#10;+1 555 8472&#10;+1 555 9911"
                          className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all font-mono leading-relaxed resize-none"
                        />
                      </div>
                      {/* Batch preset buttons */}
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <button
                          onClick={() =>
                            setMultiNumbersText(
                              '+1 (555) 019-2834\n+1 (555) 847-2910\n+1 (555) 334-9921'
                            )
                          }
                          className="text-[10px] px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-md transition-colors"
                        >
                          Family (3)
                        </button>
                        <button
                          onClick={() =>
                            setMultiNumbersText(
                              '+1 (555) 220-4401\n+1 (555) 771-9988\n+1 (555) 662-1133'
                            )
                          }
                          className="text-[10px] px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-md transition-colors"
                        >
                          Work (3)
                        </button>
                        <button
                          onClick={() =>
                            setMultiNumbersText('+1 (800) 555-0199\n+1 (888) 555-0144')
                          }
                          className="text-[10px] px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-md transition-colors"
                        >
                          Toll-Free (2)
                        </button>
                      </div>

                      {/* Distribution Mode Switch */}
                      <div className="pt-1 flex items-center justify-between text-[11px] bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                        <span className="text-slate-300">
                          {isPerNumber
                            ? `Generate count for EACH (${parsedNumbers.length})`
                            : 'Distribute count across numbers'}
                        </span>
                        <button
                          onClick={() => setIsPerNumber(prev => !prev)}
                          className={`text-[10px] px-2 py-0.5 rounded font-medium border transition-colors ${
                            isPerNumber
                              ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                              : 'bg-slate-800 border-slate-700 text-slate-400'
                          }`}
                        >
                          {isPerNumber ? 'Per Number' : 'Split Total'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 2. Time Window Input (in hours) */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                      <span>Time Window (Hours in past)</span>
                      <span className="text-[10px] text-slate-500 font-normal">Past distribution</span>
                    </label>
                    <div className="relative">
                      <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="number"
                        min="1"
                        max="720"
                        value={hoursWindow}
                        onChange={e => setHoursWindow(e.target.value)}
                        placeholder="e.g. 24"
                        className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 outline-none transition-all font-mono"
                      />
                    </div>
                    {/* Window presets */}
                    <div className="flex items-center gap-1.5 pt-0.5">
                      {['6', '12', '24', '48', '168'].map(hrs => (
                        <button
                          key={hrs}
                          onClick={() => setHoursWindow(hrs)}
                          className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors ${
                            hoursWindow === hrs
                              ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {hrs === '168' ? '7 days' : `${hrs}h`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Call Count Input */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                      <span>
                        {isMultiMode && isPerNumber
                          ? `Calls per Number (${parseInt(callCount, 10) * parsedNumbers.length} total)`
                          : 'Total Call Count'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-normal">1..100</span>
                    </label>
                    <div className="relative">
                      <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={callCount}
                        onChange={e => setCallCount(e.target.value)}
                        placeholder="e.g. 5"
                        className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 outline-none transition-all font-mono"
                      />
                    </div>
                    {/* Count presets */}
                    <div className="flex items-center gap-1.5 pt-0.5">
                      {['1', '3', '5', '10', '25'].map(cnt => (
                        <button
                          key={cnt}
                          onClick={() => setCallCount(cnt)}
                          className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors ${
                            callCount === cnt
                              ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {cnt} {cnt === '1' ? 'call' : 'calls'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 4. Action Button: Inject Fake Calls */}
                  <button
                    onClick={handleInjectClick}
                    disabled={isProcessing}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Injecting Calls...</span>
                      </>
                    ) : (
                      <>
                        <PhoneOutgoing className="w-3.5 h-3.5" />
                        <span>
                          {isMultiMode && parsedNumbers.length > 1
                            ? `Inject Calls to ${parsedNumbers.length} Numbers`
                            : 'Inject Fake Calls'}
                        </span>
                      </>
                    )}
                  </button>

                  {/* 5. Status Text Box */}
                  <div
                    className={`p-3 rounded-xl border text-[11px] leading-relaxed transition-all ${
                      statusType === 'success'
                        ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-300'
                        : statusType === 'error'
                        ? 'bg-rose-950/40 border-rose-700/60 text-rose-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {statusType === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : statusType === 'error' ? (
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-slate-500 shrink-0 mt-1.5" />
                      )}
                      <div>
                        <span className="font-semibold block mb-0.5">
                          {statusType === 'success'
                            ? 'Operation Succeeded'
                            : statusType === 'error'
                            ? 'Operation Failed'
                            : 'Status'}
                        </span>
                        <span>{statusMessage}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom helper switch */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Telephony DB: {records.length} total calls</span>
                    <button
                      onClick={() => setActiveScreen('dialer')}
                      className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                    >
                      View in Dialer <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN 2: Android Phone Dialer / Recents */}
            {activeScreen === 'dialer' && (
              <div className="flex-1 flex flex-col bg-slate-950 text-slate-100">
                {/* Google Phone Header */}
                <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveScreen('injector')}
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                      <h2 className="text-xs font-bold text-white">Phone · Recents</h2>
                      <p className="text-[10px] text-slate-400">{records.length} call records</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={onSeedSampleRecords}
                      title="Add sample incoming/missed calls"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Sample
                    </button>
                    <button
                      onClick={onClearRecords}
                      title="Clear call history"
                      className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 text-[10px] flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Clear
                    </button>
                  </div>
                </div>

                {/* Call History List */}
                <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
                  {records.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 space-y-3">
                      <Phone className="w-8 h-8 mx-auto opacity-30 text-slate-400" />
                      <p className="text-xs">No calls recorded in system CallLog database.</p>
                      <button
                        onClick={() => setActiveScreen('injector')}
                        className="text-xs text-indigo-400 hover:underline"
                      >
                        Inject fake calls now &rarr;
                      </button>
                    </div>
                  ) : (
                    records.map(record => (
                      <div
                        key={record.id}
                        onClick={() => setSelectedCallDetail(record)}
                        className="p-3 hover:bg-slate-900/80 transition-colors flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          {/* Contact initial bubble */}
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-slate-300">
                            {record.name ? record.name[0] : '#'}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                              <span>{record.name || record.number}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                              {/* Call type icon */}
                              {record.type === 2 ? (
                                <span className="flex items-center gap-0.5 text-blue-400">
                                  <PhoneOutgoing className="w-2.5 h-2.5" /> Outgoing
                                </span>
                              ) : record.type === 1 ? (
                                <span className="flex items-center gap-0.5 text-emerald-400">
                                  <PhoneIncoming className="w-2.5 h-2.5" /> Incoming
                                </span>
                              ) : (
                                <span className="flex items-center gap-0.5 text-rose-400">
                                  <PhoneMissed className="w-2.5 h-2.5" /> Missed
                                </span>
                              )}
                              <span>·</span>
                              <span>{formatDuration(record.duration)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 font-mono">
                            {formatRelativeTime(record.date)}
                          </span>
                          <span className="block text-[9px] text-slate-500 font-mono">
                            {new Date(record.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Bottom dialer bar */}
                <div className="p-2.5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-around text-slate-400 text-[10px]">
                  <span className="text-indigo-400 font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Recents
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" /> Keypad
                  </span>
                  <span className="flex items-center gap-1">
                    <Mic className="w-3.5 h-3.5" /> Voicemail
                  </span>
                </div>
              </div>
            )}

            {/* SCREEN 3: ContentResolver DB Inspector */}
            {activeScreen === 'database' && (
              <div className="flex-1 flex flex-col bg-slate-950 text-slate-100">
                <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                  <div>
                    <h2 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-indigo-400" />
                      content://call_log/calls
                    </h2>
                    <p className="text-[10px] text-slate-400 font-mono">SQLite provider columns</p>
                  </div>
                  <button
                    onClick={() => setActiveScreen('injector')}
                    className="text-[10px] text-indigo-400 hover:underline"
                  >
                    Done
                  </button>
                </div>

                <div className="flex-1 overflow-x-auto overflow-y-auto p-2">
                  <table className="w-full text-left text-[10px] font-mono border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="p-1">_ID</th>
                        <th className="p-1">NUMBER</th>
                        <th className="p-1">DUR</th>
                        <th className="p-1">TYPE</th>
                        <th className="p-1">DATE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {records.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-slate-500">
                            Table is empty.
                          </td>
                        </tr>
                      ) : (
                        records.map(row => (
                          <tr key={row.id} className="hover:bg-slate-900/50">
                            <td className="p-1 text-slate-500">{row.id}</td>
                            <td className="p-1 text-slate-200">{row.number}</td>
                            <td className="p-1 text-indigo-300">{row.duration}s</td>
                            <td className="p-1">
                              <span
                                className={`px-1 rounded ${
                                  row.type === 2
                                    ? 'bg-blue-950 text-blue-300'
                                    : row.type === 1
                                    ? 'bg-emerald-950 text-emerald-300'
                                    : 'bg-rose-950 text-rose-300'
                                }`}
                              >
                                {row.type === 2 ? '2 (OUT)' : row.type === 1 ? '1 (IN)' : '3 (MISS)'}
                              </span>
                            </td>
                            <td className="p-1 text-slate-400 whitespace-nowrap">
                              {new Date(row.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="p-2 bg-slate-900/70 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Columns: NUMBER, DATE, DURATION, TYPE, IS_READ</span>
                </div>
              </div>
            )}
          </div>

          {/* Android Navigation Pill bar */}
          <div className="h-5 bg-slate-950 flex items-center justify-center">
            <div className="w-24 h-1 bg-slate-600 rounded-full" />
          </div>

          {/* NATIVE ANDROID RUNTIME PERMISSION MODAL OVERLAY */}
          {showPermissionDialog && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
              <div className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl p-5 shadow-2xl space-y-4 text-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">Call Log Injector</h3>
                    <p className="text-[10px] text-slate-400">Android 14 System Security Dialog</p>
                  </div>
                </div>

                <p className="text-xs text-slate-200 leading-snug">
                  Allow <strong>Call Log Injector</strong> to access and modify your phone call logs?
                </p>

                <div className="text-[10px] text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <ShieldCheck className="w-3 h-3 text-indigo-400" />
                    <span>android.permission.WRITE_CALL_LOG</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <ShieldCheck className="w-3 h-3 text-indigo-400" />
                    <span>android.permission.READ_CALL_LOG</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  <button
                    onClick={handleAllowPermission}
                    className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    While using the app (Allow)
                  </button>
                  <button
                    onClick={handleDenyPermission}
                    className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 active:bg-slate-750 text-slate-300 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                  >
                    Don’t allow
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CALL DETAIL MODAL */}
          {selectedCallDetail && (
            <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-40">
              <div className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-slate-100 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="text-xs font-bold text-white">Call Record Details</h3>
                  <button
                    onClick={() => setSelectedCallDetail(null)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Number:</span>
                    <span className="font-mono text-white font-semibold">{selectedCallDetail.number}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Type:</span>
                    <span className="font-medium text-indigo-300">
                      {selectedCallDetail.type === 2
                        ? 'Outgoing (2)'
                        : selectedCallDetail.type === 1
                        ? 'Incoming (1)'
                        : 'Missed (3)'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Duration:</span>
                    <span className="font-mono text-white">
                      {selectedCallDetail.duration}s ({formatDuration(selectedCallDetail.duration)})
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Date (ms):</span>
                    <span className="font-mono text-[10px] text-slate-300">{selectedCallDetail.date}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Formatted:</span>
                    <span className="text-[11px] text-slate-300">
                      {new Date(selectedCallDetail.date).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>ContentResolver URI:</span>
                    <span className="font-mono text-[10px] text-indigo-400">
                      content://call_log/calls/{selectedCallDetail.id}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCallDetail(null)}
                  className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg mt-2"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
