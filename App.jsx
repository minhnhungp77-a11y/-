import React, { useState, useEffect } from 'react';
import { Timer, BookOpen, PenTool, History as HistoryIcon, Play, Pause, RotateCcw, Save, Trash2, Settings2 } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const CATEGORIES = {
  standing: { 
    name: '站桩', 
    icon: Timer, 
    color: 'text-orange-600', 
    bg: 'bg-orange-50',
    subTypes: ['混元桩', '技击桩', '其他']
  },
  chanting: { 
    name: '念偈子', 
    icon: BookOpen, 
    color: 'text-blue-600', 
    bg: 'bg-blue-50',
    subTypes: ['升龙偈', '山门偈', '其他']
  },
  writing: { 
    name: '阴性写作', 
    icon: PenTool, 
    color: 'text-purple-600', 
    bg: 'bg-purple-50',
    subTypes: []
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState('standing');
  const [subType, setSubType] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [records, setRecords] = useState(() => {
    const saved = localStorage.getItem('meditation_records_v2');
    return saved ? JSON.parse(saved) : [];
  });

  // Timer State
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('up'); 
  const [time, setTime] = useState(0);
  const [customMinutes, setCustomMinutes] = useState(20);
  const [note, setNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);

  useEffect(() => {
    localStorage.setItem('meditation_records_v2', JSON.stringify(records));
  }, [records]);

  // 初始化子类别
  useEffect(() => {
    const subs = CATEGORIES[activeTab].subTypes;
    setSubType(subs.length > 0 ? subs[0] : '');
    handleReset();
  }, [activeTab]);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        if (mode === 'up') {
          setTime(prev => prev + 1);
        } else {
          if (time > 0) {
            setTime(prev => prev - 1);
          } else {
            setIsActive(false);
            setShowNoteInput(true);
            // 简单的震动反馈（如果设备支持）
            if (window.navigator.vibrate) window.navigator.vibrate([200, 100, 200]);
          }
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, mode, time]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map(v => v < 10 ? '0' + v : v).join(':');
  };

  const handleReset = () => {
    setIsActive(false);
    setTime(mode === 'up' ? 0 : customMinutes * 60);
  };

  const handleSave = () => {
    const duration = mode === 'up' ? time : (customMinutes * 60 - time);
    if (duration < 1) return;

    const newRecord = {
      id: Date.now(),
      type: activeTab,
      subType: subType,
      duration,
      note,
      timestamp: new Date().toISOString(),
      mode
    };

    setRecords([newRecord, ...records]);
    handleReset();
    setNote('');
    setShowNoteInput(false);
    setShowHistory(true);
  };

  const currentCat = CATEGORIES[activeTab];

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white shadow-xl overflow-hidden font-sans">
      {/* Header */}
      <header className={`p-6 ${currentCat.bg} transition-colors duration-500`}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className={`text-2xl font-bold ${currentCat.color}`}>
              {showHistory ? '修行历史' : currentCat.name}
            </h1>
            {!showHistory && subType && (
              <span className="text-xs font-medium opacity-60">当前选择: {subType}</span>
            )}
          </div>
          <button onClick={() => setShowHistory(!showHistory)} className="p-2 rounded-full bg-white/50">
            {showHistory ? <Timer size={24} /> : <HistoryIcon size={24} />}
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-4">
        {!showHistory ? (
          <div className="flex flex-col items-center space-y-6">
            {/* 子类别选择 */}
            {currentCat.subTypes.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                {currentCat.subTypes.map(s => (
                  <button
                    key={s}
                    onClick={() => setSubType(s)}
                    className={`px-4 py-1.5 rounded-full text-sm transition-all ${subType === s ? 'bg-practice-600 text-white' : 'bg-gray-100 text-gray-500'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* 模式切换 */}
            <div className="flex bg-gray-100 p-1 rounded-xl w-full max-w-[200px]">
              {['up', 'down'].map(m => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setIsActive(false); setTime(m === 'up' ? 0 : customMinutes * 60); }}
                  className={`flex-1 py-1.5 rounded-lg text-sm font-medium ${mode === m ? 'bg-white shadow text-practice-800' : 'text-gray-500'}`}
                >
                  {m === 'up' ? '正计时' : '倒计时'}
                </button>
              ))}
            </div>

            {/* 倒计时自定义时长 */}
            {mode === 'down' && !isActive && (
              <div className="flex items-center space-x-3 animate-in fade-in transition-all">
                <span className="text-sm text-gray-500">时长(分):</span>
                <input 
                  type="number" 
                  value={customMinutes}
                  onChange={(e) => {
                    const val = Math.max(1, parseInt(e.target.value) || 0);
                    setCustomMinutes(val);
                    setTime(val * 60);
                  }}
                  className="w-20 text-center border-b-2 border-practice-300 focus:border-practice-600 outline-none text-xl font-mono"
                />
              </div>
            )}

            {/* 时间显示 */}
            <div className="text-7xl font-mono font-extralight tracking-tighter text-practice-700 py-6">
              {formatTime(time)}
            </div>

            {/* 控制按钮 */}
            <div className="flex items-center space-x-8">
              <button onClick={handleReset} className="p-4 rounded-full bg-gray-100 text-gray-400 active:bg-gray-200">
                <RotateCcw size={24} />
              </button>
              <button 
                onClick={() => setIsActive(!isActive)}
                className={`p-8 rounded-full shadow-2xl transition-all active:scale-90 ${isActive ? 'bg-orange-500 text-white' : 'bg-practice-800 text-white'}`}
              >
                {isActive ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" className="ml-2" />}
              </button>
              <button 
                onClick={() => setShowNoteInput(true)}
                className="p-4 rounded-full bg-gray-100 text-gray-400 active:bg-gray-200"
              >
                <Save size={24} />
              </button>
            </div>

            {/* 保存心得容器 */}
            {showNoteInput && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end">
                <div className="bg-white w-full rounded-t-[32px] p-8 space-y-4 animate-in slide-in-from-bottom">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">记录心得 ({subType || currentCat.name})</span>
                    <button onClick={() => setShowNoteInput(false)} className="text-gray-400">取消</button>
                  </div>
                  <textarea
                    autoFocus
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="此刻气息如何？身体有何感受？"
                    className="w-full h-32 p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-practice-500 resize-none"
                  />
                  <button onClick={handleSave} className="w-full py-4 bg-practice-800 text-white rounded-2xl font-bold">
                    保存此次修行
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in">
            {records.length === 0 ? (
              <div className="text-center py-20 text-gray-400 italic">暂无记录</div>
            ) : (
              records.map(r => (
                <div key={r.id} className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${CATEGORIES[r.type].bg} ${CATEGORIES[r.type].color}`}>
                        {r.subType || CATEGORIES[r.type].name}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">{format(new Date(r.timestamp), 'yyyy-MM-dd HH:mm')}</p>
                    </div>
                    <button onClick={() => setRecords(records.filter(i => i.id !== r.id))} className="text-gray-300"><Trash2 size={14}/></button>
                  </div>
                  <div className="text-xl font-mono font-bold text-practice-800">
                    {Math.floor(r.duration / 60)}' {r.duration % 60}''
                  </div>
                  {r.note && <div className="mt-2 text-sm text-gray-600 bg-white p-2 rounded-lg border-l-4 border-practice-300">「{r.note}」</div>}
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="flex justify-around items-center bg-white border-t border-gray-100 py-4 pb-8">
        {Object.entries(CATEGORIES).map(([key, cat]) => (
          <button
            key={key}
            onClick={() => { setActiveTab(key); setShowHistory(false); }}
            className={`flex flex-col items-center space-y-1 transition-all ${activeTab === key ? cat.color + ' scale-110' : 'text-gray-300'}`}
          >
            <cat.icon size={26} />
            <span className="text-[10px] font-bold">{cat.name}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
