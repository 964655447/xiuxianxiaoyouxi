/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import MainMenu from "./components/MainMenu";
import GameCanvas from "./components/GameCanvas";
import GameOverModal from "./components/GameOverModal";
import { SaveState, GameStats, CultivationRealm } from "./types";
import { DEFAULT_SAVE_STATE, CHARACTER_DEFS } from "./utils";
import { sfx } from "./components/SfxEngine";

const LOCAL_STORAGE_KEY = "xiuxian_survivor_save";

export default function App() {
  const [saveState, setSaveState] = useState<SaveState>(DEFAULT_SAVE_STATE);
  const [currentScreen, setCurrentScreen] = useState<"menu" | "playing" | "gameover">("menu");
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>("lu_xueqi");
  const [lastStats, setLastStats] = useState<GameStats>({
    timeElapsed: 0,
    enemiesKilled: 0,
    spiritStonesCollected: 0,
    realm: CultivationRealm.LIAN_QI,
    isTribulation: false,
    tribulationProgress: 0,
  });
  const [isVictory, setIsVictory] = useState<boolean>(false);

  // Initialize and load persistent profile state from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SaveState;
        // Merge with default values in case keys are missing
        setSaveState({
          ...DEFAULT_SAVE_STATE,
          ...parsed,
          permanentUpgrades: {
            ...DEFAULT_SAVE_STATE.permanentUpgrades,
            ...(parsed.permanentUpgrades || {}),
          },
          unlockedCharacters: parsed.unlockedCharacters || ["lu_xueqi"]
        });
      }
    } catch (e) {
      console.warn("Could not read local cultivation save data:", e);
    }
  }, []);

  // Update central save profile
  const handleSaveUpgrade = (nextSave: SaveState) => {
    setSaveState(nextSave);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nextSave));
    } catch (e) {
      console.error("Failed to commit upgrade progression to local storage:", e);
    }
  };

  // Launch a new cultivation attempt
  const handleBeginAdventure = (characterId: string) => {
    setSelectedCharacterId(characterId);
    setCurrentScreen("playing");
  };

  // Callback when player either passes or succumbs to tribulation lightning
  const handleGameEnd = (finalStats: GameStats, isClear: boolean) => {
    setIsVictory(isClear);
    setLastStats(finalStats);

    // Save harvested funds and update statistics records
    const nextStones = saveState.spiritStones + finalStats.spiritStonesCollected;
    const maxTime = Math.max(saveState.highScoreTime, finalStats.timeElapsed);
    const maxKills = Math.max(saveState.highScoreEnemies, finalStats.enemiesKilled);
    const totalCount = saveState.totalRuns + (isClear ? 1 : 0);

    const nextSave: SaveState = {
      ...saveState,
      spiritStones: nextStones,
      highScoreTime: maxTime,
      highScoreEnemies: maxKills,
      totalRuns: totalCount,
    };

    handleSaveUpgrade(nextSave);
    setCurrentScreen("gameover");
  };

  const handleReturnToCave = () => {
    setCurrentScreen("menu");
  };

  const activeCharName =
    CHARACTER_DEFS.find((c) => c.id === selectedCharacterId)?.name || "玄门弟子";

  return (
    <div className="w-full min-h-screen bg-[#e5e1d8] font-serif text-[#1a1a1a]">
      {/* Route Views */}
      {currentScreen === "menu" && (
        <MainMenu
          saveState={saveState}
          onStartGame={handleBeginAdventure}
          onUpgradeSave={handleSaveUpgrade}
        />
      )}

      {currentScreen === "playing" && (
        <GameCanvas
          characterId={selectedCharacterId}
          saveState={saveState}
          onGameFinished={handleGameEnd}
          onExitGame={handleReturnToCave}
        />
      )}

      {currentScreen === "gameover" && (
        <GameOverModal
          stats={lastStats}
          characterName={activeCharName}
          isVictory={isVictory}
          onReturnToCave={handleReturnToCave}
        />
      )}
    </div>
  );
}
