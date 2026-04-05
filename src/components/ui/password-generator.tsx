'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { clsx } from 'clsx';
import { AlertTriangle, Check, ChevronDown, Copy, Loader2, RefreshCw, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Options {
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
}

interface Preset {
  id: string;
  label: string;
  length: number;
  options: Options;
}

interface StrengthResult {
  level: string;
  score: number;
}

interface HibpResult {
  breached: boolean;
  count: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*';

const TOGGLES: { key: keyof Options; label: string; description: string }[] = [
  { key: 'uppercase', label: 'Uppercase', description: 'A–Z' },
  { key: 'lowercase', label: 'Lowercase', description: 'a–z' },
  { key: 'numbers', label: 'Numbers', description: '0–9' },
  { key: 'symbols', label: 'Symbols', description: '!@#$%^&*' },
];

const PRESETS: Preset[] = [
  { id: 'banking', label: 'Banking', length: 16, options: { uppercase: true, lowercase: true, numbers: true, symbols: true } },
  { id: 'twitter', label: 'Twitter', length: 12, options: { uppercase: true, lowercase: true, numbers: true, symbols: false } },
  { id: 'wifi',    label: 'WiFi',    length: 24, options: { uppercase: true, lowercase: true, numbers: true, symbols: false } },
  { id: 'max',     label: 'Max Sec', length: 48, options: { uppercase: true, lowercase: true, numbers: true, symbols: true } },
];

const SEPARATORS = ['-', '_', '.', ' '];
const PIN_LENGTHS = [4, 6, 8];

const STRENGTH_CONFIG: Record<string, { label: string; color: string; bars: number }> = {
  Weak:          { label: 'Weak',        color: 'text-red-500',     bars: 1 },
  Fair:          { label: 'Fair',        color: 'text-orange-400',  bars: 2 },
  Strong:        { label: 'Strong',      color: 'text-yellow-300',  bars: 3 },
  'Very Strong': { label: 'Very Strong', color: 'text-[#E4F0F6]',   bars: 4 },
};

const BAR_COLORS: Record<string, string> = {
  Weak: '#ef4444', Fair: '#fb923c', Strong: '#fde047', 'Very Strong': '#E4F0F6',
};

const WORDS = [
  "acid","aged","also","arch","army","atom","aunt","avid","back","bail","bake","bald","ball","band",
  "bank","barn","bass","bath","beam","bean","bear","beat","beef","bell","bend","best","bind","bird",
  "bite","blot","blow","blue","bolt","bond","bone","book","boom","boot","bore","both","bowl","brag",
  "brew","brim","buck","buff","bulk","bull","burn","buzz","cake","calm","came","camp","cane","cape",
  "card","care","cart","case","cash","cast","cave","cell","chad","chef","chin","chip","chop","city",
  "clam","clap","clay","clip","club","clue","coal","coat","coil","coin","cold","comb","come","cook",
  "cool","cope","cord","cork","corn","cost","coup","cove","crab","crop","crow","cube","curb","cure",
  "curl","cute","cyan","damp","dark","dart","dash","data","date","dawn","deaf","deal","dean","dear",
  "deck","deed","deep","deer","deft","dell","dent","desk","dial","dice","diet","dime","dine","dirt",
  "disc","dish","disk","dive","dock","dome","door","dose","dove","down","drag","draw","drip","drop",
  "drum","dual","dull","dump","dune","dusk","dust","duty","each","earn","ease","east","edge","emit",
  "epic","even","ever","evil","exam","exit","face","fact","fade","fail","fair","fake","fall","farm",
  "fast","fate","fawn","feel","feet","fell","felt","fern","file","fill","film","find","fine","firm",
  "fish","fist","flag","flat","flaw","flea","flew","flip","flock","foam","foil","fold","folk","fond",
  "font","food","foot","ford","fork","form","fort","fowl","free","from","fuel","full","fund","fuse",
  "fuzz","gale","game","gang","gear","germ","gift","glad","glow","glue","gnat","goal","goat","gold",
  "golf","gong","good","gore","gown","grab","grad","gram","gray","grew","grid","grin","grip","grit",
  "grow","grub","gulf","gull","gulp","gust","hack","hail","half","hall","halt","hand","hang","hard",
  "harm","harp","hart","hash","haste","haul","haze","head","heal","heap","heat","heel","held","helm",
  "help","herb","herd","high","hill","hint","hire","hive","hold","hole","holy","home","hood","hook",
  "hope","horn","host","hour","hull","hump","hunt","hurt","hymn","icon","idea","inch","info","iris",
  "iron","isle","item","jade","jail","jazz","jest","join","joke","jolt","jump","just","keen","keep",
  "kelp","kept","kind","king","knee","knot","lack","lake","lamp","land","lane","lark","last","late",
  "lava","lawn","lead","leaf","lean","left","lens","lend","lime","link","lion","list","live","load",
  "loan","lock","loft","lone","long","loom","loop","lore","loss","lost","loud","love","luck","lure",
  "lush","lust","mace","made","mail","main","make","male","mall","mane","mare","mark","mart","mash",
  "mast","mate","maze","melt","memo","mesh","mild","mile","milk","mill","mind","mine","mint","mist",
  "moan","moat","mode","mold","mole","mood","moon","moor","more","moss","most","move","much","mule",
  "muse","musk","must","myth","nail","name","neck","need","nest","news","next","nice","nine","node",
  "noon","norm","nose","note","null","oath","oboe","odds","okra","once","open","oval","oven","over",
  "pace","pack","page","pain","pair","pale","palm","park","part","pass","past","path","peak","pear",
  "peel","peer","pest","pick","pier","pine","pink","pipe","plan","play","plea","plod","plop","plot",
  "plow","plum","plunge","plus","poem","poet","pole","poll","pond","pool","port","pose","post","pour",
  "pray","prep","prey","prim","prod","pull","pulp","pump","pure","push","rack","rain","rake","ramp",
  "rang","rank","rare","rash","rasp","rate","rave","read","real","reed","reef","reel","rely","rent",
  "rest","rice","rich","ride","ring","riot","rise","risk","road","robe","rock","rode","role","roll",
  "roof","root","rope","rose","ruin","rule","rune","rung","rush","rust","sage","sail","sake","sale",
  "salt","same","sand","sang","sank","sear","seed","seek","seem","self","send","shed","shin","ship",
  "shoe","shop","shot","show","shut","side","sift","silk","sill","sing","sink","site","size","skin",
  "skip","slab","slam","slap","slim","slip","slot","slow","slug","snap","snow","soak","sock","soil",
  "sole","soma","some","song","sort","soul","soup","span","spin","spot","spur","stab","stag","star",
  "stay","stem","step","stew","stir","stop","stub","stun","such","suit","sung","sunk","surf","swam",
  "swap","swat","tail","take","tale","talk","tall","tame","tape","task","team","tell","tend","term",
  "text","than","then","them","they","thin","tide","tilt","time","tire","toad","told","toll","tomb",
  "tone","tool","torn","town","trap","trim","trip","true","tube","tuck","tuna","tune","turf","turn",
  "tusk","twin","type","ugly","undo","unit","upon","used","vale","vane","vast","veil","vein","verb",
  "vest","view","vile","vine","vole","volt","vote","wade","wage","wake","walk","wall","wand","ward",
  "warp","wart","wave","weld","well","went","west","whim","whip","wick","wide","wild","will","wind",
  "wine","wink","wire","wise","wish","with","wolf","wood","wool","word","wore","work","worm","worn",
  "wove","wrap","writ","yard","yawn","year","yell","yoga","yoke","yore","your","zinc","zone","zoom",
];

// ── Crypto helpers ────────────────────────────────────────────────────────────

function pickRandom(str: string): string {
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  return str[array[0] % str.length];
}

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const buf = new Uint32Array(1);
    window.crypto.getRandomValues(buf);
    const j = buf[0] % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function pickWords(count: number): string[] {
  const arr = new Uint32Array(count);
  window.crypto.getRandomValues(arr);
  return Array.from(arr, (n) => WORDS[n % WORDS.length]);
}

// ── Generation functions ──────────────────────────────────────────────────────

function generatePassword(length: number, options: Options): string {
  let charset = '';
  const guaranteed: string[] = [];
  if (options.uppercase) { charset += UPPERCASE; guaranteed.push(pickRandom(UPPERCASE)); }
  if (options.lowercase) { charset += LOWERCASE; guaranteed.push(pickRandom(LOWERCASE)); }
  if (options.numbers)   { charset += NUMBERS;   guaranteed.push(pickRandom(NUMBERS)); }
  if (options.symbols)   { charset += SYMBOLS;   guaranteed.push(pickRandom(SYMBOLS)); }
  if (charset.length === 0) return '';
  const remaining = length - guaranteed.length;
  const randomPart = Array.from({ length: Math.max(0, remaining) }, () => pickRandom(charset));
  return shuffleArray([...guaranteed, ...randomPart]).join('');
}

function generatePassphrase(words: string[], separator = '-'): string {
  return words.join(separator);
}

function generatePin(length: number): string {
  const arr = new Uint32Array(length);
  window.crypto.getRandomValues(arr);
  return Array.from(arr, (n) => n % 10).join('');
}

function generateBulk(count: number, length: number, options: Options): string[] {
  return Array.from({ length: count }, () => generatePassword(length, options));
}

function scorePassword(password: string, options: Options): StrengthResult {
  if (!password) return { level: 'Weak', score: 0 };
  const len = password.length;
  const activeCharsets = [options.uppercase, options.lowercase, options.numbers, options.symbols].filter(Boolean).length;
  let score = 0;
  if (len >= 8)  score += 1;
  if (len >= 12) score += 1;
  if (len >= 20) score += 1;
  if (len >= 32) score += 1;
  if (activeCharsets >= 2) score += 1;
  if (activeCharsets >= 3) score += 1;
  if (activeCharsets === 4) score += 1;
  const level = score <= 2 ? 'Weak' : score <= 4 ? 'Fair' : score <= 5 ? 'Strong' : 'Very Strong';
  return { level, score: Math.min(score, 7) };
}

async function checkHibp(password: string): Promise<HibpResult | null> {
  try {
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-1', encoder.encode(password));
    const hashHex = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();
    const prefix = hashHex.slice(0, 5);
    const suffix = hashHex.slice(5);
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    const text = await response.text();
    for (const line of text.split('\n')) {
      const [lineSuffix, countStr] = line.split(':');
      if (lineSuffix.trim() === suffix) {
        return { breached: true, count: parseInt(countStr.trim(), 10) };
      }
    }
    return { breached: false, count: 0 };
  } catch {
    return null;
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PasswordGenerator() {
  const [mode, setMode] = useState<'password' | 'passphrase' | 'pin'>('password');
  const [length, setLength] = useState(16);
  const [wordCount, setWordCount] = useState(4);
  const [pinLength, setPinLength] = useState(6);
  const [separator, setSeparator] = useState('-');
  const [options, setOptions] = useState<Options>({ uppercase: true, lowercase: true, numbers: true, symbols: false });
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [copiedHistIdx, setCopiedHistIdx] = useState<number | null>(null);
  const [hibpResult, setHibpResult] = useState<HibpResult | null>(null);
  const [hibpLoading, setHibpLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [bulkCount, setBulkCount] = useState(5);
  const [bulkPasswords, setBulkPasswords] = useState<string[]>([]);
  const [copiedBulkIdx, setCopiedBulkIdx] = useState<number | null>(null);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const generate = useCallback(() => {
    setIsAnimating(true);
    setHibpResult(null);
    let pw = '';
    if (mode === 'password') {
      if (!Object.values(options).some(Boolean)) return;
      pw = generatePassword(length, options);
    } else if (mode === 'passphrase') {
      pw = generatePassphrase(pickWords(wordCount), separator);
    } else {
      pw = generatePin(pinLength);
    }
    setOutput(pw);
    setHistory((prev) => [pw, ...prev].slice(0, 10));
    setTimeout(() => setIsAnimating(false), 200);
  }, [mode, length, wordCount, pinLength, separator, options]);

  useEffect(() => { generate(); }, [generate]);

  const handleCopy = async (text: string, done?: () => void) => {
    try { await navigator.clipboard.writeText(text); done?.(); } catch {}
  };

  const handleMainCopy = async () => {
    if (!output || copied) return;
    await handleCopy(output, () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleToggle = (key: keyof Options, checked: boolean) => {
    const next = { ...options, [key]: checked };
    if (!Object.values(next).some(Boolean)) return;
    setOptions(next);
    setActivePreset(null);
  };

  const applyPreset = (preset: Preset) => {
    setActivePreset(preset.id);
    setLength(preset.length);
    setOptions({ ...preset.options });
  };

  const handleHibp = async () => {
    if (!output || hibpLoading) return;
    setHibpLoading(true);
    const result = await checkHibp(output);
    setHibpResult(result);
    setHibpLoading(false);
  };

  const handleBulkGenerate = () => {
    setBulkPasswords(generateBulk(bulkCount, length, options));
  };

  const strength = scorePassword(output, options);
  const strengthCfg = STRENGTH_CONFIG[strength.level] ?? STRENGTH_CONFIG.Weak;
  const barColor = BAR_COLORS[strength.level] ?? BAR_COLORS.Weak;

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-10 flex flex-col gap-6">

      {/* Mode tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-[#E4F0F6]/[0.04] border border-[#E4F0F6]/10">
        {(['password', 'passphrase', 'pin'] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setActivePreset(null); }}
            className={clsx(
              'flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors duration-150',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E4F0F6]/40',
              mode === m
                ? 'bg-[#E4F0F6] text-[#0A0F1E]'
                : 'text-[#E4F0F6]/50 hover:text-[#E4F0F6]'
            )}
          >
            {m === 'passphrase' ? 'Passphrase' : m === 'pin' ? 'PIN' : 'Password'}
          </button>
        ))}
      </div>

      {/* Output card */}
      <div className="relative rounded-2xl border border-[#E4F0F6]/10 bg-[#E4F0F6]/[0.03] p-5 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <p
            className={clsx(
              'flex-1 font-mono text-lg break-all text-[#E4F0F6] transition-opacity duration-200',
              isAnimating ? 'opacity-0' : 'opacity-100'
            )}
          >
            {output || '—'}
          </p>
          <button
            aria-label="Regenerate"
            onClick={generate}
            className="shrink-0 p-2 rounded-lg text-[#E4F0F6]/40 hover:text-[#E4F0F6] hover:bg-[#E4F0F6]/10 transition-colors"
          >
            <RefreshCw size={16} />
          </button>
          <button
            aria-label="Copy password"
            onClick={handleMainCopy}
            className="shrink-0 p-2 rounded-lg text-[#E4F0F6]/40 hover:text-[#E4F0F6] hover:bg-[#E4F0F6]/10 transition-colors"
          >
            {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
          </button>
        </div>

        {/* Strength bar (password mode only) */}
        {mode === 'password' && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#E4F0F6]/40">Strength</span>
              <span className={clsx('font-medium', strengthCfg.color)}>{strengthCfg.label}</span>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-1 flex-1 rounded-full transition-all duration-300"
                  style={{ backgroundColor: i <= strengthCfg.bars ? barColor : 'rgba(228,240,246,0.1)' }}
                />
              ))}
            </div>
          </div>
        )}

        {/* HIBP check */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleHibp}
            disabled={hibpLoading || !output}
            className="gap-2 text-xs border-[#E4F0F6]/20 bg-transparent text-[#E4F0F6]/60 hover:text-[#E4F0F6] hover:bg-[#E4F0F6]/10 hover:border-[#E4F0F6]/30"
          >
            {hibpLoading ? <Loader2 size={12} className="animate-spin" /> : <Shield size={12} />}
            Check breach
          </Button>
          {hibpResult && (
            <span className={clsx('text-xs flex items-center gap-1', hibpResult.breached ? 'text-red-400' : 'text-green-400')}>
              {hibpResult.breached
                ? <><AlertTriangle size={12} /> Breached {hibpResult.count.toLocaleString()}×</>
                : <><Check size={12} /> Not found</>}
            </span>
          )}
        </div>
      </div>

      {/* Password-mode controls */}
      {mode === 'password' && (
        <div className="flex flex-col gap-5">
          {/* Length stepper */}
          <div className="flex flex-col gap-2.5">
            <span className="text-sm text-[#E4F0F6]/60">Length</span>
            <div className="flex items-center gap-2 rounded-2xl border border-[#E4F0F6]/10 bg-[#E4F0F6]/[0.03] p-1">
              <button
                onClick={() => { setLength(v => Math.max(4, v - 1)); setActivePreset(null); }}
                aria-label="Decrease length"
                className="h-9 w-9 rounded-xl bg-[#E4F0F6]/[0.05] text-[#E4F0F6]/60 hover:text-[#E4F0F6] hover:bg-[#E4F0F6]/10 transition-colors flex items-center justify-center text-xl leading-none select-none"
              >
                −
              </button>
              <span className="flex-1 text-center font-mono text-xl font-bold text-[#E4F0F6] tabular-nums select-none">
                {length}
              </span>
              <button
                onClick={() => { setLength(v => Math.min(64, v + 1)); setActivePreset(null); }}
                aria-label="Increase length"
                className="h-9 w-9 rounded-xl bg-[#E4F0F6]/[0.05] text-[#E4F0F6]/60 hover:text-[#E4F0F6] hover:bg-[#E4F0F6]/10 transition-colors flex items-center justify-center text-xl leading-none select-none"
              >
                +
              </button>
            </div>
            <div className="h-px w-full rounded-full bg-[#E4F0F6]/10">
              <div
                className="h-full rounded-full bg-[#E4F0F6]/35 transition-all duration-150"
                style={{ width: `${((length - 4) / (64 - 4)) * 100}%` }}
              />
            </div>
          </div>

          {/* Character set toggles */}
          <div className="grid grid-cols-2 gap-2">
            {TOGGLES.map(({ key, label, description }) => (
              <label
                key={key}
                className="flex items-center gap-3 rounded-xl border border-[#E4F0F6]/10 bg-[#E4F0F6]/[0.03] px-4 py-3 cursor-pointer hover:bg-[#E4F0F6]/[0.06] transition-colors"
              >
                <Checkbox
                  checked={options[key]}
                  onCheckedChange={(checked) => handleToggle(key, !!checked)}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-[#E4F0F6]">{label}</span>
                  <span className="text-xs text-[#E4F0F6]/40 font-mono">{description}</span>
                </div>
              </label>
            ))}
          </div>

          {/* Presets */}
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <Button
                key={preset.id}
                variant="outline"
                size="sm"
                onClick={() => applyPreset(preset)}
                className={clsx(
                  'text-xs border-[#E4F0F6]/20 transition-colors',
                  activePreset === preset.id
                    ? 'bg-[#E4F0F6] text-[#0A0F1E] border-[#E4F0F6]'
                    : 'bg-transparent text-[#E4F0F6]/60 hover:text-[#E4F0F6] hover:bg-[#E4F0F6]/10'
                )}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Passphrase-mode controls */}
      {mode === 'passphrase' && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2.5">
            <span className="text-sm text-[#E4F0F6]/60">Words</span>
            <div className="flex items-center gap-2 rounded-2xl border border-[#E4F0F6]/10 bg-[#E4F0F6]/[0.03] p-1">
              <button
                onClick={() => setWordCount(v => Math.max(2, v - 1))}
                aria-label="Decrease word count"
                className="h-9 w-9 rounded-xl bg-[#E4F0F6]/[0.05] text-[#E4F0F6]/60 hover:text-[#E4F0F6] hover:bg-[#E4F0F6]/10 transition-colors flex items-center justify-center text-xl leading-none select-none"
              >
                −
              </button>
              <span className="flex-1 text-center font-mono text-xl font-bold text-[#E4F0F6] tabular-nums select-none">
                {wordCount}
              </span>
              <button
                onClick={() => setWordCount(v => Math.min(8, v + 1))}
                aria-label="Increase word count"
                className="h-9 w-9 rounded-xl bg-[#E4F0F6]/[0.05] text-[#E4F0F6]/60 hover:text-[#E4F0F6] hover:bg-[#E4F0F6]/10 transition-colors flex items-center justify-center text-xl leading-none select-none"
              >
                +
              </button>
            </div>
            <div className="h-px w-full rounded-full bg-[#E4F0F6]/10">
              <div
                className="h-full rounded-full bg-[#E4F0F6]/35 transition-all duration-150"
                style={{ width: `${((wordCount - 2) / (8 - 2)) * 100}%` }}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm text-[#E4F0F6]/60">Separator</span>
            <div className="flex gap-2 flex-wrap">
              {SEPARATORS.map((sep) => (
                <button
                  key={sep}
                  onClick={() => setSeparator(sep)}
                  className={clsx(
                    'w-10 h-10 rounded-lg border text-sm font-mono transition-colors',
                    separator === sep
                      ? 'bg-[#E4F0F6] text-[#0A0F1E] border-[#E4F0F6]'
                      : 'bg-transparent text-[#E4F0F6]/50 border-[#E4F0F6]/20 hover:text-[#E4F0F6] hover:bg-[#E4F0F6]/10'
                  )}
                >
                  {sep === ' ' ? '·' : sep}
                </button>
              ))}
              <Input
                value={SEPARATORS.includes(separator) ? '' : separator}
                onChange={(e) => setSeparator(e.target.value)}
                placeholder="custom"
                maxLength={3}
                className="w-24 text-sm font-mono bg-transparent border-[#E4F0F6]/20 text-[#E4F0F6] placeholder:text-[#E4F0F6]/30 focus-visible:ring-[#E4F0F6]/30"
              />
            </div>
          </div>
        </div>
      )}

      {/* PIN-mode controls */}
      {mode === 'pin' && (
        <div className="flex flex-col gap-3">
          <span className="text-sm text-[#E4F0F6]/60">PIN length</span>
          <div className="flex gap-2">
            {PIN_LENGTHS.map((pl) => (
              <button
                key={pl}
                onClick={() => setPinLength(pl)}
                className={clsx(
                  'flex-1 py-2.5 rounded-xl border text-sm font-mono font-medium transition-colors',
                  pinLength === pl
                    ? 'bg-[#E4F0F6] text-[#0A0F1E] border-[#E4F0F6]'
                    : 'bg-transparent text-[#E4F0F6]/50 border-[#E4F0F6]/20 hover:text-[#E4F0F6] hover:bg-[#E4F0F6]/10'
                )}
              >
                {pl}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* History */}
      <div className="flex flex-col gap-2">
        <button
          onClick={() => setShowHistory((v) => !v)}
          className="flex items-center justify-between w-full text-sm text-[#E4F0F6]/40 hover:text-[#E4F0F6]/70 transition-colors"
        >
          <span>History ({history.length})</span>
          <ChevronDown size={14} className={clsx('transition-transform duration-200', showHistory && 'rotate-180')} />
        </button>
        {showHistory && history.length > 0 && (
          <div className="flex flex-col gap-0 rounded-xl border border-[#E4F0F6]/10 overflow-hidden">
            {history.map((pw, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#E4F0F6]/[0.04] transition-colors"
              >
                <span className="flex-1 font-mono text-sm text-[#E4F0F6]/70 truncate">{pw}</span>
                <button
                  onClick={() => handleCopy(pw, () => {
                    setCopiedHistIdx(idx);
                    setTimeout(() => setCopiedHistIdx(null), 2000);
                  })}
                  className="shrink-0 p-1.5 rounded-lg text-[#E4F0F6]/30 hover:text-[#E4F0F6] hover:bg-[#E4F0F6]/10 transition-colors"
                >
                  {copiedHistIdx === idx
                    ? <Check size={12} className="text-green-400" />
                    : <Copy size={12} />}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bulk generator */}
      <div className="flex flex-col gap-2">
        <button
          onClick={() => setShowBulk((v) => !v)}
          className="flex items-center justify-between w-full text-sm text-[#E4F0F6]/40 hover:text-[#E4F0F6]/70 transition-colors"
        >
          <span>Bulk generate</span>
          <ChevronDown size={14} className={clsx('transition-transform duration-200', showBulk && 'rotate-180')} />
        </button>
        {showBulk && (
          <div className="flex flex-col gap-3 rounded-xl border border-[#E4F0F6]/10 p-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#E4F0F6]/60 shrink-0">Count</span>
              <Input
                type="number"
                value={bulkCount}
                onChange={(e) => setBulkCount(Math.max(1, Math.min(50, Number(e.target.value))))}
                min={1}
                max={50}
                className="w-24 text-sm bg-transparent border-[#E4F0F6]/20 text-[#E4F0F6] focus-visible:ring-[#E4F0F6]/30"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkGenerate}
                className="border-[#E4F0F6]/20 bg-transparent text-[#E4F0F6]/60 hover:text-[#E4F0F6] hover:bg-[#E4F0F6]/10 text-xs"
              >
                Generate
              </Button>
            </div>
            {bulkPasswords.length > 0 && (
              <div className="flex flex-col gap-0.5 max-h-48 overflow-y-auto">
                {bulkPasswords.map((pw, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#E4F0F6]/[0.04] transition-colors"
                  >
                    <span className="flex-1 font-mono text-xs text-[#E4F0F6]/70 truncate">{pw}</span>
                    <button
                      onClick={() => handleCopy(pw, () => {
                        setCopiedBulkIdx(idx);
                        setTimeout(() => setCopiedBulkIdx(null), 2000);
                      })}
                      className="shrink-0 p-1 rounded text-[#E4F0F6]/30 hover:text-[#E4F0F6] transition-colors"
                    >
                      {copiedBulkIdx === idx
                        ? <Check size={10} className="text-green-400" />
                        : <Copy size={10} />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
