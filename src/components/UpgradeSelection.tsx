/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Sparkles, Star, Plus } from "lucide-react";
import { UpgradeOption } from "../types";
import { getUpgradeDescription, SKILL_METADATA } from "../utils";
import { sfx } from "./SfxEngine";

interface UpgradeSelectionProps {
  options: UpgradeOption[];
  onSelect: (option: UpgradeOption) => void;
}

export default function UpgradeSelection({ options, onSelect }: UpgradeSelectionProps) {
  const handleSelect = (option: UpgradeOption) => {
    sfx.playLevelUp();
    onSelect(option);
  };

  return (
    <div className="fixed inset-0 bg-[#1a1a1a]/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-4xl bg-[#f5f2ed] border-8 border-[#1a1a1a] p-6 md:p-8 flex flex-col gap-6 shadow-2xl relative text-[#1a1a1a] overflow-hidden">
        
        <div className="text-center relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1a1a1a] text-white text-[10px] font-serif font-black tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            福至心灵 境界松动
          </div>
          <h2 className="text-3xl font-serif font-black text-[#1a1a1a] tracking-tight">
            请选择一件法宝招式或无上心法 (参悟)
          </h2>
          <p className="text-xs text-[#1a1a1a]/60 mt-2 font-serif tracking-widest">
            — 顺应天道，择一仙缘修证大道 —
          </p>
        </div>

        {/* Upgrade Cards Horizontal Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4" id="upgrade_options_container">
          {options.map((option, idx) => {
            const meta = SKILL_METADATA[option.id];
            const isNew = option.level === 0;
            const targetLvl = option.level + 1;
            const numLabel = `0${idx + 1}`;

            return (
              <button
                key={option.id}
                onClick={() => handleSelect(option)}
                className="group relative border border-[#1a1a1a] p-6 pt-10 flex flex-col justify-between hover:bg-[#1a1a1a] hover:text-[#f5f2ed] bg-transparent text-[#1a1a1a] transition-all duration-300 text-left cursor-pointer min-h-[320px]"
                id={`upgrade_card_${option.id}`}
              >
                {/* Large Absolute Index Circle */}
                <div className="absolute -top-4 -left-4 w-10 h-10 bg-[#1a1a1a] group-hover:bg-red-600 flex items-center justify-center text-white text-base italic font-serif z-10 transition-colors">
                  {numLabel}
                </div>

                {/* Subtitle Label */}
                <span className="absolute right-3 top-3 text-[9px] uppercase tracking-wider font-extrabold text-[#1a1a1a] group-hover:text-amber-400 font-sans border-b border-[#1a1a1a]/20 pb-0.5">
                  {isNew ? "新参悟" : `等阶 ${option.level}`}
                </span>

                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">{meta?.icon || "🔮"}</span>
                    <div>
                      <h3 className="font-serif font-black text-lg text-[#1a1a1a] group-hover:text-[#f5f2ed] leading-tight">
                        {meta?.name || option.id}
                      </h3>
                      <span className="text-[9px] text-[#1a1a1a]/50 group-hover:text-red-400 font-serif tracking-wider block font-bold">
                        {option.type === "WEAPON" ? "法宝招式" : "无上心法"}
                      </span>
                    </div>
                  </div>

                  {/* Level stars / progress dots */}
                  <div className="flex items-center gap-1.5 mb-4 border-b border-[#1a1a1a]/15 pb-2 group-hover:border-white/20">
                    <span className="text-[10px] font-mono opacity-60">等阶:</span>
                    <div className="flex gap-1">
                      {Array.from({ length: option.maxLevel }).map((_, sIdx) => (
                        <div
                          key={sIdx}
                          className={`w-2 h-2 rotate-45 border border-current ${
                            sIdx < targetLvl
                              ? "bg-red-600"
                              : "bg-transparent opacity-30"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Level description */}
                  <p className="text-xs text-[#1a1a1a]/85 group-hover:text-[#f5f2ed]/80 font-serif leading-relaxed line-clamp-6">
                    {getUpgradeDescription(option.id, targetLvl)}
                  </p>
                </div>

                {/* Bottom slot */}
                <div className="border-t border-[#1a1a1a]/15 group-hover:border-[#f5f2ed]/20 pt-3 mt-4 flex items-center justify-between text-[10px] font-bold tracking-wider opacity-90">
                  <span>领受此造化</span>
                  <Plus className="w-4 h-4 text-red-600 group-hover:text-[#f5f2ed]" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
