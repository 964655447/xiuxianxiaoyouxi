/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Trophy, Compass, Clock, RotateCcw, Coins, Skull, ArrowRight } from "lucide-react";
import { GameStats } from "../types";
import { sfx } from "./SfxEngine";

interface GameOverModalProps {
  stats: GameStats;
  characterName: string;
  isVictory: boolean;
  onReturnToCave: () => void;
}

export default function GameOverModal({ stats, characterName, isVictory, onReturnToCave }: GameOverModalProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}分${secs}秒`;
  };

  const handleReturn = () => {
    sfx.playLevelUp();
    onReturnToCave();
  };

  return (
    <div className="fixed inset-0 bg-[#1a1a1a]/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-xl bg-[#f5f2ed] border-8 border-[#1a1a1a] p-6 md:p-8 flex flex-col gap-6 shadow-2xl relative overflow-hidden text-[#1a1a1a]">
        
        {/* Decorative corner tag */}
        <div className="absolute top-0 right-0 bg-[#1a1a1a] text-white font-serif text-[10px] font-bold tracking-[0.2em] px-3 py-1.5 rounded-bl">
          {isVictory ? "已渡劫飞升" : "已兵解还乡"}
        </div>

        <div className="text-center pt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1a1a1a] text-white text-[10px] font-serif font-black tracking-widest mb-3">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            {isVictory ? "渡劫羽化 飞升仙界" : "道消身陨 元神虚脱"}
          </div>
          
          <h2 className="text-3xl font-serif font-black tracking-tight mt-1 text-[#1a1a1a]">
            {isVictory ? "大捷！恭喜道友历劫圆满" : "仙路漫漫 遗憾兵解归来"}
          </h2>
          <p className="text-xs font-serif tracking-widest text-red-600 mt-2 font-bold">
            宿主本命: <span className="underline decoration-red-600 decoration-2">{characterName}</span>
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 bg-[#e5e1d8]/40 p-5 border border-[#1a1a1a]">
          <div className="flex flex-col gap-1 p-3 border border-[#1a1a1a] bg-[#f5f2ed]/80">
            <div className="flex items-center gap-1.5 text-neutral-600 text-[10px] font-serif font-bold tracking-wider">
              <Compass className="w-3.5 h-3.5 text-teal-700" />
              成就境界
            </div>
            <strong className="text-base font-serif italic text-teal-900">
              {stats.realm}
            </strong>
          </div>

          <div className="flex flex-col gap-1 p-3 border border-[#1a1a1a] bg-[#f5f2ed]/80">
            <div className="flex items-center gap-1.5 text-neutral-600 text-[10px] font-serif font-bold tracking-wider">
              <Clock className="w-3.5 h-3.5 text-rose-700" />
              生还极限
            </div>
            <strong className="text-base font-serif text-neutral-900">
              {formatTime(stats.timeElapsed)}
            </strong>
          </div>

          <div className="flex flex-col gap-1 p-3 border border-[#1a1a1a] bg-[#f5f2ed]/80">
            <div className="flex items-center gap-1.5 text-neutral-600 text-[10px] font-serif font-bold tracking-wider">
              <Skull className="w-3.5 h-3.5 text-red-700" />
              斩妖除魔
            </div>
            <strong className="text-base font-serif text-red-700">
              {stats.enemiesKilled} 尊
            </strong>
          </div>

          <div className="flex flex-col gap-1 p-3 border border-[#1a1a1a] bg-[#f5f2ed]/80">
            <div className="flex items-center gap-1.5 text-neutral-600 text-[10px] font-serif font-bold tracking-wider">
              <Coins className="w-3.5 h-3.5 text-amber-700" />
              拾获灵石
            </div>
            <strong className="text-base font-serif text-amber-800">
              +{stats.spiritStonesCollected} 灵石
            </strong>
          </div>
        </div>

        {/* Return Button */}
        <button
          onClick={handleReturn}
          className="w-full py-4 bg-[#1a1a1a] text-white font-serif font-black tracking-[0.3em] text-xs hover:bg-[#ea580c] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
          id="confirm_return_menu_btn"
        >
          <RotateCcw className="w-4 h-4 fill-white text-white" />
          返还仙乡洞府 闭关突破
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
