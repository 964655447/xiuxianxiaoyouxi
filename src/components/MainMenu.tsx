/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Trophy,
  Coins,
  Play,
  Volume2,
  VolumeX,
  Sparkles,
  BookOpen,
  User,
  Heart,
  Gauge,
  Zap,
  Eye
} from "lucide-react";
import { CHARACTER_DEFS, PERMANENT_UPGRADES_DEF, SKILL_METADATA } from "../utils";
import { CultivatorType, SaveState } from "../types";
import { sfx } from "./SfxEngine";

interface MainMenuProps {
  saveState: SaveState;
  onStartGame: (characterId: string) => void;
  onUpgradeSave: (newSave: SaveState) => void;
}

export default function MainMenu({ saveState, onStartGame, onUpgradeSave }: MainMenuProps) {
  const [selectedCharId, setSelectedCharId] = useState<string>("lu_xueqi");
  const [activeTab, setActiveTab] = useState<"cave" | "library">("cave");
  const [soundOn, setSoundOn] = useState<boolean>(sfx.isSoundEnabled());

  const handleToggleSound = () => {
    const isEnabled = sfx.toggleSound();
    setSoundOn(isEnabled);
    sfx.playGemCollect();
  };

  const handleUnlockCharacter = (id: string, cost: number) => {
    if (saveState.spiritStones >= cost) {
      const updatedList = [...saveState.unlockedCharacters, id];
      const updatedSave: SaveState = {
        ...saveState,
        spiritStones: saveState.spiritStones - cost,
        unlockedCharacters: updatedList,
      };
      onUpgradeSave(updatedSave);
      sfx.playLevelUp();
    } else {
      sfx.playHurt();
    }
  };

  const buyPermanentUpgrade = (upgradeId: string, baseCost: number, mult: number) => {
    const currentLvl = saveState.permanentUpgrades[upgradeId] || 0;
    const cost = Math.round(baseCost * Math.pow(mult, currentLvl));

    if (saveState.spiritStones >= cost) {
      const updatedUpgrades = {
        ...saveState.permanentUpgrades,
        [upgradeId]: currentLvl + 1,
      };
      const updatedSave: SaveState = {
        ...saveState,
        spiritStones: saveState.spiritStones - cost,
        permanentUpgrades: updatedUpgrades,
      };
      onUpgradeSave(updatedSave);
      sfx.playLevelUp();
    } else {
      sfx.playHurt();
    }
  };

  // Helper to extract stats
  const selectedChar = CHARACTER_DEFS.find((c) => c.id === selectedCharId) || CHARACTER_DEFS[0];
  const isSelectedCharUnlocked = saveState.unlockedCharacters.includes(selectedCharId);

  return (
    <div className="w-full min-h-screen bg-[#e5e1d8] text-[#1a1a1a] flex flex-col items-center justify-center py-6 sm:py-10 md:py-12 p-3 sm:p-6 md:p-8 font-serif selection:bg-red-600/30 selection:text-red-900">
      
      {/* Outer Editorial Border Container */}
      <div className="w-full max-w-5xl bg-[#f5f2ed] border-8 border-[#1a1a1a] p-4 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 overflow-hidden relative shadow-2xl my-auto">
        
        {/* Left Vertical Banner on desktop */}
        <div className="hidden md:flex flex-col w-20 items-center justify-between border-r border-[#1a1a1a] pb-4 shrink-0 pr-6">
          <div className="[writing-mode:vertical-rl] text-5xl font-serif font-black tracking-tighter pt-4 text-[#1a1a1a] select-none uppercase">
            尘世剑仙 <span className="text-xs tracking-widest font-serif font-bold mt-4 text-[#1a1a1a]/60">凡人飞仙传</span>
          </div>
          <div className="flex flex-col gap-1 text-[9px] font-serif font-bold tracking-[0.2em] text-[#1a1a1a]/70">
            <span>庚子重制版</span>
            <span>法宝心经阁</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col justify-start">
          
          {/* Header Title bar */}
          <div className="flex flex-col md:flex-row md:items-baseline justify-between border-b border-[#1a1a1a] pb-6 mb-6 gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-serif font-bold tracking-widest text-red-600 font-bold">太上玄功至尊秘卷</span>
              <h1 className="text-3xl md:text-5xl font-serif font-black italic tracking-tight text-[#1a1a1a] mt-1">
                修仙御剑割草 <span className="text-sm font-serif not-italic font-black text-neutral-500 tracking-widest block md:inline md:ml-3">/ 凡人飞仙传</span>
              </h1>
            </div>
            
            {/* Resources & Sound controls */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a1a] text-[#f5f2ed] font-sans font-bold text-xs uppercase tracking-wider">
                <Coins className="w-4 h-4 text-amber-400" />
                <span>{saveState.spiritStones} <span className="text-[10px] text-amber-300">灵石</span></span>
              </div>
              <button
                onClick={handleToggleSound}
                className="w-9 h-9 border border-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-[#f5f2ed] flex items-center justify-center text-[#1a1a1a] transition-all cursor-pointer bg-transparent"
                title="切换声音"
                id="toggle_sound_btn"
              >
                {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="w-full flex justify-start gap-4 mb-6 border-b border-[#1a1a1a] pb-1">
            <button
              onClick={() => {
                setActiveTab("cave");
                sfx.playSwordWhoosh();
              }}
              className={`pb-3 px-2 text-center font-serif font-black text-sm uppercase tracking-wider transition-all cursor-pointer relative ${
                activeTab === "cave"
                  ? "text-[#1a1a1a] opacity-100 after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-[6px] after:bg-[#1a1a1a]"
                  : "text-neutral-500 hover:text-[#1a1a1a] opacity-60"
              }`}
              id="tab_cave_btn"
            >
              仙界洞府 (人物选择)
            </button>
            <button
              onClick={() => {
                setActiveTab("library");
                sfx.playSwordWhoosh();
              }}
              className={`pb-3 px-2 text-center font-serif font-black text-sm uppercase tracking-wider transition-all cursor-pointer relative ${
                activeTab === "library"
                  ? "text-[#1a1a1a] opacity-100 after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-[6px] after:bg-[#1a1a1a]"
                  : "text-neutral-500 hover:text-[#1a1a1a] opacity-60"
              }`}
              id="tab_library_btn"
            >
              藏经阁 (福缘永久强化)
            </button>
          </div>

          {/* Render Active Tab */}
          {activeTab === "cave" ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Character Selector Grid */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                <h2 className="text-lg font-serif font-black text-[#1a1a1a] flex items-center gap-2 uppercase tracking-wide">
                  <Sparkles className="w-4 h-4 text-red-750" />
                  选择本命仙修
                </h2>
                <div className="max-h-[350px] overflow-y-auto pr-2 custom-scrollbar border border-[#1a1a1a]/15 p-2 bg-[#f5f2ed]/40 relative">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {CHARACTER_DEFS.map((char) => {
                      const isUnlocked = saveState.unlockedCharacters.includes(char.id);
                      const isSelected = selectedCharId === char.id;
                      return (
                        <button
                          key={char.id}
                          onClick={() => {
                            setSelectedCharId(char.id);
                            sfx.playSwordWhoosh();
                          }}
                          className={`group relative p-4 border text-left flex flex-col justify-between transition-all duration-200 cursor-pointer min-h-48 ${
                            isSelected
                              ? "bg-[#1a1a1a] text-[#f5f2ed] border-[#1a1a1a]"
                              : "bg-transparent border-[#1a1a1a]/30 text-[#1a1a1a] hover:border-[#1a1a1a] hover:bg-[#1a1a1a]/5"
                          }`}
                          id={`char_select_${char.id}`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <div className="w-10 h-10 border border-[#1a1a1a]/30 overflow-hidden bg-neutral-100 flex items-center justify-center">
                                <img
                                  src={char.illustration}
                                  alt={char.name}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              {isUnlocked ? (
                                <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold uppercase ${isSelected ? "bg-white/10 border border-white/20 text-white" : "bg-[#1a1a1a]/10 border border-[#1a1a1a]/20 text-[#1a1a1a]"}`}>
                                  已斩尘缘
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] bg-red-700 text-white font-sans font-bold">
                                  <Coins className="w-3 h-3 text-amber-300" />
                                  {char.unlockedCost}
                                </span>
                              )}
                            </div>
                            <h3 className="font-serif font-bold text-base leading-tight">{char.name}</h3>
                            <p className={`text-xs mt-1.5 line-clamp-3 leading-relaxed font-sans ${isSelected ? "text-slate-300" : "text-neutral-600"}`}>{char.description}</p>
                          </div>

                          <div className={`mt-4 border-t pt-2 flex items-center justify-between text-xs ${isSelected ? "border-white/10" : "border-[#1a1a1a]/15"}`}>
                            <span className="font-sans opacity-70">功法流派:</span>
                            <span className="font-bold">
                              {char.type === CultivatorType.SWORD
                                ? "剑气狂飙"
                                : char.type === CultivatorType.SPELL
                                ? "五行玄法"
                                : "蛮神金骨"}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Character Preview Panel */}
                <div className="p-6 border border-[#1a1a1a] bg-[#e5e1d8]/40 flex flex-col md:flex-row gap-6 mt-2 relative overflow-hidden">
                  <div className="w-full md:w-36 h-48 shrink-0 bg-[#f5f2ed] border-4 border-[#1a1a1a] overflow-hidden shadow-inner relative group">
                    <img
                      src={selectedChar.illustration}
                      alt={selectedChar.name}
                      className="w-full h-full object-cover transition-all duration-300 scale-100 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    {/* Decorative ink style overlays */}
                    <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-[#1a1a1a]" />
                    <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-[#1a1a1a]" />
                    <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-[#1a1a1a]" />
                    <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-[#1a1a1a]" />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-serif font-black text-[#1a1a1a]">{selectedChar.name}</h3>
                        <span className="text-[10px] px-2 py-1 bg-[#1a1a1a] text-white font-serif font-bold tracking-widest">
                          {selectedChar.sect}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-800 mt-2 font-serif leading-relaxed">{selectedChar.description}</p>
                    </div>

                    {/* Specific start passive/active items */}
                    <div className="mt-4 grid grid-cols-2 lg:grid-cols-3 gap-3 border-t border-[#1a1a1a]/25 pt-4 text-xs">
                      <div className="flex items-center gap-1.5 bg-[#f5f2ed] px-2 py-1.5 border border-[#1a1a1a]/20">
                        <Heart className="w-3.5 h-3.5 text-rose-600" />
                        <span>本源精血: <strong className="text-red-700">{selectedChar.baseHp}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-[#f5f2ed] px-2 py-1.5 border border-[#1a1a1a]/20">
                        <Gauge className="w-3.5 h-3.5 text-indigo-600" />
                        <span>遁速增幅: <strong className="text-indigo-800">{selectedChar.baseSpeed}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-[#f5f2ed] px-2 py-1.5 border border-[#1a1a1a]/20 col-span-2 lg:col-span-1">
                        <Zap className="w-3.5 h-3.5 text-amber-600" />
                        <span className="truncate">
                          初始法宝: <strong className="text-amber-700">{SKILL_METADATA[selectedChar.startingWeapon]?.name || "斩仙剑"}</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action and Stats sidebar */}
              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-serif font-black text-[#1a1a1a] flex items-center gap-2 uppercase tracking-wide">
                  <Trophy className="w-4 h-4 text-amber-600" />
                  道果与执念
                </h2>

                {/* Display High Scores */}
                <div className="p-5 border border-[#1a1a1a] bg-[#e5e1d8]/40 flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-[#1a1a1a]/15 pb-3">
                    <span className="text-sm text-neutral-600 font-sans font-bold">总斩妖次数</span>
                    <span className="font-mono text-xl font-bold text-[#1a1a1a]">{saveState.highScoreEnemies} 尊</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#1a1a1a]/15 pb-3">
                    <span className="text-sm text-neutral-600 font-sans font-bold">最长生还时间</span>
                    <span className="font-mono text-xl font-bold text-red-700">
                      {Math.floor(saveState.highScoreTime / 60)}分{saveState.highScoreTime % 60}秒
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600 font-sans font-bold">渡劫通关次数</span>
                    <span className="font-mono text-sm text-[#1a1a1a] font-bold">
                      {saveState.totalRuns || 0} 轮
                    </span>
                  </div>
                </div>

                {/* Play controls */}
                <div className="mt-auto pt-4">
                  {isSelectedCharUnlocked ? (
                    <button
                      onClick={() => {
                        sfx.playLevelUp();
                        onStartGame(selectedCharId);
                      }}
                      className="w-full py-4 bg-[#1a1a1a] text-white font-sans uppercase tracking-[0.3em] text-xs hover:bg-red-700 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow"
                      id="start_adventure_btn"
                    >
                      <Play className="w-5 h-5 fill-white text-white" />
                      踏入仙路 (开始游玩)
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUnlockCharacter(selectedCharId, selectedChar.unlockedCost)}
                      disabled={saveState.spiritStones < selectedChar.unlockedCost}
                      className={`w-full py-4 border font-sans font-bold text-xs uppercase tracking-[0.2em] text-center flex items-center justify-center gap-2 transition-all ${
                        saveState.spiritStones >= selectedChar.unlockedCost
                          ? "bg-transparent border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white cursor-pointer"
                          : "bg-neutral-200 border-neutral-300 text-neutral-400 cursor-not-allowed"
                      }`}
                      id="unlock_character_btn"
                    >
                      <Coins className="w-4 h-4 text-amber-500" />
                      解除封印：消耗 {selectedChar.unlockedCost} 灵石
                    </button>
                  )}
                </div>

                {/* Responsive Controller Help Card */}
                <div className="border border-[#1a1a1a] p-4 text-neutral-600 text-[11px] leading-relaxed bg-[#e5e1d8]/30 font-sans">
                  <span className="font-extrabold text-[#1a1a1a] block mb-1">🎮 飞升秘笈：</span>
                  PC端：键盘 <strong className="text-[#1a1a1a]">WASD</strong> 或 <strong className="text-[#1a1a1a]">方向键</strong> 规避攻击，仙法武器均为自动释放。<br />
                  手机/鼠标：直接在画布内 <strong className="text-[#1a1a1a]">按住并拖拽</strong> 驱动角色行走，吸附荧光能量提升段位境界。
                </div>
              </div>
            </div>
          ) : (
            /* Permanent Talent Shop ("藏经阁") */
            <div className="flex flex-col gap-6 w-full">
              <div className="flex items-center justify-between border-b border-[#1a1a1a] pb-4">
                <div>
                  <h2 className="text-xl font-serif font-black text-[#1a1a1a] flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-red-700" />
                    藏经阁仙术阁
                  </h2>
                  <p className="text-xs text-neutral-600">
                    消耗攒下的灵石沐浴先天道身，强化的属性对所有宿主分身永久加持！
                  </p>
                </div>
                <span className="text-[10px] bg-[#1a1a1a] text-white tracking-widest uppercase font-sans font-bold px-3 py-1">
                  永久福缘加成
                </span>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {PERMANENT_UPGRADES_DEF.map((upgrade) => {
                  const currentLvl = saveState.permanentUpgrades[upgrade.id] || 0;
                  const isMax = currentLvl >= upgrade.maxLevel;
                  const cost = Math.round(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLvl));
                  const canAfford = saveState.spiritStones >= cost;
                  const activeBonusPercent = Math.round(currentLvl * upgrade.statBonusPerLevel * 100);

                  return (
                    <div
                      key={upgrade.id}
                      className="p-5 border border-[#1a1a1a] bg-transparent flex flex-col justify-between transition-all duration-300 hover:bg-[#e5e1d8]/20 text-[#1a1a1a]"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2 pb-1 border-b border-[#1a1a1a]/15">
                          <h3 className="font-serif font-bold text-neutral-900 text-sm md:text-base">
                            {upgrade.name}
                          </h3>
                          <span className="text-[10px] font-mono font-bold tracking-wider text-red-600 uppercase">
                            {currentLvl} / {upgrade.maxLevel} 阶
                          </span>
                        </div>

                        <p className="text-xs text-neutral-600 leading-relaxed min-h-[3rem] font-serif">
                          {upgrade.description}
                        </p>

                        {/* Progress Dots Indicator */}
                        <div className="flex gap-1.5 my-3 bg-[#e5e1d8]/40 p-2 border border-[#1a1a1a]/15">
                          {Array.from({ length: upgrade.maxLevel }).map((_, idx) => (
                            <div
                              key={idx}
                              className={`h-2 flex-1 rotate-45 border border-current ${
                                idx < currentLvl
                                  ? "bg-red-600 text-red-600"
                                  : "bg-transparent text-[#1a1a1a]/20"
                              }`}
                            />
                          ))}
                        </div>

                        {/* Active Stat display */}
                        <div className="text-xs text-[#1a1a1a] font-serif mb-4 flex items-center justify-between">
                          <span>当前气运效果:</span>
                          <strong className="text-red-700 bg-red-700/5 px-2 py-0.5 border border-[#1a1a1a]/20 font-mono">
                            +{activeBonusPercent}%
                          </strong>
                        </div>
                      </div>

                      <div className="mt-auto">
                        {isMax ? (
                          <button
                            disabled
                            className="w-full py-2 bg-neutral-200 text-neutral-500 border border-neutral-300 text-xs font-serif font-bold cursor-not-allowed"
                          >
                            已臻至化境
                          </button>
                        ) : (
                          <button
                            onClick={() => buyPermanentUpgrade(upgrade.id, upgrade.baseCost, upgrade.costMultiplier)}
                            disabled={!canAfford}
                            className={`w-full py-2.5 text-xs font-sans uppercase tracking-widest font-black transition-all flex items-center justify-center gap-2 ${
                              canAfford
                                ? "bg-[#1a1a1a] text-white hover:bg-red-600 cursor-pointer shadow"
                                : "bg-neutral-100 text-neutral-400 border border-neutral-250 cursor-not-allowed"
                            }`}
                            id={`merchant_${upgrade.id}`}
                          >
                            <Coins className="w-3.5 h-3.5" />
                            开光突破: {cost} 灵石
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
