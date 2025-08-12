import React, { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Sparkles, Shuffle, CheckCircle2, XCircle, RotateCcw, Info, Play, Pause, ArrowRight, Settings2, Eye, Coins } from "lucide-react";

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const toFixed = (n, dp = 3) => Number.parseFloat(n).toFixed(dp);
const mag = (v) => Math.hypot(v[0], v[1]);
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
const scalarMul = (s, v) => [s * v[0], s * v[1]];
const projOfAOntoB = (a, b) => {
  const denom = dot(b, b);
  if (denom === 0) return [0, 0];
  return scalarMul(dot(a, b) / denom, b);
};
const angleBetween = (a, b) => {
  const d = dot(a, b);
  const m = mag(a) * mag(b);
  if (m === 0) return NaN;
  return Math.acos(clamp(d / m, -1, 1));
};
const unit = (v) => {
  const m = mag(v);
  if (m === 0) return [0, 0];
  return [v[0] / m, v[1] / m];
};

function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium tracking-wide backdrop-blur">{children}</span>
  );
}

function Card({ children, className = "" }) {
  return <div className={`rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-xl ${className}`}>{children}</div>;
}

function PrettyFormula({ tex }) {
  return <code className="rounded-xl bg-black/30 px-2 py-1 font-mono text-sm">{tex}</code>;
}

function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);
  return [value, setValue];
}

function Header({ coins, setCoins, ownedItems, setOwnedItems, activeBoosts, setActiveBoosts }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showStore, setShowStore] = useState(false);
  const [tooltipActive, setTooltipActive] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const tooltipHideTimeout = useRef(null);

   
  const handlePurchase = (itemName, price) => {
    if (coins >= price) {
      setCoins(c => c - price);
      
      // Update boost if it's a boost item
      if (itemName === "XP Boost") {
        setActiveBoosts(prev => ({
          ...prev,
          xpBoost: { 
            level: prev.xpBoost.level + 1, 
            multiplier: prev.xpBoost.multiplier + 0.05 
          }
        }));
      } else if (itemName === "Coins Boost") {
        setActiveBoosts(prev => ({
          ...prev,
          coinsBoost: { 
            level: prev.coinsBoost.level + 1, 
            multiplier: prev.coinsBoost.multiplier + 0.05 
          }
        }));
      } else {
        // For non-boost items, just add them to owned items (no logic implemented yet)
        setOwnedItems(prev => [...prev, itemName]);
      }
    }
  };

  const isOwned = (itemName) => ownedItems.includes(itemName);
   
  return (
    <div className="px-8 pt-6 header-container">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center"><Sparkles className="h-5 w-5" /></div>
          <div className="text-lg font-semibold tracking-tight">MathWeb</div>
        </div>
        
        {/* Subject Navigation Bar - centered between logo and account */}
        <nav className="flex items-center -mt-1 nav-items custom-nav-gap">
          {[
            { key: "2d-vectors", label: "2D Vectors", current: true },
            { key: "3d-vectors", label: "3D Vectors", current: false },
            { key: "calculus", label: "Calculus", current: false },
            { key: "linear-algebra", label: "Linear Algebra", current: false },
            { key: "statistics", label: "Statistics", current: false }
          ].map((subject) => (
            <button
              key={subject.key}
              className={`relative text-sm font-medium transition-colors pb-1 ${
                subject.current 
                  ? "text-white" 
                  : "text-white/60 hover:text-white/80"
              }`}
            >
              {subject.label}
              {subject.current && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />
              )}
            </button>
          ))}
        </nav>
        
        <div className="flex items-center gap-3">
                     {/* Money/Coins Icon for Store */}
           <button 
             onClick={() => setShowStore(true)}
             className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs hover:bg-white/10 transition-colors"
           >
             <Coins className="w-4 h-4 text-yellow-400" />
             <span className="text-yellow-400 font-medium">{coins.toLocaleString()}</span>
           </button>
           
                                               {/* Active Boosts Indicator */}
             <div className="relative">
               <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                 activeBoosts.xpBoost.level > 0 || activeBoosts.coinsBoost.level > 0
                   ? "bg-purple-400/20 border border-purple-400/40 text-purple-400"
                   : "bg-white/10 border border-white/20 text-white/60"
               }`}
                 onMouseEnter={() => {
                   setTooltipActive(true);
                   if (tooltipHideTimeout.current) {
                     clearTimeout(tooltipHideTimeout.current);
                   }
                 }}
                 onMouseLeave={() => {
                   tooltipHideTimeout.current = setTimeout(() => {
                     setTooltipActive(false);
                   }, 1000);
                 }}
               >
                 <Sparkles className="w-3 h-3" />
                 {activeBoosts.xpBoost.level > 0 || activeBoosts.coinsBoost.level > 0 ? "BOOSTS ACTIVE" : "NO BOOSTS"}
               </div>
               
               {/* Hover Tooltip */}
               <div className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-fit min-w-[140px] rounded-lg border border-white/20 bg-white/10 backdrop-blur-md shadow-xl transition-opacity duration-200 z-50 ${
                 tooltipActive ? 'opacity-100' : 'opacity-0'
               }`}
                 onMouseEnter={() => {
                   if (tooltipHideTimeout.current) {
                     clearTimeout(tooltipHideTimeout.current);
                   }
                 }}
                 onMouseLeave={() => {
                   setTooltipActive(false);
                 }}
               >
                 <div className="py-1">
                   <div className="px-3 py-2 text-xs text-center text-purple-400 font-medium border-b border-white/10">Active Boosts</div>
                   <div className="px-3 py-2 text-xs hover:bg-white/10 transition-colors">
                     <span>⭐ XP: </span>
                     <span className={activeBoosts.xpBoost.level > 0 ? "text-purple-400 font-medium" : "text-white/60"}>
                       {activeBoosts.xpBoost.level > 0 ? `+${((activeBoosts.xpBoost.multiplier - 1) * 100).toFixed(0)}%` : "0%"}
                     </span>
                   </div>
                   <div className="px-3 py-2 text-xs hover:bg-white/10 transition-colors">
                     <span>🪙 Coins: </span>
                     <span className={activeBoosts.coinsBoost.level > 0 ? "text-purple-400 font-medium" : "text-white/60"}>
                       {activeBoosts.coinsBoost.level > 0 ? `+${((activeBoosts.coinsBoost.multiplier - 1) * 100).toFixed(0)}%` : "0%"}
                     </span>
                   </div>
                 </div>
               </div>
             </div>
          
          {/* Account Button */}
          <div className="relative">
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs hover:bg-white/10 transition-colors"
            >
              <span>Your Account</span>
              <svg className={`w-3 h-3 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showDropdown && (
              <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-fit min-w-[120%] rounded-lg border border-white/20 bg-white/10 backdrop-blur-md shadow-xl z-50">
                <div className="py-1">
                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors">
                    Account Details
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors">
                    Settings
                  </button>
                  <div className="border-t border-white/10 my-1"></div>
                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors text-red-300">
                    Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Mobile Hamburger Menu Button */}
          <button
            className="hamburger-menu md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <div className={`hamburger-button ${isMobileMenuOpen ? 'open' : ''}`}>
              <div className="hamburger-line"></div>
              <div className="hamburger-line"></div>
              <div className="hamburger-line"></div>
            </div>
          </button>
        </div>
      </div>

      {/* Store Overlay */}
      <AnimatePresence>
        {showStore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
            onClick={() => setShowStore(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-2xl mx-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
                             {/* Header */}
               <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-3">
                   <Coins className="w-6 h-6 text-purple-400" />
                   <h2 className="text-xl font-semibold">Math Store</h2>
                 </div>
                 <button 
                   onClick={() => setShowStore(false)}
                   className="text-white/60 hover:text-white transition-colors"
                 >
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                   </svg>
                 </button>
               </div>

               {/* Balance */}
               <div className="mb-6 p-4 bg-purple-400/10 border border-purple-400/20 rounded-xl">
                 <div className="text-center">
                   <div className="text-sm text-purple-400/80 mb-1">Your Balance</div>
                   <div className="text-2xl font-bold text-purple-400">{coins.toLocaleString()} coins</div>
                 </div>
               </div>

              {/* Store Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                                   {[
                                         { name: "XP Boost", description: `+5% XP (Level ${activeBoosts.xpBoost.level})`, price: Math.floor(150 * Math.pow(1.1, activeBoosts.xpBoost.level)), icon: "⭐", boostType: "xpBoost" },
                     { name: "Coins Boost", description: `+5% Coins (Level ${activeBoosts.coinsBoost.level})`, price: Math.floor(150 * Math.pow(1.1, activeBoosts.coinsBoost.level)), icon: "🪙", boostType: "coinsBoost" },
                    { name: "Custom Themes", description: "Unlock new color schemes", price: 200, icon: "🎨" },
                    { name: "Advanced Stats", description: "Detailed progress analytics", price: 400, icon: "📊" },
                    { name: "Study Reminders", description: "Daily practice notifications", price: 150, icon: "⏰" },
                    { name: "Premium Support", description: "Priority help & feedback", price: 1000, icon: "⭐" }
                                    ].map((item, index) => {
                    const hasBoost = item.boostType && activeBoosts[item.boostType]?.level > 0;
                    const isOwned = !item.boostType && ownedItems.includes(item.name);
                    return (
                                             <div key={index} className={`p-4 border rounded-xl transition-colors ${
                         hasBoost || isOwned
                           ? "border-purple-400/40 bg-purple-400/10" 
                           : "border-white/20 bg-white/5 hover:bg-white/10"
                       }`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="text-2xl">{item.icon}</div>
                          <div className="flex items-center gap-2">
                                                         {hasBoost && (
                               <div className="px-2 py-1 bg-yellow-400/20 border border-yellow-400/40 rounded text-xs text-yellow-400 font-medium">
                                 +{((activeBoosts[item.boostType].multiplier - 1) * 100).toFixed(0)}%
                               </div>
                             )}
                                                         {isOwned && (
                               <div className="px-2 py-1 bg-purple-400/20 border border-purple-400/40 rounded text-xs text-purple-400 font-medium">
                                 OWNED
                               </div>
                             )}
                                                         <div className="font-semibold text-purple-400">
                               {isOwned ? "" : item.price}
                             </div>
                          </div>
                        </div>
                        <div className="font-semibold mb-1">{item.name}</div>
                        <div className="text-sm text-white/60 mb-3">{item.description}</div>
                        {!isOwned ? (
                          <button 
                            className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                              coins >= item.price 
                                ? "bg-purple-400/20 border border-purple-400/40 text-purple-400 hover:bg-purple-400/30" 
                                : "bg-white/10 border border-white/20 text-white/40 cursor-not-allowed"
                            }`}
                            disabled={coins < item.price}
                            onClick={() => handlePurchase(item.name, item.price)}
                          >
                            {coins >= item.price ? "Purchase" : "Not enough coins"}
                          </button>
                        ) : (
                                                     <div className="w-full py-2 px-3 rounded-lg text-sm font-medium text-center text-purple-400 bg-purple-400/20 border border-purple-400/40">
                             ✓ Owned
                           </div>
                        )}
                      </div>
                    );
                  })}
              </div>

                                                                           {/* Active Boosts Status */}
                 <div className="mb-6 p-4 bg-purple-400/10 border border-purple-400/20 rounded-xl">
                   <div className="text-center">
                     <div className="text-sm text-purple-400/80 mb-2 font-semibold">Active Boosts</div>
                     <div className="space-y-2">
                       {activeBoosts.xpBoost.level > 0 ? (
                         <div className="flex items-center justify-center gap-2 text-sm">
                           <span>⭐ XP Boost:</span>
                           <span className="text-purple-400 font-medium">
                             Level {activeBoosts.xpBoost.level} ({((activeBoosts.xpBoost.multiplier - 1) * 100).toFixed(0)}% bonus)
                           </span>
                         </div>
                       ) : (
                         <div className="text-sm text-white/60">No XP boost active</div>
                       )}
                       {activeBoosts.coinsBoost.level > 0 ? (
                         <div className="flex items-center justify-center gap-2 text-sm">
                           <span>🪙 Coins Boost:</span>
                           <span className="text-purple-400 font-medium">
                             Level {activeBoosts.coinsBoost.level} ({((activeBoosts.coinsBoost.multiplier - 1) * 100).toFixed(0)}% bonus)
                           </span>
                         </div>
                       ) : (
                         <div className="text-sm text-white/60">No coins boost active</div>
                       )}
                     </div>
                   </div>
                 </div>

               {/* Footer */}
               <div className="text-center text-sm text-white/60">
                 More items coming soon! Save your coins for future releases.
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Mobile Navigation Slide-out Panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mobile-nav-backdrop"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Slide-out menu */}
            <motion.div
              initial={{ right: -300 }}
              animate={{ right: 0 }}
              exit={{ right: -300 }}
              transition={{ duration: 0.3 }}
              className="mobile-nav-menu open"
            >
              {/* Menu header */}
              <div className="mobile-nav-header">
                <h3 className="mobile-nav-title">Navigation</h3>
                <button
                  className="mobile-nav-close"
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Close mobile menu"
                >
                  ×
                </button>
              </div>
              
              {/* Navigation items */}
              <nav className="mobile-nav-items">
                {[
                  { key: "2d-vectors", label: "2D Vectors", current: true },
                  { key: "3d-vectors", label: "3D Vectors", current: false },
                  { key: "calculus", label: "Calculus", current: false },
                  { key: "linear-algebra", label: "Linear Algebra", current: false },
                  { key: "statistics", label: "Statistics", current: false }
                ].map((subject) => (
                  <a
                    key={subject.key}
                    href={`#${subject.key}`}
                    className={`${subject.current ? 'active' : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {subject.label}
                  </a>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function VectorCanvas({ vectors, conceptKey }) {
  const vb = { w: 480, h: 360 };
  const world = 8;
  const cx = vb.w / 2;
  const cy = vb.h / 2;
  const scale = vb.w / (world * 2);
  const toX = (x) => cx + x * scale;
  const toY = (y) => cy - y * scale;
  
  // Clamp vector coordinates to stay within the visible coordinate system
  // Account for arrowhead size to ensure the entire arrow is visible
  const clampVector = (vec) => {
    if (!vec) return vec;
    const arrowheadSize = 12;
    const margin = 8;
    const maxCoord = world - (arrowheadSize / scale) - (margin / scale);
    return [clamp(vec[0], -maxCoord, maxCoord), clamp(vec[1], -maxCoord, maxCoord)];
  };
  
  const gridLines = [];
  for (let i = -world; i <= world; i++) gridLines.push(i);
  const items = [];
  if (!vectors) vectors = {};
  if (vectors.v) items.push({ key: "v", value: clampVector(vectors.v), label: "v" });
  if (vectors.a) items.push({ key: "a", value: clampVector(vectors.a), label: "a" });
  if (vectors.b) items.push({ key: "b", value: clampVector(vectors.b), label: "b" });
  let extra = [];
  if (conceptKey === "distance" && vectors.a && vectors.b) {
    const diff = sub(vectors.b, vectors.a);
    extra.push({ key: "b-a", value: clampVector(diff), label: "B−A", dashed: true });
  }
  if (conceptKey === "projection" && vectors.a && vectors.b) {
    const p = projOfAOntoB(vectors.a, vectors.b);
    extra.push({ key: "proj", value: clampVector(p), label: "proj", dashed: true });
  }
  const Arrow = ({ vec, label, dashed, originalVec }) => {
    const [x, y] = vec;
    const x1 = toX(0), y1 = toY(0);
    const x2 = toX(x), y2 = toY(y);
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    const ux = dx / (len || 1), uy = dy / (len || 1);
    
    // Calculate arrowhead points with proper sizing
    const arrowheadSize = 12;
    const arrowheadWidth = 6;
    
    // Ensure the arrowhead is always visible by adjusting the tip position
    // if it's too close to the edge
    const margin = arrowheadSize + 5;
    let tipX = clamp(x2, margin, vb.w - margin);
    let tipY = clamp(y2, margin, vb.h - margin);
    
    // Calculate arrowhead triangle points
    const leftX = tipX - ux * arrowheadSize - uy * arrowheadWidth;
    const leftY = tipY - uy * arrowheadSize + ux * arrowheadWidth;
    const rightX = tipX - ux * arrowheadSize + uy * arrowheadWidth;
    const rightY = tipY - uy * arrowheadSize - ux * arrowheadWidth;
    
    // Check if vector was clamped (original coordinates outside bounds)
    const wasClamped = originalVec && (
      Math.abs(originalVec[0]) >= world || 
      Math.abs(originalVec[1]) >= world
    );
    
    // Adjust label position to stay within SVG bounds
    const labelX = Math.max(10, Math.min(vb.w - 30, tipX + 6));
    const labelY = Math.max(10, Math.min(vb.h - 10, tipY - 6));
    
    return (
      <g>
        <line x1={x1} y1={y1} x2={tipX} y2={tipY} stroke="white" strokeOpacity={0.9} strokeWidth={2} strokeDasharray={dashed ? "6 6" : undefined} />
        <polygon points={`${tipX},${tipY} ${leftX},${leftY} ${rightX},${rightY}`} fill="white" fillOpacity={0.9} />
                 <text x={labelX} y={labelY} fontSize={10} fill="white" fillOpacity={0.8}>{label}</text>
      </g>
    );
  };
  return (
    <Card className="p-0 overflow-hidden">
             <div className="border-b border-white/10 px-4 py-3 flex items-center gap-2 text-xs opacity-80">
         <Eye className="h-4 w-4" /> Live visualization
       </div>
      <svg width="100%" viewBox={`0 0 ${vb.w} ${vb.h}`} className="block">
        <defs>
          <radialGradient id="g1" cx="50%" cy="20%" r="70%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width={vb.w} height={vb.h} fill="url(#g1)" />
        {gridLines.map((i) => (<line key={`gx${i}`} x1={toX(i)} y1={0} x2={toX(i)} y2={vb.h} stroke="white" strokeOpacity={0.06} />))}
        {gridLines.map((i) => (<line key={`gy${i}`} x1={0} y1={toY(i)} x2={vb.w} y2={toY(i)} stroke="white" strokeOpacity={0.06} />))}
        <line x1={0} y1={cy} x2={vb.w} y2={cy} stroke="white" strokeOpacity={0.2} />
        <line x1={cx} y1={0} x2={cx} y2={vb.h} stroke="white" strokeOpacity={0.2} />
        {items.map((it) => (<Arrow key={it.key} vec={it.value} label={it.label} dashed={false} originalVec={vectors[it.key]} />))}
        {extra.map((it) => (<Arrow key={it.key} vec={it.value} label={it.label} dashed={true} originalVec={it.key === "b-a" ? sub(vectors.b, vectors.a) : projOfAOntoB(vectors.a, vectors.b)} />))}
      </svg>
    </Card>
  );
}

function Flashcard({ front, back, flipped, onFlip, showVis }) {
  return (
    <div className="relative w-full [perspective:1200px]" style={{ height: 'calc(100% - 2rem)' }} onClick={onFlip}>
      <AnimatePresence initial={false} mode="wait">
        <motion.div key={flipped ? "back" : "front"} initial={{ rotateY: flipped ? -180 : 180, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} exit={{ rotateY: flipped ? 180 : -180, opacity: 0 }} transition={{ duration: 0.5 }} className="absolute inset-0 rounded-2xl border border-white/20 bg-white/10 p-6 will-change-transform [backface-visibility:hidden]">{flipped ? back : front}</motion.div>
      </AnimatePresence>
    </div>
  );
}

const CONCEPTS = [
  {
    key: "magnitude",
    title: "Length / Magnitude",
    icon: <Sparkles className="h-5 w-5" />,
    explainer: {
      idea: "For v = (x, y), the length is |v| = sqrt(x^2 + y^2).",
      steps: ["Square each component.", "Add the squares.", "Take the square root."],
      formula: "|v| = sqrt(x^2 + y^2)",
      example: "v = (3, 4) → |v| = √(3² + 4²) = √(9 + 16) = √25 = 5",
      proTips: [
        "The magnitude is always positive (or zero)",
        "Think of it as the distance from origin to the point",
        "Useful for normalizing vectors to unit length"
      ]
    },
    generator: () => {
      const v = [rnd(-7, 7), rnd(-7, 7)];
      return { question: `Find the length of v = (${v.join(", ")}). Round to 3 decimals.`, vectors: { v }, answer: toFixed(mag(v)), check: (user) => toFixed(user) === toFixed(mag(v)) };
    },
  },
  {
    key: "distance",
    title: "Distance (A to B)",
    icon: <ArrowRight className="h-5 w-5" />,
    explainer: {
      idea: "Distance from A to B is the length of B − A in 2D.",
      steps: ["Compute B − A.", "Find the magnitude of B − A."],
      formula: "d(A,B) = |B - A|",
      example: "A = (1, 2), B = (4, 6) → B−A = (3, 4) → d = √(3² + 4²) = 5",
      proTips: [
        "Distance is commutative: d(A,B) = d(B,A)",
        "The vector B−A points from A to B",
        "Useful in physics for displacement calculations"
      ]
    },
    generator: () => {
      const a = [rnd(-6, 6), rnd(-6, 6)];
      const b = [rnd(-6, 6), rnd(-6, 6)];
      return { question: `Find the distance from A = (${a.join(", ")}) to B = (${b.join(", ")}), 3 dp.`, vectors: { a, b }, answer: toFixed(mag(sub(b, a))), check: (user) => toFixed(user) === toFixed(mag(sub(b, a))) };
    },
  },
  {
    key: "dot",
    title: "Dot Product",
    icon: <Info className="h-5 w-5" />,
    explainer: {
      idea: "For a = (x1, y1), b = (x2, y2): a · b = x1x2 + y1y2.",
      steps: ["Multiply component-wise.", "Add the results."],
      formula: "a · b = x1x2 + y1y2",
      example: "a = (2, 3), b = (4, 1) → a·b = 2×4 + 3×1 = 8 + 3 = 11",
      proTips: [
        "Dot product is commutative: a·b = b·a",
        "a·b = |a||b|cos(θ) where θ is the angle between vectors",
        "Zero dot product means vectors are perpendicular"
      ]
    },
    generator: () => {
      const a = [rnd(-5, 5), rnd(-5, 5)];
      const b = [rnd(-5, 5), rnd(-5, 5)];
      return { question: `Compute a · b for a = (${a.join(", ")}), b = (${b.join(", ")}).`, vectors: { a, b }, answer: String(dot(a, b)), check: (user) => Number(user) === dot(a, b) };
    },
  },
  {
    key: "angle",
    title: "Angle Between",
    icon: <BookOpen className="h-5 w-5" />,
    explainer: {
      idea: "Use cos θ = (a · b)/(|a||b|).",
      steps: ["Compute a · b.", "Compute |a| and |b|.", "Divide and take arccos."],
      formula: "θ = arccos((a · b)/(|a||b|))",
      example: "a = (1, 0), b = (0, 1) → a·b = 0, |a| = 1, |b| = 1 → θ = arccos(0) = 90°",
      proTips: [
        "Result is always between 0° and 180°",
        "Parallel vectors: θ = 0° (cos θ = 1)",
        "Perpendicular vectors: θ = 90° (cos θ = 0)"
      ]
    },
    generator: () => {
      const a = [rnd(-5, 5), rnd(-5, 5)];
      const b = [rnd(-5, 5), rnd(-5, 5)];
      const theta = angleBetween(a, b);
      return { question: `Find the angle between a = (${a.join(", ")}) and b = (${b.join(", ")}) in degrees, 1 dp.`, vectors: { a, b }, answer: toFixed((theta * 180) / Math.PI, 1), check: (user) => toFixed(user, 1) === toFixed((theta * 180) / Math.PI, 1) };
    },
  },
  {
    key: "projection",
    title: "Projection",
    icon: <ArrowRight className="h-5 w-5" />,
    explainer: {
      idea: "Projection of a onto b is (a·b/|b|^2) b.",
      steps: ["Compute a·b.", "Divide by |b|^2.", "Scale vector b."],
      formula: "proj_b(a) = (a·b/|b|^2)b",
      example: "a = (3, 4), b = (1, 0) → a·b = 3, |b|² = 1 → proj = (3/1)(1, 0) = (3, 0)",
      proTips: [
        "Projection gives the component of a in the direction of b",
        "Result is always parallel to vector b",
        "Useful for decomposing vectors into components"
      ]
    },
    generator: () => {
      const a = [rnd(-6, 6), rnd(-6, 6)];
      const b = [rnd(-6, 6), rnd(-6, 6)];
      const p = projOfAOntoB(a, b).map((x) => toFixed(x));
      return { question: `Find proj_b(a) for a = (${a.join(", ")}), b = (${b.join(", ")}). Round components to 3 dp.`, vectors: { a, b }, answer: `(${p.join(", ")})`, check: (user) => { const parsed = user.replace(/[()\[\]\s]/g, "").split(",").filter(Boolean).map(Number).map((x) => toFixed(x)); return parsed.join(",") === p.join(","); } };
    },
  },
  {
    key: "unit",
    title: "Unit Vector",
    icon: <Settings2 className="h-5 w-5" />,
    explainer: {
      idea: "A unit vector has length 1. For v = (x, y), make v/|v|.",
      steps: ["Compute |v|.", "Divide each component by |v|."],
      formula: "v̂ = v/|v|",
      example: "v = (6, 8) → |v| = √(6² + 8²) = 10 → v̂ = (6/10, 8/10) = (0.6, 0.8)",
      proTips: [
        "Unit vectors preserve direction but have length 1",
        "Useful for representing directions without magnitude",
        "Any vector can be written as |v| × v̂"
      ]
    },
    generator: () => {
      const v = [rnd(-6, 6), rnd(-6, 6)];
      const u = unit(v).map((x) => toFixed(x));
      return { question: `Find the unit vector in the direction of v = (${v.join(", ")}). 3 dp.`, vectors: { v }, answer: `(${u.join(", ")})`, check: (user) => { const parsed = user.replace(/[()\[\]\s]/g, "").split(",").filter(Boolean).map(Number).map((x) => toFixed(x)); return parsed.join(",") === u.join(","); } };
    },
  },
];

function ConceptPicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 concept-grid">
      {CONCEPTS.map((c) => (
        <button key={c.key} onClick={() => onChange(c.key)} className={`group flex items-center gap-3 rounded-xl border p-3 text-left transition ${value === c.key ? "border-white/30 bg-white/15" : "border-white/10 bg-white/5 hover:bg-white/10"}`}>
          <div className="rounded-lg bg-white/10 p-2">{c.icon}</div>
          <div>
            <div className="text-sm font-semibold">{c.title}</div>
            <div className="text-xs opacity-70">Tap to study & practice</div>
          </div>
        </button>
      ))}
    </div>
  );
}

function Explainer({ concept, showVis }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentUtterance, setCurrentUtterance] = useState(null);
  const [textContent, setTextContent] = useState("");
  const [speechSupported, setSpeechSupported] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(null);

  // Check if speech synthesis is supported when component mounts
  useEffect(() => {
    console.log('Checking speech synthesis support...');
    console.log('window.speechSynthesis exists:', !!window.speechSynthesis);
    
    if (window.speechSynthesis) {
      console.log('Speech synthesis is supported');
      setSpeechSupported(true);
      
      // Load available voices and find "Mark"
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        console.log('Available voices:', voices.length);
        
        if (voices.length > 0) {
          // Try to find "Mark" voice
          const markVoice = voices.find(voice => 
            voice.name.includes('Mark') && voice.lang.startsWith('en')
          );
          
          if (markVoice) {
            setSelectedVoice(markVoice);
            console.log('Found Mark voice:', markVoice.name);
          } else {
            // Fallback to first English voice if Mark is not found
            const englishVoices = voices.filter(voice => voice.lang.startsWith('en'));
            if (englishVoices.length > 0) {
              setSelectedVoice(englishVoices[0]);
              console.log('Mark voice not found, using fallback:', englishVoices[0].name);
            }
          }
        }
      };
      
      // Load voices immediately if available
      loadVoices();
      
      // Some browsers load voices asynchronously, so listen for voiceschanged event
      window.speechSynthesis.onvoiceschanged = loadVoices;
      
      // Some browsers require user interaction before speech synthesis works
      // This is a common security feature
    } else {
      console.log('Speech synthesis is NOT supported');
      setSpeechSupported(false);
    }
  }, []);
  
  // Create a comprehensive text content for text-to-speech
  const createSpeechText = () => {
    const parts = [
      concept.title,
      concept.explainer.idea,
      "Steps: " + concept.explainer.steps.join(". "),
      concept.explainer.example && "Example: " + concept.explainer.example,
      concept.explainer.proTips && "Pro Tips: " + concept.explainer.proTips.join(". "),
      "Formula: " + concept.explainer.formula
    ].filter(Boolean);
    
    return parts.join(". ");
  };

  const handlePlayAudio = () => {
    console.log('Play button clicked!');
    console.log('isPlaying state:', isPlaying);
    console.log('speechSupported state:', speechSupported);
    console.log('window.speechSynthesis exists:', !!window.speechSynthesis);
    
    // Check if speech synthesis is available
    if (!window.speechSynthesis) {
      console.error('Speech synthesis not supported in this browser');
      alert('Text-to-speech is not supported in this browser. Please try Chrome, Edge, or Safari.');
      return;
    }

    if (isPlaying) {
      // Stop the speech immediately (no delay)
      try {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
        setCurrentUtterance(null);
        console.log('Speech stopped');
      } catch (error) {
        console.error('Error stopping speech:', error);
        setIsPlaying(false);
        setCurrentUtterance(null);
      }
    } else {
      // Start speaking
      try {
        // Cancel any existing speech first
        window.speechSynthesis.cancel();
        
        const newTextContent = createSpeechText();
        setTextContent(newTextContent);
        console.log('Text content created:', newTextContent.substring(0, 100) + '...');
        
        // Create speech synthesis utterance
        const utterance = new SpeechSynthesisUtterance(newTextContent);
        
        // Set voice if available
        if (selectedVoice) {
          utterance.voice = selectedVoice;
          console.log('Using voice:', selectedVoice.name);
        }
        
        utterance.rate = 0.9; // Slightly slower for better comprehension
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        
        // Add event listeners to track speech state
        utterance.onstart = () => {
          console.log('Speech started event fired');
          setIsPlaying(true);
        };
        utterance.onend = () => {
          console.log('Speech ended event fired');
          setIsPlaying(false);
          setCurrentUtterance(null);
        };
        utterance.onerror = (event) => {
          console.error('Speech error event fired:', event);
          setIsPlaying(false);
          setCurrentUtterance(null);
        };
        
        // Store the utterance reference
        setCurrentUtterance(utterance);
        
        // Set playing state immediately to provide instant feedback
        setIsPlaying(true);
        
        // Speak the text
        window.speechSynthesis.speak(utterance);
        console.log('Speech synthesis speak() called');
        
        // Fallback: if onstart doesn't fire within 500ms, assume it started
        setTimeout(() => {
          if (window.speechSynthesis.speaking && !isPlaying) {
            console.log('Fallback: setting isPlaying to true');
            setIsPlaying(true);
          }
        }, 500);
        
      } catch (error) {
        console.error('Error starting speech:', error);
        setIsPlaying(false);
        alert('Error starting text-to-speech. Please try again.');
      }
    }
  };

  return (
    <Card className="p-5 relative">
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          <div className="text-sm font-semibold tracking-wide uppercase opacity-80">Flashcard</div>
        </div>
        
                          {/* Play/Pause Button and Voice Selector - Aligned with Flashcard header */}
         {speechSupported ? (
           <div className="flex items-center gap-2">
             {/* Play/Stop Button */}
             <button
               onClick={handlePlayAudio}
               className="p-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-colors backdrop-blur"
               title={isPlaying ? "Stop audio" : "Listen to card content"}
             >
               {isPlaying ? (
                 <Pause className="w-4 h-4 text-white/80" />
               ) : (
                 <Play className="w-4 h-4 text-white/80" />
               )}
             </button>
           </div>
         ) : (
           <div className="text-xs text-white/40 px-2 py-1">
             Audio not supported
           </div>
         )}
      </div>
      <Flashcard flipped={false} onFlip={() => {}} showVis={showVis} front={
        <div className={`flex h-full flex-col justify-between ${!showVis ? 'overflow-y-auto' : ''}`}>
          <div>
            <div className="text-base font-semibold mb-2">{concept.title}</div>
            <p className="text-sm opacity-90 mb-3">{concept.explainer.idea}</p>
            
            <div className="mb-3">
              <div className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-1">Steps:</div>
              <ul className="list-disc pl-5 text-sm opacity-90 space-y-1">
                {concept.explainer.steps.map((s, i) => (<li key={i}>{s}</li>))}
              </ul>
            </div>

            {concept.explainer.example && (
              <div className="mb-3">
                <div className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-1">Example:</div>
                <div className="text-sm opacity-90 bg-white/5 rounded-lg p-2 font-mono">
                  {concept.explainer.example}
                </div>
              </div>
            )}

            {concept.explainer.proTips && (
              <div className="mb-3">
                <div className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-1">Pro Tips:</div>
                <ul className="list-disc pl-5 text-sm opacity-90 space-y-1">
                  {concept.explainer.proTips.map((tip, i) => (
                    <li key={i} className="text-xs">{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="pt-3">
            <div className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-1">Formula:</div>
            <PrettyFormula tex={concept.explainer.formula} />
          </div>
        </div>
      } back={<div />} />
    </Card>
  );
}

function Confetti({ run }) {
  const pieces = Array.from({ length: 20 }, (_, i) => i);
  return (
    <AnimatePresence>
      {run && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {pieces.map((i) => (
            <motion.div key={i} initial={{ opacity: 1, y: 0, x: 0, scale: 1 }} animate={{ opacity: 0, y: rnd(80, 140), x: rnd(-120, 120), rotate: rnd(-180, 180), scale: 0.9 }} transition={{ duration: 0.9, delay: i * 0.01, ease: "easeOut" }} className="absolute left-1/2 top-0 h-2 w-2 rounded-sm bg-white/80 shadow" />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

function Practice({ concept, onResult, conceptKey, showVis, setShowVis }) {
  const [task, setTask] = useState(() => concept.generator());
  const [user, setUser] = useState("");
  const [status, setStatus] = useState("idle");
  const [lastCoinReward, setLastCoinReward] = useState(0);

  const regenerate = () => {
    setTask(concept.generator());
    setUser("");
    setStatus("idle");
    setLastCoinReward(0);
  };

  const check = () => {
    // For testing: always accept "0" as correct
    const isCorrect = user === "0" || task.check(user);
    setStatus(isCorrect ? "right" : "wrong");
    
    if (isCorrect) {
      // Get coin reward from onResult
      const coinReward = onResult?.(isCorrect) || 0;
      setLastCoinReward(coinReward);
      
      // Auto-advance to next task if correct
      setTimeout(() => {
        regenerate();
      }, 1500); // Wait 1.5 seconds to show success feedback, then auto-advance
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      check();
    }
  };

  // ✅ Auto-new task when switching tabs/concepts
  useEffect(() => {
    setTask(concept.generator());
    setUser("");
    setStatus("idle");
    setLastCoinReward(0);
  }, [conceptKey]);

  return (
    <Card className="p-5 relative">
       <div className="flex items-center justify-between pb-3"><div className="flex items-center gap-2"><Play className="h-4 w-4" /><div className="text-sm font-semibold tracking-wide uppercase opacity-80">Practice</div></div><button onClick={() => setShowVis((s) => !s)} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs hover:bg-white/10"><Eye className="h-4 w-4" /> {showVis ? "Hide" : "Show"} viz</button></div>
      <div className="text-sm opacity-90 mb-3">{task.question}</div>
      {task.vectors && (<div className="mb-3 text-xs opacity-80">{Object.entries(task.vectors).map(([k, v]) => (<div key={k}><span className="uppercase tracking-wide opacity-70 mr-2">{k}:</span><span>({v.join(", ")})</span></div>))}</div>)}
      {showVis && (<div className="mb-4"><VectorCanvas vectors={task.vectors} conceptKey={concept.key} /></div>)}
      <div className="flex items-center gap-2">
        <motion.input 
          animate={status === "wrong" ? { x: [0, -6, 6, -4, 4, 0] } : {}} 
          transition={{ duration: 0.35 }} 
          className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-white/40 ${status === "right" ? "border-emerald-300/60 bg-emerald-300/10" : status === "wrong" ? "border-rose-300/60 bg-rose-300/10" : "border-white/20 bg-black/30"}`} 
          placeholder="Your answer" 
          value={user} 
          onChange={(e) => setUser(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button onClick={check} className="relative inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm hover:bg-white/20"><CheckCircle2 className="h-5 w-5" /> Check</button>
        <button onClick={regenerate} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"><Shuffle className="h-4 w-4" /> New</button>
      </div>
      {/* Status area with consistent height to prevent layout shift */}
      <div className="mt-3 h-8 flex items-center">
        <AnimatePresence>
          {status !== "idle" && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="flex items-center gap-2 text-sm">
              {status === "right" ? (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Correct • Answer: <strong>{task.answer}</strong></span>
                  {lastCoinReward > 0 && (
                    <motion.span 
                      initial={{ opacity: 0, scale: 0.8 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      className="inline-flex items-center gap-1 text-yellow-400 font-medium"
                    >
                      <Coins className="w-4 h-4" />
                      +{lastCoinReward}
                    </motion.span>
                  )}
                </>
              ) : (
                <><XCircle className="h-5 w-5" /><span>Not quite • Correct: <strong>{task.answer}</strong></span></>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Confetti run={status === "right"} />
    </Card>
  );
}

function XP({ correct, total, streak, reset, level, xpForCurrentLevel, xpRequired }) {
  const pct = Math.min(100, (xpForCurrentLevel / xpRequired) * 100);
  
  return (
    <Card className="p-5 relative">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold tracking-wide uppercase opacity-80">XP</div>
          <div className="text-xs opacity-80">Level: {level} · XP: {xpForCurrentLevel}/{xpRequired}</div>
        </div>
        <button onClick={reset} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs hover:bg-white/10"><RotateCcw className="h-4 w-4" /> Reset</button>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div 
          initial={false}
          animate={{ width: `${pct}%` }} 
          transition={{ duration: 0.35, ease: "easeOut" }} 
          className="h-full bg-white/70" 
        />
      </div>
    </Card>
  );
}

export default function App() {
  const [conceptKey, setConceptKey] = useState(CONCEPTS[0].key);
  const concept = useMemo(() => CONCEPTS.find((c) => c.key === conceptKey), [conceptKey]);

  // legacy keys kept for migration friendliness
  const [streak, setStreak] = useLocalStorage("vt2d_streak", 0);
  const [total, setTotal] = useLocalStorage("vt2d_total", 0);
  const [correct, setCorrect] = useLocalStorage("vt2d_correct", 0);
  const [level, setLevel] = useLocalStorage("vt2d_level", 1);
  const [xpForCurrentLevel, setXpForCurrentLevel] = useLocalStorage("vt2d_xp_current", 0);
  const [xpRequirements, setXpRequirements] = useLocalStorage("vt2d_xp_requirements", { 1: 100 });
  const [showLevelUp, setShowLevelUp] = useState(false);
  
  // Coin system
  const [coins, setCoins] = useLocalStorage("vt2d_coins", 0);
  
  // Store system
  const [ownedItems, setOwnedItems] = useLocalStorage("vt2d_owned_items", []);
  
  // Active boosts system
  const [activeBoosts, setActiveBoosts] = useLocalStorage("vt2d_active_boosts", {
    xpBoost: { level: 0, multiplier: 1.0 },
    coinsBoost: { level: 0, multiplier: 1.0 }
  });

  // Shared state for visualization visibility
  const [showVis, setShowVis] = useState(true);



  // Get or calculate XP requirements for current level
  let xpRequired = xpRequirements[level];
  if (!xpRequired) {
    // Calculate XP requirements with percentage-based increases
    xpRequired = xpRequirements[level - 1] || 100;
    // Use a deterministic increase based on level to avoid random changes
    const increasePercent = 0.10 + ((level * 0.03) % 0.15); // 10-25% increase, deterministic per level
    xpRequired = Math.floor(xpRequired * (1 + increasePercent));
    
    // Store the new requirement
    setXpRequirements(prev => ({ ...prev, [level]: xpRequired }));
  }

  const handleResult = (ok) => {
    setTotal((t) => t + 1);
    if (ok) {
      const newCorrect = correct + 1;
      setCorrect(newCorrect);
      setStreak((s) => s + 1);
      
      // Add XP for correct answer (apply boost multiplier)
      const baseXp = 25;
      const xpMultiplier = activeBoosts.xpBoost.multiplier;
      const newXp = xpForCurrentLevel + (baseXp * xpMultiplier);
      setXpForCurrentLevel(newXp);
      
      // Award coins for correct answer (20-50 coins, apply boost multiplier)
      const baseCoinReward = Math.floor(Math.random() * 31) + 20; // Random between 20-50
      const coinMultiplier = activeBoosts.coinsBoost.multiplier;
      const coinReward = Math.floor(baseCoinReward * coinMultiplier);
      setCoins(c => c + coinReward);
      
      // Check for level up
      if (newXp >= xpRequired) {
        const previousLevel = level;
        setLevel(l => l + 1);
        setXpForCurrentLevel(0); // Reset XP for new level
        
        // Award bonus coins for level up (100-200 * previous level, apply boost multiplier)
        const baseLevelUpBonus = (Math.floor(Math.random() * 101) + 100) * previousLevel; // Random between 100-200 * previous level
        const levelUpCoinMultiplier = activeBoosts.coinsBoost.multiplier;
        const levelUpBonus = Math.floor(baseLevelUpBonus * levelUpCoinMultiplier);
        setCoins(c => c + levelUpBonus);
        
        setShowLevelUp(true);
        // Auto-hide after 2 seconds
        setTimeout(() => {
          setShowLevelUp(false);
        }, 2000);
      }
      
      // Return the coin reward for display
      return coinReward;
    } else {
      setStreak(0);
      return 0;
    }
  };

  const reset = () => {
    setStreak(0);
    setTotal(0);
    setCorrect(0);
    setLevel(1);
    setXpForCurrentLevel(0);
    setXpRequirements({ 1: 100 });
    setShowLevelUp(false);
    setCoins(0);
    // Also reset active boosts
    setActiveBoosts({
      xpBoost: { level: 0, multiplier: 1.0 },
      coinsBoost: { level: 0, multiplier: 1.0 }
    });
    // Reset owned items (non-boost items)
    setOwnedItems([]);
  };



  return (
         <div className="min-h-screen w-full text-white relative">
      <motion.div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 6 }} />
                                                                                                               <Header coins={coins} setCoins={setCoins} ownedItems={ownedItems} setOwnedItems={setOwnedItems} activeBoosts={activeBoosts} setActiveBoosts={setActiveBoosts} />
             <main className="mx-auto max-w-[85%] px-8 pb-20 pt-10">
         <section className="mb-8">
           <div>
             <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">2D Vectors</h1>
             <p className="mt-2 max-w-2xl text-sm opacity-80">Study a crisp explainer, then tackle an auto-generated practice task. Clean visuals, no clutter—just you and the math.</p>
           </div>
         </section>
        <section className="mb-8"><ConceptPicker value={conceptKey} onChange={setConceptKey} /></section>
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2 main-panels">
          <Explainer concept={concept} showVis={showVis} />
          <div className="space-y-6">
            <Practice concept={concept} conceptKey={conceptKey} onResult={handleResult} showVis={showVis} setShowVis={setShowVis} />
                         <XP correct={correct} total={total} streak={streak} reset={reset} level={level} xpForCurrentLevel={xpForCurrentLevel} xpRequired={xpRequired} />
          </div>
        </section>
        <section className="mt-10">
          <Card className="p-5">
            <div className="flex items-center gap-2 pb-3"><Info className="h-4 w-4" /><div className="text-sm font-semibold tracking-wide uppercase opacity-80">Tips</div></div>
            <ul className="grid list-disc gap-2 pl-5 text-sm opacity-90 sm:grid-cols-2">
              <li>Use the visualization toggle in Practice to see arrows for a, b, v, and any derived vectors.</li>
              <li>Angles are returned in degrees here. Convert radians to degrees with 180/π when needed.</li>
              <li>Round as requested; most answers accept 3 decimal places.</li>
              <li>Projection returns a vector. Enter as (x, y) with commas.</li>
            </ul>
          </Card>
        </section>
      </main>
                                                                                                               <footer className="mx-auto max-w-[85%] px-8 pb-10 pt-4 opacity-70 text-xs">
                                                          <div className="flex items-center justify-center gap-2">
                                                            <div className="h-4 w-4 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
                                                              <Sparkles className="h-3 w-3" />
                                                            </div>
                                                            <span>© 2024 MathWeb. All rights reserved.</span>
                                                          </div>
                                                        </footer>
       
               {/* Fullscreen Level Up Popup */}
        <AnimatePresence>
          {showLevelUp && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
            >
              <div className="relative text-center p-8">
                {/* Animated geometric background */}
                <motion.div
                  initial={{ rotate: 0, scale: 0 }}
                  animate={{ rotate: 360, scale: 1 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="w-64 h-64 border-2 border-purple-400/30 rounded-full" />
                  <div className="absolute w-48 h-48 border-2 border-blue-400/30 rotate-45" />
                                     <div className="absolute w-32 h-32 border-2 border-purple-400/30 rounded-full" />
                </motion.div>
                
                {/* Central level indicator */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.6, ease: "backOut" }}
                  className="relative z-10 mb-6"
                >
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-emerald-500 flex items-center justify-center shadow-2xl">
                    <span className="text-3xl font-bold text-white">{level}</span>
                  </div>
                </motion.div>
                
                {/* Level Up text */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
                  className="relative z-10"
                >
                  <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                    LEVEL UP!
                  </div>
                  <div className="text-xl opacity-90 text-gray-300">
                    You've reached Level {level}!
                  </div>
                </motion.div>
                
                {/* Floating particles */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="absolute inset-0 pointer-events-none"
                >
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ 
                        x: 0, 
                        y: 0, 
                        opacity: 0,
                        scale: 0
                      }}
                      animate={{ 
                        x: Math.cos(i * Math.PI / 4) * 100,
                        y: Math.sin(i * Math.PI / 4) * 100,
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0]
                      }}
                      transition={{ 
                        duration: 2,
                        delay: 0.8 + i * 0.1,
                        repeat: Infinity,
                        repeatDelay: 1
                      }}
                      className="absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"
                      style={{
                        left: '50%',
                        top: '50%',
                        marginLeft: '-4px',
                        marginTop: '-4px'
                      }}
                    />
                  ))}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
     </div>
   );
 }
