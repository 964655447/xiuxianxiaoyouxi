/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from "react";
import {
  Player,
  Enemy,
  Projectile,
  EnergyGem,
  FloatingText,
  GameStats,
  CultivationRealm,
  WeaponId,
  TalentId,
  UpgradeOption,
  SaveState
} from "../types";
import {
  CHARACTER_DEFS,
  getExpNeededForLevel,
  getRealmByLevel,
  SKILL_METADATA
} from "../utils";
import { sfx } from "./SfxEngine";
import UpgradeSelection from "./UpgradeSelection";
import worldMapImg from "../assets/images/易制地图输出_202605232208.jpeg";

// World map constants (image: 3174x2246, scaled to fit 4800px game world width)
const MAP_IMG_W = 3174;
const MAP_IMG_H = 2246;
const MAP_SCALE = 4800 / MAP_IMG_W;
const MAP_WORLD_W = 4800;
const MAP_WORLD_H = MAP_IMG_H * MAP_SCALE;
const MAP_HALF_W = MAP_WORLD_W / 2;
const MAP_HALF_H = MAP_WORLD_H / 2;

const wrapX = (x: number): number => {
  while (x > MAP_HALF_W) x -= MAP_WORLD_W;
  while (x < -MAP_HALF_W) x += MAP_WORLD_W;
  return x;
};

const wrappedDeltaX = (fromX: number, toX: number): number => {
  let dx = toX - fromX;
  if (dx > MAP_HALF_W) dx -= MAP_WORLD_W;
  if (dx < -MAP_HALF_W) dx += MAP_WORLD_W;
  return dx;
};

export interface StateInfo {
  id: string;
  name: string;
  desc: string;
  bgColor: string;
  borderColor: string;
  glowingColor: string;
  landDetails: string;
  terrainType: "snow" | "desert" | "swamp" | "fairy" | "imperial" | "meteor" | "wild" | "bamboo" | "ocean";
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

export function getStateOfCoordinates(x: number, y: number): StateInfo {
  if (x <= -800) {
    if (y <= -800) {
      return {
        id: "beihan", name: "北寒州", desc: "冰封雪域，冰系道统，上古冰族遗迹",
        bgColor: "rgba(15, 32, 56, 0.45)", borderColor: "#3bbbff", glowingColor: "rgba(186, 230, 253, 0.15)",
        landDetails: "「冰雕遗迹与上古冰晶」", terrainType: "snow",
        primaryColor: "#1e3a5f", secondaryColor: "#2d5a87", accentColor: "#7dd3fc"
      };
    } else if (y <= 800) {
      return {
        id: "xihuang", name: "西荒州", desc: "戈壁大漠，残古战场，散落上古法宝",
        bgColor: "rgba(35, 24, 12, 0.45)", borderColor: "#eab308", glowingColor: "rgba(253, 224, 71, 0.12)",
        landDetails: "「残桓古仙剑与金沙碎屑」", terrainType: "desert",
        primaryColor: "#422006", secondaryColor: "#78350f", accentColor: "#fbbf24"
      };
    } else {
      return {
        id: "nanjiang", name: "南疆州", desc: "毒瘴密林，蛊术巫族，异种妖族领地",
        bgColor: "rgba(17, 32, 21, 0.45)", borderColor: "rgba(16, 185, 129, 0.5)", glowingColor: "rgba(134, 239, 172, 0.12)",
        landDetails: "「毒蕈仙沼与百蛊神符」", terrainType: "swamp",
        primaryColor: "#052e16", secondaryColor: "#14532d", accentColor: "#22c55e"
      };
    }
  } else if (x <= 800) {
    if (y <= -800) {
      return {
        id: "dongyao", name: "东瑶州", desc: "仙山云海，女修宗门，灵草灵药盛产",
        bgColor: "rgba(11, 28, 32, 0.45)", borderColor: "rgba(45, 212, 191, 0.5)", glowingColor: "rgba(45, 212, 191, 0.18)",
        landDetails: "「仙草朱果与驻颜琼池」", terrainType: "fairy",
        primaryColor: "#0c1f24", secondaryColor: "#134e4a", accentColor: "#5eead4"
      };
    } else if (y <= 800) {
      return {
        id: "zhongzhou", name: "中州", desc: "天地中心，皇朝圣地，最强势力聚集地",
        bgColor: "rgba(12, 21, 32, 0.45)", borderColor: "#f59e0b", glowingColor: "rgba(245, 158, 11, 0.2)",
        landDetails: "「九五金龙大阵与至尊皇朝」", terrainType: "imperial",
        primaryColor: "#1c1917", secondaryColor: "#44403c", accentColor: "#fcd34d"
      };
    } else {
      return {
        id: "yunxing", name: "陨星州", desc: "天外陨石降落地，异宝、凶煞之气浓郁",
        bgColor: "rgba(23, 12, 32, 0.45)", borderColor: "#a855f7", glowingColor: "rgba(168, 85, 247, 0.22)",
        landDetails: "「星核陨铁与九天星煞」", terrainType: "meteor",
        primaryColor: "#1e1b4b", secondaryColor: "#312e81", accentColor: "#a78bfa"
      };
    }
  } else {
    if (y <= -800) {
      return {
        id: "cangmang", name: "苍莽州", desc: "群山古林，妖兽横行，魔道据点居多",
        bgColor: "rgba(20, 26, 23, 0.45)", borderColor: "#10b981", glowingColor: "rgba(16, 185, 129, 0.15)",
        landDetails: "「太古魔碑与群山古林」", terrainType: "wild",
        primaryColor: "#0f1f17", secondaryColor: "#1a3a28", accentColor: "#34d399"
      };
    } else if (y <= 800) {
      return {
        id: "qinglan", name: "青岚州", desc: "宗门林立，人族正统发源地，灵气均衡",
        bgColor: "rgba(9, 28, 18, 0.45)", borderColor: "#059669", glowingColor: "rgba(52, 211, 153, 0.18)",
        landDetails: "「道法自然竹居与洗心灵泉」", terrainType: "bamboo",
        primaryColor: "#052e16", secondaryColor: "#166534", accentColor: "#4ade80"
      };
    } else {
      return {
        id: "hancang", name: "瀚沧州", desc: "无边海域，海岛秘境，海族修士盘踞",
        bgColor: "rgba(12, 27, 44, 0.45)", borderColor: "#06b6d4", glowingColor: "rgba(6, 182, 212, 0.22)",
        landDetails: "「归墟漩涡与龙宫御水阵」", terrainType: "ocean",
        primaryColor: "#0c1929", secondaryColor: "#164e63", accentColor: "#22d3ee"
      };
    }
  }
}

interface GameCanvasProps {
  characterId: string;
  saveState: SaveState;
  onGameFinished: (stats: GameStats, isVictory: boolean) => void;
  onExitGame: () => void;
}

export default function GameCanvas({ characterId, saveState, onGameFinished, onExitGame }: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // World map image ref
  const worldMapRef = useRef<HTMLImageElement | null>(null);

  // Preload world map
  useEffect(() => {
    const img = new Image();
    img.src = worldMapImg;
    img.onload = () => {
      worldMapRef.current = img;
    };
  }, []);

  // Load selected character details
  const charDef = CHARACTER_DEFS.find((c) => c.id === characterId) || CHARACTER_DEFS[0];

  // Global game loop and paused states
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [levelUpOptions, setLevelUpOptions] = useState<UpgradeOption[] | null>(null);
  const [gameTime, setGameTime] = useState<number>(0);
  const [killedCount, setKilledCount] = useState<number>(0);
  const [stoneCount, setStoneCount] = useState<number>(0);
  const [currentHp, setCurrentHp] = useState<number>(charDef.baseHp);
  const [maxHp, setMaxHp] = useState<number>(charDef.baseHp);
  const [playerLevel, setPlayerLevel] = useState<number>(1);
  const [playerExp, setPlayerExp] = useState<number>(0);
  const [currentRealm, setCurrentRealm] = useState<CultivationRealm>(CultivationRealm.LIAN_QI);
  const [breakthroughText, setBreakthroughText] = useState<string | null>(null);
  const breakthroughTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [activeState, setActiveState] = useState<StateInfo>(getStateOfCoordinates(0, 0));

  useEffect(() => {
    return () => {
      if (breakthroughTimeoutRef.current) {
        clearTimeout(breakthroughTimeoutRef.current);
      }
    };
  }, []);

  // Tribulation flags
  const [isTribulation, setIsTribulation] = useState<boolean>(false);
  const [tribulationTimeLeft, setTribulationTimeLeft] = useState<number>(40); // 40 seconds survival limit

  // Game state references for loop (to bypass closure capture latency)
  const stateRef = useRef({
    player: {
      x: 0,
      y: 0,
      radius: 18,
      hp: charDef.baseHp,
      maxHp: charDef.baseHp,
      speed: charDef.baseSpeed,
      level: 1,
      exp: 0,
      expNeeded: getExpNeededForLevel(1),
      facingX: 1,
      facingY: 0,
      invulnTime: 0,
    } as Player,
    stats: {
      timeElapsed: 0,
      enemiesKilled: 0,
      spiritStonesCollected: 0,
      realm: CultivationRealm.LIAN_QI,
      isTribulation: false,
      tribulationProgress: 0,
    } as GameStats,
    weapons: {
      [charDef.startingWeapon]: 1, // Start with Level 1 starting weapon
    } as Record<WeaponId, number>,
    talents: {
      [TalentId.DAMAGE]: 0,
      [TalentId.SPEED]: 0,
      [TalentId.HEALTH]: 0,
      [TalentId.MAGNET]: 0,
      [TalentId.EXP_BOOST]: 0,
      [TalentId.ARMOR]: 0,
    } as Record<TalentId, number>,
    enemies: [] as Enemy[],
    projectiles: [] as Projectile[],
    gems: [] as EnergyGem[],
    floatingTexts: [] as FloatingText[],
    keysPressed: {} as Record<string, boolean>,
    mouseMoveTarget: null as { x: number; y: number } | null,
    isMouseDown: false,
    screenSize: { width: 800, height: 600 },
    spawnTimer: 0,
    weaponCooldowns: {} as Record<string, number>,
    bossSpawned: { min2: false, min4: false, tribulation: false },
    activeGroundFlames: [] as { x: number; y: number; id: string; radius: number; duration: number }[],
    lightningWarnings: [] as { x: number; y: number; timer: number; id: string }[],
    camera: { x: 0, y: 0 },
    tickCount: 0
  });

  // Calculate stats applying both local game passives AND meta permanent shop upgrades
  const getAppliedStats = () => {
    const r = stateRef.current;
    
    // 1. Permanent levels
    const permHPLvl = saveState.permanentUpgrades["talent_hp"] || 0;
    const permDmgLvl = saveState.permanentUpgrades["talent_damage"] || 0;
    const permSpdLvl = saveState.permanentUpgrades["talent_speed"] || 0;
    const permMagLvl = saveState.permanentUpgrades["talent_magnet"] || 0;
    const permExpLvl = saveState.permanentUpgrades["talent_exp"] || 0;
    const permGoldLvl = saveState.permanentUpgrades["talent_gold"] || 0;

    // 2. In-game passive level
    const gameHPLvl = r.talents[TalentId.HEALTH] || 0;
    const gameDmgLvl = r.talents[TalentId.DAMAGE] || 0;
    const gameSpdLvl = r.talents[TalentId.SPEED] || 0;
    const gameMagLvl = r.talents[TalentId.MAGNET] || 0;
    const gameExpLvl = r.talents[TalentId.EXP_BOOST] || 0;
    const gameArmLvl = r.talents[TalentId.ARMOR] || 0;

    // HP bonus
    const maxHpMod = charDef.baseHp * (1 + permHPLvl * 0.15 + gameHPLvl * 0.15);
    
    // Damage multiplier
    const dmgMult = (1 + permDmgLvl * 0.1) * (1 + gameDmgLvl * 0.1);

    // Speed bonus
    const speedMod = charDef.baseSpeed * (1 + permSpdLvl * 0.05 + gameSpdLvl * 0.08);

    // Magnet distance: base 70px
    const magnetRange = 70 * (1 + permMagLvl * 0.2 + gameMagLvl * 0.25);

    // EXP boost
    const expBoost = (1 + permExpLvl * 0.08 + gameExpLvl * 0.15);

    // Gold/Spirit Stone bonus
    const goldBoost = (1 + permGoldLvl * 0.15);

    // Armor reduction
    const armor = gameArmLvl * 1; // 1 real reduction per level

    return { maxHpMod, dmgMult, speedMod, magnetRange, expBoost, goldBoost, armor };
  };

  // Keyboard Event Bindings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      stateRef.current.keysPressed[key] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      stateRef.current.keysPressed[key] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Window Resize Listener
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      stateRef.current.screenSize = { width: rect.width, height: rect.height };
      canvasRef.current.width = rect.width;
      canvasRef.current.height = rect.height;
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Continuous loop trigger to normalize update speeds at 60 FPS across high refresh rate displays
  useEffect(() => {
    let animationId: number;
    let localTimeCounter = 0;
    
    let lastTime = performance.now();
    let accumulator = 0;
    const frameDelay = 1000 / 60; // Locked logic updates at 60Hz

    const gameLoop = (timestamp: number) => {
      if (isPaused || levelUpOptions) {
        // Reset lastTime so we don't catch up massive elapsed time on resume
        lastTime = performance.now();
        animationId = requestAnimationFrame(gameLoop);
        return;
      }
      
      let elapsed = timestamp - lastTime;
      // Guard against huge spikes when tab goes out of focus or pause finishes
      if (elapsed > 200 || elapsed < 0) {
        elapsed = frameDelay;
      }
      lastTime = timestamp;
      accumulator += elapsed;

      const r = stateRef.current;

      // Run fixed ticks for game logic/physics
      while (accumulator >= frameDelay) {
        localTimeCounter += 1;
        r.tickCount = localTimeCounter;

        // Update seconds timer
        if (localTimeCounter % 60 === 0) {
          r.stats.timeElapsed += 1;
          setGameTime(r.stats.timeElapsed);

          // Every 5 seconds, regenerate health if passive medicinal herb is unlocked
          if (r.talents[TalentId.HEALTH] > 0) {
            const heal = r.talents[TalentId.HEALTH] * 2;
            const { maxHpMod } = getAppliedStats();
            r.player.hp = Math.min(maxHpMod, r.player.hp + heal);
            addFloatingText(r.player.x, r.player.y - 15, `+${heal} 回复`, "#10b981");
          }

          // Handle Tribulation Climax count
          if (r.stats.isTribulation) {
            setTribulationTimeLeft((prev) => {
              const nextVal = prev - 1;
              if (nextVal <= 0) {
                // VICTORY! Completed final tribulation
                handleGameOver(true);
              }
              return nextVal;
            });
          }
        }

        // 1. UPDATE player movement direction & coordinates
        updatePlayerMovement();
        const nextS = getStateOfCoordinates(r.player.x, r.player.y);
        setActiveState((prev) => {
          if (prev.id !== nextS.id) {
            addFloatingText(r.player.x, r.player.y - 100, `🪐 跨过界标 进入: ${nextS.name} 🪐`, "#fbbf24", true);
            return nextS;
          }
          return prev;
        });

        // 2. LAUNCH weaponry & spells based on active items
        launchWeaponsAndSpells();

        // 3. COLLISION, damage ticks & gems draw
        updateGameEntities();

        accumulator -= frameDelay;
      }

      // 4. DRAW updates straight to Canvas context at maximum refresh rate (smooth visual motion)
      renderGraphics();

      animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationId);
  }, [isPaused, levelUpOptions]);


  // Floating text emitter
  const addFloatingText = (x: number, y: number, text: string, color: string, isCrit = false) => {
    stateRef.current.floatingTexts.push({
      id: Math.random().toString(),
      x,
      y,
      text,
      color,
      opacity: 1,
      size: isCrit ? 18 : 12,
      vy: -1.5,
      duration: 60, // 1 second
    });
  };

  // 1. Player Direction updates
  const updatePlayerMovement = () => {
    const r = stateRef.current;
    let dx = 0;
    let dy = 0;

    // Keyboard bindings
    if (r.keysPressed["w"] || r.keysPressed["arrowup"]) dy -= 1;
    if (r.keysPressed["s"] || r.keysPressed["arrowdown"]) dy += 1;
    if (r.keysPressed["a"] || r.keysPressed["arrowleft"]) dx -= 1;
    if (r.keysPressed["d"] || r.keysPressed["arrowright"]) dx += 1;

    // Click/Drag/Touch bindings
    if (r.isMouseDown && r.mouseMoveTarget) {
      const targetScreenX = r.mouseMoveTarget.x;
      const targetScreenY = r.mouseMoveTarget.y;

      const pScreenX = r.player.x - r.camera.x;
      const pScreenY = r.player.y - r.camera.y;

      const vecX = targetScreenX - pScreenX;
      const vecY = targetScreenY - pScreenY;
      const distance = Math.hypot(vecX, vecY);

      if (distance > 10) {
        dx = vecX / distance;
        dy = vecY / distance;
      }
    }

    // Normalize diagonal speeds
    if (dx !== 0 || dy !== 0) {
      const length = Math.hypot(dx, dy);
      const moveX = dx / length;
      const moveY = dy / length;

      r.player.facingX = moveX;
      r.player.facingY = moveY;

      const { speedMod } = getAppliedStats();
      r.player.x += moveX * speedMod;
      r.player.y += moveY * speedMod;

      // Wrap x around the world (cylinder), clamp y to map height
      r.player.x = wrapX(r.player.x);
      r.player.y = Math.max(-MAP_HALF_H, Math.min(MAP_HALF_H, r.player.y));
    }

    if (r.player.invulnTime > 0) {
      r.player.invulnTime -= 1;
    }
  };

  // 2. Weapon launch triggers (Vampire survivors weapons)
  const launchWeaponsAndSpells = () => {
    const r = stateRef.current;
    const { dmgMult } = getAppliedStats();

    // Loop through weapons possessed to update CD and fire
    Object.keys(r.weapons).forEach((weaponKey) => {
      const weaponId = weaponKey as WeaponId;
      const level = r.weapons[weaponId];
      if (!level) return;

      if (!r.weaponCooldowns[weaponId]) {
        r.weaponCooldowns[weaponId] = 0;
      }

      r.weaponCooldowns[weaponId] -= 1;

      if (r.weaponCooldowns[weaponId] <= 0) {
        // Fire Spell!
        switch (weaponId) {
          case WeaponId.FLY_SWORD: {
            sfx.playSwordWhoosh();
            const swordCount = level >= 4 ? 3 : level >= 2 ? 2 : 1;
            const cooldown = level >= 3 ? 35 : 45; // lower is faster
            r.weaponCooldowns[weaponId] = cooldown;

            // Find closest monster using wrapped x distance
            let targetEnemy: Enemy | null = null;
            let minDist = 99999;
            r.enemies.forEach((en) => {
              if (en.type === "tribulation_lightning") return;
              const wdx = wrappedDeltaX(r.player.x, en.x);
              const d = Math.hypot(wdx, en.y - r.player.y);
              if (d < minDist) {
                minDist = d;
                targetEnemy = en;
              }
            });

            // Calculate directional angle (use wrapped x for target)
            let angle = Math.atan2(r.player.facingY, r.player.facingX);
            if (targetEnemy) {
              const twdx = wrappedDeltaX(r.player.x, (targetEnemy as Enemy).x);
              angle = Math.atan2((targetEnemy as Enemy).y - r.player.y, twdx);
            }

            for (let i = 0; i < swordCount; i++) {
              const offsetAngle = angle + (i - (swordCount - 1) / 2) * 0.22;
              r.projectiles.push({
                id: Math.random().toString(),
                x: r.player.x,
                y: r.player.y,
                vx: Math.cos(offsetAngle) * 8.5,
                vy: Math.sin(offsetAngle) * 8.5,
                radius: 12,
                damage: Math.round(18 * (1 + (level - 1) * 0.25) * dmgMult),
                color: "#2dd4bf", // cyan blade aura
                type: WeaponId.FLY_SWORD,
                angle: offsetAngle,
                pierce: level >= 3 ? 2 : 1,
                duration: 180, // 3s
              });
            }
            break;
          }

          case WeaponId.THUNDER_STRIKE: {
            const strikes = level >= 4 ? 3 : level >= 2 ? 2 : 1;
            const cooldown = level >= 3 ? 120 : 160;
            r.weaponCooldowns[weaponId] = cooldown;

            for (let k = 0; k < strikes; k++) {
              let strikeX = r.player.x + (Math.random() - 0.5) * 500;
              let strikeY = r.player.y + (Math.random() - 0.5) * 500;

              // Snap directly onto enemy if nearby
              if (r.enemies.length > 0) {
                const randomEnemy = r.enemies[Math.floor(Math.random() * r.enemies.length)];
                if (randomEnemy && randomEnemy.type !== "tribulation_lightning") {
                  strikeX = randomEnemy.x;
                  strikeY = randomEnemy.y;
                }
              }

              // Create immediate lightning warning circle, lightning hits after 18 frames
              r.lightningWarnings.push({
                id: Math.random().toString(),
                x: strikeX,
                y: strikeY,
                timer: 18,
              });
            }
            break;
          }

          case WeaponId.FIRE_RING: {
            const cooldown = level >= 2 ? 140 : 180;
            r.weaponCooldowns[weaponId] = cooldown;
            sfx.playFireBlast();

            // Fire rings expand radially outwards (it's custom animation, projectile with expanding scale)
            const count = level >= 4 ? 2 : 1;
            for (let j = 0; j < count; j++) {
              setTimeout(() => {
                if (isPaused || levelUpOptions) return;
                r.projectiles.push({
                  id: Math.random().toString(),
                  x: r.player.x,
                  y: r.player.y,
                  vx: 0,
                  vy: 0,
                  radius: 40,
                  scale: 1, // Custom expanding key
                  damage: Math.round(22 * (1 + (level - 1) * 0.3) * dmgMult),
                  color: "#f97316", // Amber fire
                  type: WeaponId.FIRE_RING,
                  pierce: 9999, // Pierces all enemies in expanding radius
                  duration: 45, // 0.75s animation
                });
              }, j * 200);
            }
            break;
          }

          case WeaponId.ICE_SHARD: {
            const cd = 100;
            r.weaponCooldowns[weaponId] = cd;
            sfx.playSwordWhoosh();

            const shardCount = level === 5 ? 8 : (level >= 4 ? 6 : (level >= 2 ? 4 : 3));
            const angleStep = level === 5 ? (Math.PI * 2) / 8 : 0.35;
            const baseAngle = Math.atan2(r.player.facingY, r.player.facingX);

            for (let i = 0; i < shardCount; i++) {
              let angle = baseAngle + (i - (shardCount - 1) / 2) * angleStep;
              if (level === 5) angle = i * angleStep; // circular blast circle

              r.projectiles.push({
                id: Math.random().toString(),
                x: r.player.x,
                y: r.player.y,
                vx: Math.cos(angle) * 7,
                vy: Math.sin(angle) * 7,
                radius: 10,
                damage: Math.round(15 * (1 + (level - 1) * 0.2) * dmgMult),
                color: "#38bdf8", // ice blue sky
                type: WeaponId.ICE_SHARD,
                angle: angle,
                pierce: level >= 3 ? 3 : 1,
                duration: 120, // 2s
              });
            }
            break;
          }

          case WeaponId.SHIELD: {
            // Rotational shield items are updated dynamically in entity loop, so we reset cooldown immediately
            r.weaponCooldowns[weaponId] = 9999; 
            break;
          }

          case WeaponId.MAGNET_POT: {
            const timer = level >= 4 ? 600 : level >= 2 ? 900 : 1200; // 10s to 20s
            r.weaponCooldowns[weaponId] = timer;
            sfx.playGemCollect();

            // Emit a visible pulse bubble that pulls ALL gems towards player
            r.projectiles.push({
              id: Math.random().toString(),
              x: r.player.x,
              y: r.player.y,
              vx: 0,
              vy: 0,
              radius: 50,
              scale: 1, // expanding pulse
              damage: 0,
              color: "#d97706", // spirit energy gold aura
              type: WeaponId.MAGNET_POT,
              pierce: 9999,
              duration: 35,
            });

            // Pull trigger
            r.gems.forEach((gem) => {
              gem.isMagnetized = true;
            });

            addFloatingText(r.player.x, r.player.y - 30, "乾坤鼎全力吸气！", "#f59e0b");
            break;
          }
        }
      }
    });

    // Special: Magnet Cauldron Level 5 gives continuous complete attraction of gems
    if (r.weapons[WeaponId.MAGNET_POT] === 5 && r.tickCount % 15 === 0) {
      r.gems.forEach((gem) => {
        gem.isMagnetized = true;
      });
    }

    // Special: Rotating Shield generation
    const shieldLvl = r.weapons[WeaponId.SHIELD];
    if (shieldLvl > 0) {
      const shieldCount = shieldLvl === 5 ? 4 : (shieldLvl >= 4 ? 3 : (shieldLvl >= 2 ? 2 : 1));
      const rotationSpeed = 0.04 + (shieldLvl * 0.005);
      const angleOffset = (Date.now() / 1000) * rotationSpeed * 50; 
      const radiusDist = 65 + (shieldLvl * 5);

      // Clear existing shields inside bullets and rebuild them to rotate
      r.projectiles = r.projectiles.filter((proj) => proj.type !== WeaponId.SHIELD);

      for (let s = 0; s < shieldCount; s++) {
        const radAngle = angleOffset + (s * (Math.PI * 2)) / shieldCount;
        const shieldX = r.player.x + Math.cos(radAngle) * radiusDist;
        const shieldY = r.player.y + Math.sin(radAngle) * radiusDist;

        r.projectiles.push({
          id: `shield_${s}`,
          x: shieldX,
          y: shieldY,
          vx: 0,
          vy: 0,
          radius: shieldLvl === 5 ? 26 : 14,
          damage: Math.round(10 * (1 + shieldLvl * 0.35) * dmgMult),
          color: "#f59e0b", // Gold vajra shield
          type: WeaponId.SHIELD,
          pierce: 9999, // indestructible contact bullet
          duration: 3, // recreate on next frame
        });
      }
    }
  };

  // 3. Spawns, coordinates updates and collisions
  const updateGameEntities = () => {
    const r = stateRef.current;
    const { maxHpMod, armor, magnetRange, expBoost, goldBoost } = getAppliedStats();

    // Spawner tick: Spawns enemies close to player screen edges
    r.spawnTimer += 1;
    const spawnGate = r.stats.isTribulation ? 24 : Math.max(15, 55 - Math.floor(r.stats.timeElapsed / 10)); // spawn speeds up as time passes
    
    if (r.spawnTimer >= spawnGate) {
      r.spawnTimer = 0;
      const count = r.stats.isTribulation ? 4 : 2;
      for (let s = 0; s < count; s++) {
        const spawnAngle = Math.random() * Math.PI * 2;
        const spawnDist = 450 + Math.random() * 80;
        const enemyX = wrapX(r.player.x + Math.cos(spawnAngle) * spawnDist);
        const enemyY = Math.max(-MAP_HALF_H, Math.min(MAP_HALF_H, r.player.y + Math.sin(spawnAngle) * spawnDist));

        // Balance difficulty scales over elapsed time
        const timeFactor = 1 + r.stats.timeElapsed / 100;
        let enemyType: "beast" | "demon" | "specter" | "tribulation_lightning" = "beast";
        let ehp = Math.round(15 * timeFactor);
        let edmg = Math.round(5 * timeFactor);
        let espd = 1.6 + Math.random() * 0.7;
        let ecolor = "#e2e8f0"; // slate common
        let era = 12;

        if (r.stats.timeElapsed > 90 && Math.random() < 0.28) {
          enemyType = "demon";
          ehp = Math.round(45 * timeFactor);
          edmg = Math.round(9 * timeFactor);
          espd = 2.0;
          ecolor = "#fb7185"; // rose color
          era = 15;
        } else if (r.stats.timeElapsed > 180 && Math.random() < 0.22) {
          enemyType = "specter";
          ehp = Math.round(30 * timeFactor);
          edmg = Math.round(12 * timeFactor);
          espd = 1.3;
          ecolor = "#c084fc"; // ghost purple
          era = 14;
        }

        // Limit maximum active mobs to avoid lagging browser canvas (max 500)
        if (r.enemies.length < 500) {
          r.enemies.push({
            id: Math.random().toString(),
            x: enemyX,
            y: enemyY,
            vx: 0,
            vy: 0,
            radius: era,
            speed: espd,
            hp: ehp,
            maxHp: ehp,
            damage: edmg,
            isBoss: false,
            color: ecolor,
            type: enemyType,
          });
        }
      }
    }

    // Mid-game Boss Spawn triggers (2:00 & 4:00)
    if (r.stats.timeElapsed >= 120 && !r.bossSpawned.min2) {
      r.bossSpawned.min2 = true;
      spawnGiganticBoss("赤火王虫 (筑基大圆满妖兽)", "#ea580c", 800, 25, 24);
    }
    if (r.stats.timeElapsed >= 240 && !r.bossSpawned.min4) {
      r.bossSpawned.min4 = true;
      spawnGiganticBoss("幽夜狼王 (金丹期大天魔)", "#7c3aed", 3000, 50, 30);
    }

    // Trigger Climax: "GRAND HEAVENLY TRIBULATION" at 5:00!
    if (r.stats.timeElapsed >= 300 && !r.stats.isTribulation) {
      r.stats.isTribulation = true;
      setIsTribulation(true);
      addFloatingText(r.player.x, r.player.y - 45, "⚠ 劫云滚滚！九重天劫降临！", "#c084fc");
      sfx.playThunder();
    }

    // Spawn tribulation lights during final climax
    if (r.stats.isTribulation && r.tickCount % 40 === 0) {
      // Direct purple lightning bolts locking on coordinates near player
      const tx = r.player.x + (Math.random() - 0.5) * 350;
      const ty = r.player.y + (Math.random() - 0.5) * 350;
      r.lightningWarnings.push({
        id: Math.random().toString(),
        x: tx,
        y: ty,
        timer: 45, // 0.75s dodge delay
      });
    }

    // Process Lightning warnings turning into giant lightning bolts
    r.lightningWarnings = r.lightningWarnings.filter((warn) => {
      warn.timer -= 1;
      if (warn.timer <= 0) {
        // Bolt flashes!
        sfx.playThunder();
        // Create thunder impact visual circle representation
        r.projectiles.push({
          id: Math.random().toString(),
          x: warn.x,
          y: warn.y,
          vx: 0,
          vy: 0,
          radius: 65,
          scale: 1, // shockwave scale
          damage: 0, // Visual only projectile OR deals damage to monsters! Let's make it damage monsters too
          color: "#a855f7",
          type: WeaponId.THUNDER_STRIKE,
          pierce: 9999,
          duration: 20, // lightning fade
        });

        // Lightning damages player if caught inside radius
        const ldx = wrappedDeltaX(warn.x, r.player.x);
        const dp = Math.hypot(ldx, r.player.y - warn.y);
        if (dp < 65 && r.player.invulnTime <= 0) {
          const dmg = r.stats.isTribulation ? 25 : 10;
          r.player.hp = Math.max(0, r.player.hp - dmg);
          r.player.invulnTime = 40; // 0.6s invincibility
          sfx.playHurt();
          addFloatingText(r.player.x, r.player.y - 12, `-${dmg} 天劫伤害`, "#a855f7");
          setCurrentHp(r.player.hp);
          if (r.player.hp <= 0) {
            handleGameOver(false);
          }
        }

        // Lightning also damages ANY enemies caught inside the blast zone
        r.enemies.forEach((enemy) => {
          const edx = wrappedDeltaX(warn.x, enemy.x);
          const de = Math.hypot(edx, enemy.y - warn.y);
          if (de < 65) {
            enemy.hp -= 150; // massive friendly thunder damage to make tribulation visually helpful too!
            addFloatingText(enemy.x, enemy.y - 15, "150! 雷劫反噬", "#c084fc");
            if (enemy.hp <= 0) {
              handleEnemyKilled(enemy);
            }
          }
        });

        return false; // delete warning
      }
      return true;
    });

    // Update Projectiles
    r.projectiles = r.projectiles.filter((proj) => {
      proj.x = wrapX(proj.x + proj.vx);
      proj.y += proj.vy;
      proj.duration -= 1;

      // Remove projectiles that leave the map vertically
      if (proj.y < -MAP_HALF_H - 50 || proj.y > MAP_HALF_H + 50) {
        return false;
      }

      // Handle custom expansion values
      if (proj.type === WeaponId.FIRE_RING || proj.type === WeaponId.MAGNET_POT || proj.type === WeaponId.THUNDER_STRIKE) {
        if (proj.scale) {
          proj.scale += 0.05; // expand ring radius multiplier
        }
      }

      // Check collision with enemies (except visual/magnet potentials)
      if (proj.damage > 0) {
        r.enemies.forEach((enemy) => {
          if (enemy.hp <= 0 || enemy.type === "tribulation_lightning") return;
          const pdx = wrappedDeltaX(proj.x, enemy.x);
          const dist = Math.hypot(pdx, enemy.y - proj.y);
          if (dist < enemy.radius + proj.radius * (proj.scale || 1)) {
            // Weapon hit enemy!
            enemy.hp -= proj.damage;
            proj.pierce -= 1;
            sfx.playHit();

            // Sfx feedback or slowing effects
            if (proj.type === WeaponId.ICE_SHARD) {
              enemy.speed = Math.max(0.6, enemy.speed * 0.65); // speed freeze lag
              addFloatingText(enemy.x, enemy.y - 10, `${proj.damage} 迟滞`, "#38bdf8");
            } else {
              const isCrit = Math.random() < 0.15;
              const actualDmg = isCrit ? Math.round(proj.damage * 1.5) : proj.damage;
              if (isCrit) {
                enemy.hp -= Math.round(proj.damage * 0.5); // extra crit value
              }
              addFloatingText(enemy.x, enemy.y - 10, `${actualDmg}${isCrit ? " 暴击!" : ""}`, isCrit ? "#f59e0b" : "#ffffff", isCrit);
            }

            // Knockback on Fire ring or Shield hit
            if (proj.type === WeaponId.FIRE_RING || proj.type === WeaponId.SHIELD) {
              const dx = enemy.x - r.player.x;
              const dy = enemy.y - r.player.y;
              const len = Math.hypot(dx, dy);
              if (len > 0) {
                enemy.x += (dx / len) * (proj.type === WeaponId.FIRE_RING ? 12 : 3);
                enemy.y += (dy / len) * (proj.type === WeaponId.FIRE_RING ? 12 : 3);
              }
            }

            // Check if monster dies
            if (enemy.hp <= 0) {
              handleEnemyKilled(enemy);
            }
          }
        });
      }

      return proj.duration > 0 && proj.pierce > 0;
    });

    // Update Enemies
    r.enemies = r.enemies.filter((enemy) => {
      if (enemy.hp <= 0) return false;

      // Enemy AI: Track player using wrapped x distance
      const wdx = wrappedDeltaX(enemy.x, r.player.x);
      const dy = r.player.y - enemy.y;
      const dist = Math.hypot(wdx, dy);

      if (dist > 0) {
        enemy.x += (wdx / dist) * enemy.speed;
        enemy.y += (dy / dist) * enemy.speed;
      }

      // Collide with player and inflict damage (use wrapped distance)
      if (dist < enemy.radius + r.player.radius) {
        if (r.player.invulnTime <= 0) {
          // Subtract armor limit from incoming monster hitting power
          const hitPower = Math.max(1, enemy.damage - armor);
          r.player.hp = Math.max(0, r.player.hp - hitPower);
          r.player.invulnTime = 30; // 0.5s frame invulnerability limit
          sfx.playHurt();
          addFloatingText(r.player.x, r.player.y - 15, `-${hitPower} 气血流失`, "#f43f5e");
          setCurrentHp(r.player.hp);

          if (r.player.hp <= 0) {
            handleGameOver(false);
          }
        }
      }

      // Wrap x around the world, clamp y to map
      enemy.x = wrapX(enemy.x);
      enemy.y = Math.max(-MAP_HALF_H, Math.min(MAP_HALF_H, enemy.y));

      return true;
    });

    // Update Energy crystals & Gems absorption
    r.gems = r.gems.filter((gem) => {
      const dx = r.player.x - gem.x;
      const dy = r.player.y - gem.y;
      const distance = Math.hypot(dx, dy);

      // Check magnet pull range trigger
      if (distance < magnetRange) {
        gem.isMagnetized = true;
      }

      if (gem.isMagnetized) {
        // Move magnetic scrolls towards player rapidly
        gem.x += (dx / distance) * 7.5;
        gem.y += (dy / distance) * 7.5;
      }

      // Collect crystal trigger
      if (distance < r.player.radius + gem.radius) {
        sfx.playGemCollect();
        
        // Add collected EXP and funds
        if (gem.expValue > 0) {
          const finalExp = Math.round(gem.expValue * expBoost);
          r.player.exp += finalExp;
          addCollectedExp(finalExp);
        }

        if (gem.stoneValue > 0) {
          const finalGold = Math.round(gem.stoneValue * goldBoost);
          r.stats.spiritStonesCollected += finalGold;
          setStoneCount(r.stats.spiritStonesCollected);
          addFloatingText(gem.x, gem.y - 10, `+${finalGold} 灵石`, "#fbbf24");
        }

        return false; // remove gem
      }

      return true;
    });

    // Update float texts
    r.floatingTexts = r.floatingTexts.filter((txt) => {
      txt.y += txt.vy;
      txt.duration -= 1;
      txt.opacity = txt.duration / 60;
      return txt.duration > 0;
    });
  };

  // Helper trigger for Boss Spawns
  const spawnGiganticBoss = (bossName: string, color: string, hp: number, dmg: number, radius: number) => {
    const r = stateRef.current;
    const spawnAngle = Math.random() * Math.PI * 2;
    const spawnDist = 400;
    const bx = wrapX(r.player.x + Math.cos(spawnAngle) * spawnDist);
    const by = Math.max(-MAP_HALF_H, Math.min(MAP_HALF_H, r.player.y + Math.sin(spawnAngle) * spawnDist));

    r.enemies.push({
      id: Math.random().toString(),
      x: bx,
      y: by,
      vx: 0,
      vy: 0,
      radius,
      speed: 1.1,
      hp: hp,
      maxHp: hp,
      damage: dmg,
      isBoss: true,
      color,
      type: "scorpion_boss",
    });

    addFloatingText(bx, by - 30, `👹 【境界巨怪】${bossName} 现身！`, "#ef4444");
    sfx.playThunder();
  };

  // Handle enemy death logic to drop loot
  const handleEnemyKilled = (enemy: Enemy) => {
    const r = stateRef.current;
    r.stats.enemiesKilled += 1;
    setKilledCount(r.stats.enemiesKilled);

    // Gem drops chance: EXP gems, and occasional high value gold spiritual stones
    const roll = Math.random();
    let gemType: "green" | "blue" | "gold" = "green";
    let expVal = 1;
    let goldVal = 0;
    let color = "#10b981"; // emerald

    if (enemy.isBoss) {
      // Boss always drops highly valuable golden spiritual stones!
      gemType = "gold";
      expVal = 35;
      goldVal = 50;
      color = "#fbbf24"; // golden stone
    } else if (roll < 0.08) {
      // Golden spiritual stone fund
      gemType = "gold";
      expVal = 2;
      goldVal = 2 + Math.floor(Math.random() * 3);
      color = "#fbbf24";
    } else if (roll < 0.22) {
      // Deep blue crystal
      gemType = "blue";
      expVal = 5;
      color = "#60a5fa"; // blue sky
    }

    // Spawn gem
    r.gems.push({
      id: Math.random().toString(),
      x: enemy.x,
      y: enemy.y,
      expValue: expVal,
      stoneValue: goldVal,
      radius: gemType === "green" ? 5 : 8,
      isMagnetized: false,
      color,
    });
  };

  // Level Up logic
  const addCollectedExp = (amt: number) => {
    const r = stateRef.current;
    if (r.player.exp >= r.player.expNeeded) {
      r.player.exp -= r.player.expNeeded;
      r.player.level += 1;
      r.player.expNeeded = getExpNeededForLevel(r.player.level);

      // Upgrade Max Health if level up boosts standard status
      const originalRealm = r.stats.realm;
      r.stats.realm = getRealmByLevel(r.player.level);
      
      const { maxHpMod } = getAppliedStats();
      r.player.maxHp = maxHpMod;
      r.player.hp = Math.min(maxHpMod, r.player.hp + 25); // partial heal on thresholds

      // UI updates
      setPlayerLevel(r.player.level);
      setPlayerExp(r.player.exp);
      setCurrentHp(r.player.hp);
      setMaxHp(r.player.maxHp);
      setCurrentRealm(r.stats.realm);

      // Play dramatic breakthrough chimes if crossed complete realms!
      if (r.stats.realm !== originalRealm) {
        sfx.playLevelUp();
        addFloatingText(r.player.x, r.player.y - 50, `🪐 突破境界：【${r.stats.realm}】!`, "#fbbf24", true);
        
        if (breakthroughTimeoutRef.current) {
          clearTimeout(breakthroughTimeoutRef.current);
        }
        setBreakthroughText(r.stats.realm);
        breakthroughTimeoutRef.current = setTimeout(() => {
          setBreakthroughText(null);
        }, 2500);
      } else {
        sfx.playLevelUp();
      }

      triggerUpgradeScreenSelection();
    } else {
      setPlayerExp(r.player.exp);
    }
  };

  // Build random Roguelike Upgrade choices for Level up pause screen
  const triggerUpgradeScreenSelection = () => {
    const r = stateRef.current;
    const options: UpgradeOption[] = [];

    // All available upgrade weapon ids
    const allWeaponIds = Object.values(WeaponId);
    const allTalentIds = Object.values(TalentId);

    // 1. Gather choices from Weapon spells
    allWeaponIds.forEach((wId) => {
      const curLvl = r.weapons[wId] || 0;
      if (curLvl < 5) {
        options.push({
          id: wId,
          type: "WEAPON",
          name: SKILL_METADATA[wId]?.name || wId,
          description: SKILL_METADATA[wId]?.desc || "",
          level: curLvl,
          maxLevel: 5,
          icon: SKILL_METADATA[wId]?.icon || "🔮"
        });
      }
    });

    // 2. Gather choices from Passives
    allTalentIds.forEach((tId) => {
      const curLvl = r.talents[tId] || 0;
      if (curLvl < 5) {
        options.push({
          id: tId,
          type: "TALENT",
          name: SKILL_METADATA[tId]?.name || tId,
          description: SKILL_METADATA[tId]?.desc || "",
          level: curLvl,
          maxLevel: 5,
          icon: SKILL_METADATA[tId]?.icon || "📈"
        });
      }
    });

    // Pick 3 completely random, non-repeating cards
    const shuffled = options.sort(() => 0.5 - Math.random());
    const finalSelection = shuffled.slice(0, 3);

    if (finalSelection.length > 0) {
      setLevelUpOptions(finalSelection);
    } else {
      // In case they maxed out absolutely everything, heal player as alternative bonus!
      const { maxHpMod } = getAppliedStats();
      r.player.hp = maxHpMod;
      setCurrentHp(maxHpMod);
      addFloatingText(r.player.x, r.player.y - 20, "仙体已至圣境！气血全满！", "#10b981");
    }
  };

  // Handles actual selection confirmation
  const handleUpgradeCardSelected = (opt: UpgradeOption) => {
    const r = stateRef.current;
    if (opt.type === "WEAPON") {
      const curLvl = r.weapons[opt.id as WeaponId] || 0;
      r.weapons[opt.id as WeaponId] = curLvl + 1;
    } else {
      const curLvl = r.talents[opt.id as TalentId] || 0;
      r.talents[opt.id as TalentId] = curLvl + 1;
    }

    // Refresh core stats with new passive ratios
    const { maxHpMod } = getAppliedStats();
    r.player.maxHp = maxHpMod;
    setMaxHp(maxHpMod);

    setLevelUpOptions(null);
  };

  // Exit trigger
  const handleGameOver = (isVictory: boolean) => {
    const r = stateRef.current;
    r.stats.realm = currentRealm;
    r.stats.timeElapsed = r.stats.timeElapsed;
    onGameFinished(r.stats, isVictory);
  };

  // Main 2D Canvas Graphics Drawing methods
  const renderGraphics = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const r = stateRef.current;
    const cw = r.screenSize.width;
    const ch = r.screenSize.height;

    // Center camera onto the player
    r.camera.x = r.player.x - cw / 2;
    r.camera.y = r.player.y - ch / 2;

    // Center of the world in relative screen coordinates
    const cx = 0 - r.camera.x;
    const cy = 0 - r.camera.y;

    // Clear Screen with deep ink-wash jade canvas color (fallback & surrounding void)
    ctx.fillStyle = "#060d13"; // Deep absolute ink tea color
    ctx.fillRect(0, 0, cw, ch);

    const time = Date.now() * 0.001;
    // Draw the world map (3 copies for seamless horizontal wrapping)
    const worldMap = worldMapRef.current;
    if (worldMap) {
      const mapY = -MAP_HALF_H - r.camera.y;
      for (let tile = -1; tile <= 1; tile++) {
        const mapX = -MAP_HALF_W - r.camera.x + tile * MAP_WORLD_W;
        ctx.drawImage(worldMap, mapX, mapY, MAP_WORLD_W, MAP_WORLD_H);
      }
    }

    ctx.save();
    ctx.strokeStyle = "rgba(245, 158, 11, 0.1)";
    ctx.lineWidth = 3;
    ctx.setLineDash([20, 30]);
    const bX1 = -800 - r.camera.x;
    if (bX1 > -10 && bX1 < cw + 10) {
      ctx.beginPath();
      ctx.moveTo(bX1, -MAP_HALF_H - r.camera.y);
      ctx.lineTo(bX1, MAP_HALF_H - r.camera.y);
      ctx.stroke();
    }
    const bX2 = 800 - r.camera.x;
    if (bX2 > -10 && bX2 < cw + 10) {
      ctx.beginPath();
      ctx.moveTo(bX2, -2400 - r.camera.y);
      ctx.lineTo(bX2, 2400 - r.camera.y);
      ctx.stroke();
    }
    const bY1 = -800 - r.camera.y;
    if (bY1 > -10 && bY1 < ch + 10) {
      ctx.beginPath();
      ctx.moveTo(-2400 - r.camera.x, bY1);
      ctx.lineTo(2400 - r.camera.x, bY1);
      ctx.stroke();
    }
    const bY2 = 800 - r.camera.y;
    if (bY2 > -10 && bY2 < ch + 10) {
      ctx.beginPath();
      ctx.moveTo(-2400 - r.camera.x, bY2);
      ctx.lineTo(2400 - r.camera.x, bY2);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.restore();

    const drawSpiritualRiver = () => {
      ctx.save();
      const riverWidth = 120;
      const riverPoints = [
        { x: -2400, y: -200 },
        { x: -1600, y: -350 },
        { x: -800, y: -200 },
        { x: 0, y: 100 },
        { x: 800, y: 300 },
        { x: 1600, y: 400 },
        { x: 2400, y: 450 }
      ];

      ctx.beginPath();
      ctx.moveTo(riverPoints[0].x - r.camera.x, riverPoints[0].y - r.camera.y);
      for (let i = 1; i < riverPoints.length; i++) {
        const prev = riverPoints[i - 1];
        const curr = riverPoints[i];
        const cpx = (prev.x + curr.x) / 2;
        const cpy = (prev.y + curr.y) / 2;
        ctx.quadraticCurveTo(prev.x - r.camera.x, prev.y - r.camera.y, cpx - r.camera.x, cpy - r.camera.y);
      }
      ctx.lineTo(2400 - r.camera.x, 450 - r.camera.y);

      ctx.strokeStyle = "rgba(45, 212, 191, 0.08)";
      ctx.lineWidth = riverWidth + 40;
      ctx.lineCap = "round";
      ctx.stroke();

      ctx.strokeStyle = "rgba(6, 182, 212, 0.15)";
      ctx.lineWidth = riverWidth;
      ctx.stroke();

      ctx.strokeStyle = "rgba(103, 232, 249, 0.25)";
      ctx.lineWidth = riverWidth * 0.6;
      ctx.stroke();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 2;
      ctx.setLineDash([15, 45]);
      ctx.lineDashOffset = -(time * 50) % 60;
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.restore();
    };
    drawSpiritualRiver();

    const drawLake = (lx: number, ly: number, radius: number, name: string) => {
      const sx = lx - r.camera.x;
      const sy = ly - r.camera.y;
      if (sx < -radius * 2 || sx > cw + radius * 2 || sy < -radius * 2 || sy > ch + radius * 2) return;

      ctx.save();
      const lakeGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, radius);
      lakeGrad.addColorStop(0, "rgba(103, 232, 249, 0.25)");
      lakeGrad.addColorStop(0.5, "rgba(6, 182, 212, 0.15)");
      lakeGrad.addColorStop(1, "rgba(8, 145, 178, 0.05)");
      ctx.fillStyle = lakeGrad;
      ctx.beginPath();
      ctx.ellipse(sx, sy, radius, radius * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(103, 232, 249, 0.3)";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        const waveR = radius * (0.3 + i * 0.2);
        ctx.beginPath();
        ctx.ellipse(sx, sy, waveR, waveR * 0.7, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.fillStyle = "rgba(6, 13, 19, 0.7)";
      ctx.fillRect(sx - 45, sy + radius * 0.5 + 10, 90, 18);
      ctx.strokeStyle = "rgba(6, 182, 212, 0.4)";
      ctx.strokeRect(sx - 45, sy + radius * 0.5 + 10, 90, 18);
      ctx.font = "bold 10px serif";
      ctx.fillStyle = "#67e8f9";
      ctx.textAlign = "center";
      ctx.fillText(name, sx, sy + radius * 0.5 + 23);
      ctx.restore();
    };

    drawLake(-1200, 400, 80, "灵泉湖");
    drawLake(1200, -400, 100, "仙瑶池");
    drawLake(0, 800, 70, "洗心潭");
    drawLake(-400, -1200, 90, "寒月湾");
    drawLake(1400, 1200, 85, "归墟海眼");

    const drawInkMountain = (mx: number, my: number, mw: number, mh: number, name: string, state: StateInfo) => {
      const screenX = mx - r.camera.x;
      const screenY = my - r.camera.y;
      if (screenX < -mw || screenX > cw + mw || screenY < -mh || screenY > ch + mh) return;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(screenX - mw / 2, screenY);
      ctx.lineTo(screenX - mw * 0.15, screenY - mh * 0.3);
      ctx.lineTo(screenX, screenY - mh);
      ctx.lineTo(screenX + mw * 0.15, screenY - mh * 0.3);
      ctx.lineTo(screenX + mw / 2, screenY);
      ctx.closePath();

      const mGrad = ctx.createLinearGradient(screenX - mw / 2, screenY, screenX, screenY - mh);
      mGrad.addColorStop(0, state.primaryColor);
      mGrad.addColorStop(0.4, state.secondaryColor);
      mGrad.addColorStop(0.8, state.accentColor + "66");
      mGrad.addColorStop(1, state.accentColor + "33");
      ctx.fillStyle = mGrad;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(screenX, screenY - mh);
      ctx.lineTo(screenX + mw / 2, screenY);
      ctx.lineTo(screenX + mw * 0.1, screenY - mh * 0.3);
      ctx.closePath();
      const darkGrad = ctx.createLinearGradient(screenX, screenY - mh, screenX + mw / 2, screenY);
      darkGrad.addColorStop(0, "rgba(0,0,0,0.3)");
      darkGrad.addColorStop(1, "rgba(0,0,0,0.6)");
      ctx.fillStyle = darkGrad;
      ctx.fill();

      ctx.strokeStyle = state.accentColor + "88";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(screenX - mw / 2, screenY);
      ctx.lineTo(screenX - mw * 0.15, screenY - mh * 0.3);
      ctx.lineTo(screenX, screenY - mh);
      ctx.lineTo(screenX + mw * 0.15, screenY - mh * 0.3);
      ctx.lineTo(screenX + mw / 2, screenY);
      ctx.stroke();

      ctx.fillStyle = state.accentColor + "66";
      for (let i = 0; i < 3; i++) {
        const px = screenX - 15 + i * 12 + Math.sin(time + i) * 3;
        const py = screenY - mh + 20 + i * 15;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px - 4, py + 10);
        ctx.lineTo(px + 4, py + 10);
        ctx.closePath();
        ctx.fill();
      }

      ctx.fillStyle = "rgba(6, 13, 19, 0.75)";
      ctx.fillRect(screenX - 50, screenY + 8, 100, 18);
      ctx.strokeStyle = state.accentColor + "55";
      ctx.strokeRect(screenX - 50, screenY + 8, 100, 18);
      ctx.font = "bold 10px serif";
      ctx.fillStyle = state.accentColor;
      ctx.textAlign = "center";
      ctx.fillText(name, screenX, screenY + 21);
      ctx.restore();
    };

    drawInkMountain(-1600, -1600, 320, 350, "北寒极境 · 冰川古殿", getStateOfCoordinates(-1600, -1600));
    drawInkMountain(0, -1500, 280, 300, "东瑶仙境 · 仙草云崖", getStateOfCoordinates(0, -1500));
    drawInkMountain(1600, -1600, 340, 380, "苍莽山脉 · 炼狱魔域", getStateOfCoordinates(1600, -1600));
    drawInkMountain(-1600, 0, 300, 280, "西荒残刹 · 戈壁古神坛", getStateOfCoordinates(-1600, 0));
    drawInkMountain(400, 200, 260, 250, "中州主峰 · 太极至尊龙脉", getStateOfCoordinates(400, 200));
    drawInkMountain(1600, 0, 300, 320, "青岚九峰 · 人族正统道山", getStateOfCoordinates(1600, 0));
    drawInkMountain(-1600, 1600, 320, 340, "南疆毒泽 · 巫蛊神坛", getStateOfCoordinates(-1600, 1600));
    drawInkMountain(0, 1600, 360, 380, "陨星绝谷 · 天火源地", getStateOfCoordinates(0, 1600));
    drawInkMountain(1600, 1600, 300, 290, "瀚沧海界 · 归墟幻岛", getStateOfCoordinates(1600, 1600));

    const drawFloatingClouds = () => {
      ctx.save();
      for (let i = 0; i < 8; i++) {
        const cloudX = ((time * 15 + i * 600) % MAP_WORLD_W) - MAP_HALF_W - r.camera.x;
        const cloudY = -800 - r.camera.y + Math.sin(time * 0.5 + i) * 100;
        const cloudSize = 80 + i * 15;

        ctx.fillStyle = "rgba(45, 212, 191, 0.04)";
        ctx.beginPath();
        ctx.arc(cloudX, cloudY, cloudSize, 0, Math.PI * 2);
        ctx.arc(cloudX - cloudSize * 0.6, cloudY + 15, cloudSize * 0.7, 0, Math.PI * 2);
        ctx.arc(cloudX + cloudSize * 0.6, cloudY - 10, cloudSize * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };
    drawFloatingClouds();

    const drawImmortalCranes = () => {
      ctx.save();
      for (let i = 0; i < 3; i++) {
        const craneX = ((time * 20 + i * 800) % MAP_WORLD_W) - MAP_HALF_W - r.camera.x;
        const craneY = -600 - r.camera.y + Math.sin(time * 0.8 + i * 2) * 80;

        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.beginPath();
        ctx.ellipse(craneX, craneY, 8, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
        ctx.lineWidth = 1;
        const wingAngle = Math.sin(time * 5 + i) * 0.3;
        ctx.beginPath();
        ctx.moveTo(craneX - 8, craneY);
        ctx.lineTo(craneX - 20, craneY - 8 + wingAngle * 10);
        ctx.moveTo(craneX + 8, craneY);
        ctx.lineTo(craneX + 20, craneY - 8 - wingAngle * 10);
        ctx.stroke();
      }
      ctx.restore();
    };
    drawImmortalCranes();

    const drawSpiritParticles = () => {
      ctx.save();
      for (let i = 0; i < 20; i++) {
        const px = ((time * 10 + i * 200) % MAP_WORLD_W) - MAP_HALF_W - r.camera.x;
        const py = ((time * 8 + i * 150) % MAP_WORLD_H) - MAP_HALF_H - r.camera.y;
        const pSize = 2 + Math.sin(time * 2 + i) * 1;
        const pAlpha = 0.3 + Math.sin(time * 3 + i * 0.5) * 0.2;

        ctx.fillStyle = `rgba(103, 232, 249, ${pAlpha})`;
        ctx.beginPath();
        ctx.arc(px, py, pSize, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };
    drawSpiritParticles();


    // --- Draw The Five Cultivation Sects (五大圣地宗门) ---

    // 1. 落云宗 · 天机阁 (Han Li's core spell sect) at (-800, 800)
    const drawLuoyunSect = () => {
      const sx = -850 - r.camera.x;
      const sy = 800 - r.camera.y;
      if (sx < -200 || sx > cw + 200 || sy < -200 || sy > ch + 200) return;

      ctx.save();
      // Glowing deep green spiritual assembly ground ring (radius 100)
      ctx.strokeStyle = "rgba(52, 211, 153, 0.15)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(sx, sy, 100, 0, Math.PI * 2);
      ctx.stroke();

      // Inner revolving celestial ring
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate((Date.now() * 0.0005) % (Math.PI * 2));
      ctx.strokeStyle = "rgba(52, 211, 153, 0.3)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, 75, 0, Math.PI * 2);
      ctx.stroke();
      
      // Draw 4 circular nodes representing array pins
      for (let i = 0; i < 4; i++) {
        const rad = i * Math.PI / 2;
        ctx.fillStyle = "#10b981";
        ctx.beginPath();
        ctx.arc(Math.cos(rad) * 75, Math.sin(rad) * 75, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(Math.cos(rad) * 75, Math.sin(rad) * 75, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Ancient temple architecture pedestal
      ctx.fillStyle = "rgba(10, 25, 20, 0.9)";
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.rect(sx - 35, sy - 20, 70, 40);
      ctx.fill();
      ctx.stroke();

      // Miniature green pagoda tier-2 roof
      ctx.fillStyle = "rgba(16, 185, 129, 0.8)";
      ctx.beginPath();
      ctx.moveTo(sx - 45, sy - 20);
      ctx.lineTo(sx, sy - 55);
      ctx.lineTo(sx + 45, sy - 20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Pagoda tip
      ctx.fillStyle = "#f59e0b"; // Golden core
      ctx.beginPath();
      ctx.arc(sx, sy - 58, 4, 0, Math.PI * 2);
      ctx.fill();

      // Label
      ctx.fillStyle = "rgba(6, 13, 19, 0.75)";
      ctx.fillRect(sx - 75, sy + 35, 150, 20);
      ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
      ctx.strokeRect(sx - 75, sy + 35, 150, 20);
      ctx.font = "bold 11px font-serif";
      ctx.fillStyle = "#34d399";
      ctx.textAlign = "center";
      ctx.fillText("落云宗 · 天机阁", sx, sy + 49);

      ctx.restore();
    };

    // 2. 青云剑派 · 剑心冢 (Lu Xueqi's core sword sect) at (-800, -800)
    const drawQingyunSect = () => {
      const sx = -800 - r.camera.x;
      const sy = -800 - r.camera.y;
      if (sx < -200 || sx > cw + 200 || sy < -200 || sy > ch + 200) return;

      ctx.save();
      // Glowing gold sword terrace rim
      ctx.strokeStyle = "rgba(245, 158, 11, 0.16)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(sx, sy, 110, 0, Math.PI * 2);
      ctx.stroke();

      // Inner sword alignment sigil
      ctx.strokeStyle = "rgba(245, 158, 11, 0.35)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(sx, sy, 85, 0, Math.PI * 2);
      ctx.stroke();

      // Draw 8 floating miniature blades orbiting terrace pointing inwards
      const spinAngle = (Date.now() * 0.0008) % (Math.PI * 2);
      for (let i = 0; i < 8; i++) {
        const bladeAngle = spinAngle + (i * Math.PI / 4);
        const bx = sx + Math.cos(bladeAngle) * 85;
        const by = sy + Math.sin(bladeAngle) * 85;

        ctx.save();
        ctx.translate(bx, by);
        ctx.rotate(bladeAngle + Math.PI / 2); // align pointing towards center
        
        ctx.strokeStyle = "rgba(245, 158, 11, 0.7)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(0, 10);
        ctx.moveTo(-4, -2);
        ctx.lineTo(4, -2); // cross guard
        ctx.stroke();
        ctx.restore();
      }

      // Massive Master Ancestral Stone Sword in center
      ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
      ctx.lineWidth = 4;
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#f59e0b";
      ctx.beginPath();
      ctx.moveTo(sx, sy + 30);
      ctx.lineTo(sx, sy - 50); // Huge sword blade
      ctx.stroke();

      // Golden sword hilt and crossguard
      ctx.strokeStyle = "#f1f5f9";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(sx - 16, sy + 15);
      ctx.lineTo(sx + 16, sy + 15); // Guard
      ctx.moveTo(sx, sy + 15);
      ctx.lineTo(sx, sy + 38); // Hilt grip
      ctx.stroke();
      ctx.shadowBlur = 0; // reset

      // Label
      ctx.fillStyle = "rgba(6, 13, 19, 0.75)";
      ctx.fillRect(sx - 75, sy + 48, 150, 20);
      ctx.strokeStyle = "rgba(245, 158, 11, 0.4)";
      ctx.strokeRect(sx - 75, sy + 48, 150, 20);
      ctx.font = "bold 11px font-serif";
      ctx.fillStyle = "#fbbf24";
      ctx.textAlign = "center";
      ctx.fillText("青云仙宗 · 剑心冢", sx, sy + 62);

      ctx.restore();
    };

    // 3. 药皇谷 · 玄天鼎 (Xiao Yan's alchemy valley) at (850, -850)
    const drawYaohuangSect = () => {
      const sx = 850 - r.camera.x;
      const sy = -850 - r.camera.y;
      if (sx < -200 || sx > cw + 200 || sy < -200 || sy > ch + 200) return;

      ctx.save();
      // Glowing purple cauldrons circle line
      ctx.strokeStyle = "rgba(168, 85, 247, 0.16)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(sx, sy, 100, 0, Math.PI * 2);
      ctx.stroke();

      // Swirling active violet fire aura circles
      ctx.strokeStyle = "rgba(168, 85, 247, 0.25)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(sx, sy, 80, 0, Math.PI * 2);
      ctx.stroke();

      // Draw purple fire flame flares around boundary
      const pulses = Math.sin(Date.now() * 0.003) * 6;
      ctx.fillStyle = "rgba(168, 85, 247, 0.15)";
      ctx.beginPath();
      ctx.arc(sx, sy, 55 + pulses, 0, Math.PI * 2);
      ctx.fill();

      // Main heavy 3D alchemy cauldron
      ctx.fillStyle = "rgba(20, 10, 35, 0.95)";
      ctx.strokeStyle = "#a855f7";
      ctx.lineWidth = 2.5;

      // Draw Cauldron Bowl
      ctx.beginPath();
      ctx.arc(sx, sy, 26, 0, Math.PI, false); // Bottom curve
      ctx.lineTo(sx - 26, sy - 15);
      ctx.lineTo(sx + 26, sy - 15);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Cauldron lid loop
      ctx.beginPath();
      ctx.arc(sx, sy - 15, 18, Math.PI, 0, false);
      ctx.stroke();
      ctx.fillStyle = "#d8b4fe";
      ctx.beginPath();
      ctx.arc(sx, sy - 30, 4, 0, Math.PI * 2);
      ctx.fill();

      // Cauldron handles
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sx - 28, sy - 5, 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(sx + 28, sy - 5, 6, 0, Math.PI * 2);
      ctx.stroke();

      // Cauldron legs
      ctx.beginPath();
      ctx.moveTo(sx - 15, sy + 25);
      ctx.lineTo(sx - 24, sy + 38);
      ctx.moveTo(sx + 15, sy + 25);
      ctx.lineTo(sx + 24, sy + 38);
      ctx.stroke();

      // Label
      ctx.fillStyle = "rgba(6, 13, 19, 0.75)";
      ctx.fillRect(sx - 75, sy + 43, 150, 20);
      ctx.strokeStyle = "rgba(168, 85, 247, 0.4)";
      ctx.strokeRect(sx - 75, sy + 43, 150, 20);
      ctx.font = "bold 11px font-serif";
      ctx.fillStyle = "#c084fc";
      ctx.textAlign = "center";
      ctx.fillText("药皇古谷 · 玄天鼎", sx, sy + 57);

      ctx.restore();
    };

    // 4. 万兽蛮神殿 (Mann Shen's barbaric body training shrine) at (850, 800)
    const drawBarbaricSect = () => {
      const sx = 850 - r.camera.x;
      const sy = 800 - r.camera.y;
      if (sx < -200 || sx > cw + 200 || sy < -200 || sy > ch + 200) return;

      ctx.save();
      // Wild crimson boundary ring
      ctx.strokeStyle = "rgba(239, 68, 68, 0.15)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(sx, sy, 90, 0, Math.PI * 2);
      ctx.stroke();

      // Inner jagged octane array
      ctx.strokeStyle = "rgba(239, 68, 68, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i <= 8; i++) {
        const rad = i * Math.PI / 4;
        const outerHex = (i % 2 === 0) ? 75 : 55;
        const hx = sx + Math.cos(rad) * outerHex;
        const hy = sy + Math.sin(rad) * outerHex;
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.stroke();

      // Obsidian barbaric totem obelisk pillars (drawn as twin black monolith structures)
      ctx.fillStyle = "rgba(15, 5, 5, 0.98)";
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 2;

      // Draw Left Totem
      ctx.beginPath();
      ctx.moveTo(sx - 25, sy + 25);
      ctx.lineTo(sx - 20, sy - 35);
      ctx.lineTo(sx - 10, sy - 35);
      ctx.lineTo(sx - 5, sy + 25);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Draw Right Totem
      ctx.beginPath();
      ctx.moveTo(sx + 5, sy + 25);
      ctx.lineTo(sx + 10, sy - 35);
      ctx.lineTo(sx + 20, sy - 35);
      ctx.lineTo(sx + 25, sy + 25);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Totem carvings glow marks
      ctx.strokeStyle = "#f87171";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(sx - 15, sy + 15);
      ctx.lineTo(sx - 15, sy - 20);
      ctx.moveTo(sx + 15, sy + 15);
      ctx.lineTo(sx + 15, sy - 20);
      ctx.stroke();

      // Molten magma fire core
      const bob = Math.sin(Date.now() * 0.002) * 4;
      ctx.fillStyle = "#ef4444";
      ctx.shadowBlur = 12;
      ctx.shadowColor = "#f87171";
      ctx.beginPath();
      ctx.arc(sx, sy + 12, 10 + bob, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0; // reset

      // Label
      ctx.fillStyle = "rgba(6, 13, 19, 0.75)";
      ctx.fillRect(sx - 75, sy + 40, 150, 20);
      ctx.strokeStyle = "rgba(239, 68, 68, 0.4)";
      ctx.strokeRect(sx - 75, sy + 40, 150, 20);
      ctx.font = "bold 11px font-serif";
      ctx.fillStyle = "#f87171";
      ctx.textAlign = "center";
      ctx.fillText("万兽蛮荒宗 · 圣殿", sx, sy + 54);

      ctx.restore();
    };

    // 5. 太阴玄寒仙宫 (Frost Deity's sacred ice mountain domain) at (0, -1100)
    const drawFrostSect = () => {
      const sx = 0 - r.camera.x;
      const sy = -1100 - r.camera.y;
      if (sx < -200 || sx > cw + 200 || sy < -200 || sy > ch + 200) return;

      ctx.save();
      // Glowing snowflake radial rim
      ctx.strokeStyle = "rgba(147, 197, 253, 0.16)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(sx, sy, 110, 0, Math.PI * 2);
      ctx.stroke();

      // Spinning geometric ice runes
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(-(Date.now() * 0.0004) % (Math.PI * 2));
      ctx.strokeStyle = "rgba(147, 197, 253, 0.4)";
      ctx.lineWidth = 1;
      
      // Draw 6 snowflake spikes
      for (let i = 0; i < 6; i++) {
        const rad = i * Math.PI / 3;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(rad) * 90, Math.sin(rad) * 90);
        
        // Minor snowflake branches
        const bx1 = Math.cos(rad) * 60 + Math.cos(rad + Math.PI/6) * 15;
        const by1 = Math.sin(rad) * 60 + Math.sin(rad + Math.PI/6) * 15;
        const bx2 = Math.cos(rad) * 60 + Math.cos(rad - Math.PI/6) * 15;
        const by2 = Math.sin(rad) * 60 + Math.sin(rad - Math.PI/6) * 15;
        ctx.moveTo(Math.cos(rad) * 60, Math.sin(rad) * 60);
        ctx.lineTo(bx1, by1);
        ctx.moveTo(Math.cos(rad) * 60, Math.sin(rad) * 60);
        ctx.lineTo(bx2, by2);
        ctx.stroke();
      }
      ctx.restore();

      // Crystalline translucent Ice Palace in center
      ctx.fillStyle = "rgba(15, 30, 50, 0.9)";
      ctx.strokeStyle = "#60a5fa";
      ctx.lineWidth = 2;

      // Base block
      ctx.beginPath();
      ctx.rect(sx - 30, sy - 15, 60, 35);
      ctx.fill();
      ctx.stroke();

      // Tall central ice crystal tower
      ctx.fillStyle = "rgba(96, 165, 250, 0.4)";
      ctx.beginPath();
      ctx.moveTo(sx - 15, sy - 15);
      ctx.lineTo(sx, sy - 52);
      ctx.lineTo(sx + 15, sy - 15);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Orbiting shining frost spark
      const floatH = Math.sin(Date.now() * 0.004) * 8;
      ctx.fillStyle = "#ffffff";
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#93c5fd";
      ctx.beginPath();
      ctx.arc(sx, sy - 58 + floatH, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0; // reset

      // Label
      ctx.fillStyle = "rgba(6, 13, 19, 0.75)";
      ctx.fillRect(sx - 75, sy + 43, 150, 20);
      ctx.strokeStyle = "rgba(96, 165, 250, 0.4)";
      ctx.strokeRect(sx - 75, sy + 43, 150, 20);
      ctx.font = "bold 11px font-serif";
      ctx.fillStyle = "#93c5fd";
      ctx.textAlign = "center";
      ctx.fillText("太阴仙宫 · 万寒极境", sx, sy + 57);

      ctx.restore();
    };

    // Draw the active shrines, arrays and pavilions onto map
    drawLuoyunSect();
    drawQingyunSect();
    drawYaohuangSect();
    drawBarbaricSect();
    drawFrostSect();

    ctx.restore(); // Restore outer circular clipping masks!

    // Beautiful atmospheric radial light overlay centered on player to create deep dimensional vignette
    ctx.save();
    const radGrad = ctx.createRadialGradient(
      cw / 2, ch / 2, 80,
      cw / 2, ch / 2, Math.max(cw, ch) * 0.75
    );
    radGrad.addColorStop(0, "rgba(6, 13, 19, 0.0)");
    radGrad.addColorStop(0.35, "rgba(6, 13, 19, 0.1)");
    radGrad.addColorStop(0.7, "rgba(6, 13, 19, 0.6)");
    radGrad.addColorStop(1, "rgba(6, 13, 19, 0.95)");

    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, cw, ch);
    ctx.restore();

    // --- Mystical Taiji Bagua Array System at absolute center (0, 0) ---
    if (cx > -1600 && cx < cw + 1600 && cy > -1600 && cy < ch + 1600) {
      ctx.save();
      
      // 1. Giant outermost ancestral protection array (Radius 1200)
      ctx.strokeStyle = "rgba(16, 185, 129, 0.035)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 1200, 0, Math.PI * 2);
      ctx.stroke();

      // 2. Outer Lopan talisman ring (Radius 800)
      ctx.strokeStyle = "rgba(245, 158, 11, 0.04)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 800, 0, Math.PI * 2);
      ctx.stroke();

      // 3. Ancient Chinese Trigrams Ring (Radius 450)
      // Trigonometric placement of Fuxi Bagua symbols:
      const trigrams = [
        { symbol: "☰", name: "乾天 (Qián)" },
        { symbol: "☴", name: "巽风 (Xùn)" },
        { symbol: "☲", name: "离火 (Lí)" },
        { symbol: "☷", name: "坤地 (Kūn)" },
        { symbol: "☱", name: "兑泽 (Duì)" },
        { symbol: "☵", name: "坎水 (Kǎn)" },
        { symbol: "☶", name: "艮山 (Gèn)" },
        { symbol: "☳", name: "震雷 (Zhèn)" }
      ];

      ctx.font = "bold 13px 'Georgia', serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      trigrams.forEach((tg, idx) => {
        const angle = (idx * Math.PI) / 4;
        const tx = cx + Math.cos(angle) * 450;
        const ty = cy + Math.sin(angle) * 450;
        
        ctx.fillStyle = "rgba(245, 158, 11, 0.15)"; // Soft golden amber
        ctx.fillText(`${tg.symbol} ${tg.name}`, tx, ty);
      });

      // 4. Rotating middle ring (Radius 280) with ancient scripture
      ctx.save();
      ctx.translate(cx, cy);
      const arrayRotation = (Date.now() * 0.00015) % (Math.PI * 2);
      ctx.rotate(arrayRotation);
      
      ctx.strokeStyle = "rgba(45, 212, 191, 0.08)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 280, 0, Math.PI * 2);
      ctx.stroke();

      // Write spinning ancient Sanskrit/Taoist protective coordinates
      ctx.fillStyle = "rgba(45, 212, 191, 0.18)";
      ctx.font = "11px 'Courier New', monospace";
      const runes = ["天", "地", "玄", "黄", "宇", "宙", "洪", "荒", "金", "木", "水", "火", "土", "阴", "阳", "极"];
      runes.forEach((rune, index) => {
        const runeAngle = (index * Math.PI) / 8;
        const rx = Math.cos(runeAngle) * 280;
        const ry = Math.sin(runeAngle) * 280;
        ctx.save();
        ctx.translate(rx, ry);
        ctx.rotate(runeAngle + Math.PI / 2);
        ctx.fillText(rune, 0, 0);
        ctx.restore();
      });
      ctx.restore();

      // 5. Giant Taiji Yin-Yang Center Fish (Radius 160)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-arrayRotation * 0.6); // Rotates backward for balancing visual dynamic

      // Dark pool (Yin)
      ctx.fillStyle = "rgba(20, 184, 166, 0.04)";
      ctx.beginPath();
      ctx.arc(0, 0, 160, -Math.PI / 2, Math.PI / 2, false);
      ctx.fill();

      // Light pool (Yang)
      ctx.fillStyle = "rgba(245, 158, 11, 0.04)";
      ctx.beginPath();
      ctx.arc(0, 0, 160, Math.PI / 2, -Math.PI / 2, false);
      ctx.fill();

      // Small interlocking curves to form the fish shapes
      ctx.fillStyle = "rgba(20, 184, 166, 0.04)";
      ctx.beginPath();
      ctx.arc(0, 80, 80, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(245, 158, 11, 0.04)";
      ctx.beginPath();
      ctx.arc(0, -80, 80, 0, Math.PI * 2);
      ctx.fill();

      // Eyes of the fish
      ctx.fillStyle = "rgba(245, 158, 11, 0.08)";
      ctx.beginPath();
      ctx.arc(0, 80, 16, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(20, 184, 166, 0.08)";
      ctx.beginPath();
      ctx.arc(0, -80, 16, 0, Math.PI * 2);
      ctx.fill();

      // Taiji Border line
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, 160, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
      ctx.restore();
    }

    // Draw majestic Mortal Realm boundaries matching map size
    ctx.strokeStyle = "rgba(245, 158, 11, 0.45)";
    ctx.lineWidth = 10;
    ctx.strokeRect(-MAP_HALF_W - r.camera.x, -MAP_HALF_H - r.camera.y, MAP_WORLD_W, MAP_WORLD_H);

    ctx.strokeStyle = "rgba(45, 212, 191, 0.25)"; // Cyan inner ward aura
    ctx.lineWidth = 3;
    ctx.strokeRect(-MAP_HALF_W + 10 - r.camera.x, -MAP_HALF_H + 10 - r.camera.y, MAP_WORLD_W - 20, MAP_WORLD_H - 20);

    // Write warnings along the boundaries in stylized display text
    ctx.save();
    ctx.fillStyle = "rgba(245, 158, 11, 0.35)";
    ctx.font = "bold 13px font-serif, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    // Top, bottom, left, right warnings
    ctx.fillText("「太古始祖造化结界 · 凡人神魔止步」", cx, -MAP_HALF_H + 25 - r.camera.y);
    ctx.fillText("「太古始祖造化结界 · 凡人神魔止步」", cx, MAP_HALF_H - 20 - r.camera.y);

    ctx.save();
    ctx.translate(-MAP_HALF_W + 25 - r.camera.x, cy);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("「太古始祖造化结界 · 凡人神魔止步」", 0, 0);
    ctx.restore();

    ctx.save();
    ctx.translate(MAP_HALF_W - 20 - r.camera.x, cy);
    ctx.rotate(Math.PI / 2);
    ctx.fillText("「太古始祖造化结界 · 凡人神魔止步」", 0, 0);
    ctx.restore();
    ctx.restore();

    // Drifting mystical "Immortal Qi" clouds (仙气漂缈) above the landscape background
    ctx.save();
    const cloudTime = Date.now() * 0.00012;
    ctx.fillStyle = "rgba(45, 212, 191, 0.02)"; // Flowing teal clouds
    for (let i = 0; i < 4; i++) {
      // Drifts slowly horizontally and bobs up and down
      const cloudX = ((cloudTime * 50 + i * cw / 3.5) % (cw + 500)) - 250;
      const cloudY = 120 + i * (ch / 4.5) + Math.sin(cloudTime + i) * 35;
      
      ctx.beginPath();
      ctx.arc(cloudX, cloudY, 150, 0, Math.PI * 2);
      ctx.arc(cloudX - 80, cloudY + 20, 110, 0, Math.PI * 2);
      ctx.arc(cloudX + 80, cloudY - 20, 110, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 1. Draw Energy Gems / Shards on ground
    r.gems.forEach((gem) => {
      ctx.fillStyle = gem.color;
      ctx.beginPath();
      
      // Draw diamond-like crystals shape
      const gx = gem.x - r.camera.x;
      const gy = gem.y - r.camera.y;
      ctx.moveTo(gx, gy - gem.radius);
      ctx.lineTo(gx + gem.radius, gy);
      ctx.lineTo(gx, gy + gem.radius);
      ctx.lineTo(gx - gem.radius, gy);
      ctx.closePath();
      
      ctx.fill();

      // Add small outer glow
      ctx.shadowBlur = 6;
      ctx.shadowColor = gem.color;
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.beginPath();
      ctx.arc(gx, gy, gem.radius * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0; // reset
    });

    // 2. Draw Lightning Warnings Red Reticles
    r.lightningWarnings.forEach((warn) => {
      ctx.beginPath();
      ctx.arc(warn.x - r.camera.x, warn.y - r.camera.y, 65, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(192, 132, 252, 0.45)"; // warning line
      ctx.lineWidth = 2;
      ctx.stroke();

      // Fill pulsating center
      ctx.fillStyle = `rgba(168, 85, 247, ${0.1 + (18 - warn.timer) * 0.015})`;
      ctx.fill();

      // Small countdown text
      ctx.fillStyle = "#c084fc";
      ctx.font = "bold 9px sans-serif";
      ctx.fillText("⚡ 雷劫点", warn.x - r.camera.x - 22, warn.y - r.camera.y - 5);
    });

    // 3. Draw Weapons, Special Projects (Shockwaves, bolts, swords)
    r.projectiles.forEach((proj) => {
      const px = proj.x - r.camera.x;
      const py = proj.y - r.camera.y;

      if (proj.type === WeaponId.FLY_SWORD || proj.type === WeaponId.ICE_SHARD) {
        // Draw real dagger/sword vector shapes with nice trace line
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(proj.angle || 0);

        ctx.shadowBlur = 8;
        ctx.shadowColor = proj.color;

        // Blade stroke
        ctx.beginPath();
        ctx.moveTo(-16, 0); // hilt
        ctx.lineTo(16, 0);  // tip
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = proj.type === WeaponId.FLY_SWORD ? 3.5 : 2;
        ctx.stroke();

        ctx.strokeStyle = proj.color;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
        ctx.shadowBlur = 0;
      }
      else if (proj.type === WeaponId.FIRE_RING) {
        // Draw expanding flame rings
        const scale = proj.scale || 1;
        const radius = proj.radius * scale;

        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(249, 115, 22, ${proj.duration / 45})`; // gradual fade out
        ctx.lineWidth = 6;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(px, py, radius - 4, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(251, 146, 60, 0.35)"; // golden spark trace
        ctx.lineWidth = 3;
        ctx.stroke();
      }
      else if (proj.type === WeaponId.THUNDER_STRIKE) {
        // Draw giant crackling lightning bolts
        ctx.save();
        ctx.shadowBlur = 12;
        ctx.shadowColor = proj.color;

        ctx.beginPath();
        ctx.arc(px, py, proj.radius * (proj.scale || 1), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(168, 85, 247, ${proj.duration / 35})`;
        ctx.fill();

        // Draw multiple vertical spark lightning bolts from sky to ground point
        ctx.beginPath();
        ctx.moveTo(px + (Math.random() - 0.5) * 40, py - 400); // Sky point
        ctx.lineTo(px - 15, py - 200);
        ctx.lineTo(px + 15, py - 100);
        ctx.lineTo(px, py); // Impact point
        
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.strokeStyle = proj.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.restore();
        ctx.shadowBlur = 0;
      }
      else if (proj.type === WeaponId.MAGNET_POT) {
        // Draw elegant magnetic expanding pulse wave
        const radius = proj.radius * (proj.scale || 1);
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(217, 119, 6, ${proj.duration / 35})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      else if (proj.type === WeaponId.SHIELD) {
        // Draw beautiful floating Vajra defense shields
        ctx.beginPath();
        ctx.arc(px, py, proj.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(245, 158, 11, 0.15)";
        ctx.fill();
        ctx.strokeStyle = proj.color;
        
        const shieldLvl = r.weapons[WeaponId.SHIELD];
        ctx.lineWidth = shieldLvl === 5 ? 4.5 : 2.5;
        ctx.stroke();

        // Cross internal lines representing martial bell designs
        ctx.fillStyle = "#ffffff";
        ctx.font = shieldLvl === 5 ? "bold 15px sans-serif" : "bold 9px sans-serif";
        ctx.fillText(shieldLvl === 5 ? "卍" : "印", px - (shieldLvl === 5 ? 7 : 4), py + (shieldLvl === 5 ? 5 : 3));
      }
    });

    // 4. Draw Enemies / Beasts
    r.enemies.forEach((enemy) => {
      const ex = enemy.x - r.camera.x;
      const ey = enemy.y - r.camera.y;

      // Draw shadow circle
      ctx.beginPath();
      ctx.arc(ex, ey + 4, enemy.radius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.fill();

      // Enemy Body Circle
      ctx.beginPath();
      ctx.arc(ex, ey, enemy.radius, 0, Math.PI * 2);
      ctx.fillStyle = enemy.color;
      ctx.fill();

      // Enemy specific visual markers (e.g. boss crowns or claws)
      if (enemy.isBoss) {
        ctx.beginPath();
        ctx.moveTo(ex - 10, ey - enemy.radius);
        ctx.lineTo(ex, ey - enemy.radius - 12); // crown tip
        ctx.lineTo(ex + 10, ey - enemy.radius);
        ctx.closePath();
        ctx.fillStyle = "#fbbf24"; // golden crown color
        ctx.fill();
      } else {
        // Draw moving wings/legs for insects/beasts organically
        ctx.beginPath();
        const wingOffset = Math.sin(Date.now() / 100) * 8;
        ctx.moveTo(ex - enemy.radius, ey);
        ctx.lineTo(ex - enemy.radius - 6, ey - 3 + wingOffset);
        ctx.moveTo(ex + enemy.radius, ey);
        ctx.lineTo(ex + enemy.radius + 6, ey - 3 - wingOffset);
        ctx.strokeStyle = enemy.color;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Small glowing eyes
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(ex - 4, ey - 2, 2, 0, Math.PI * 2);
      ctx.arc(ex + 4, ey - 2, 2, 0, Math.PI * 2);
      ctx.fill();

      // Health bar above enemy if damaged
      if (enemy.hp < enemy.maxHp) {
        const barW = enemy.radius * 2;
        const barH = 3.5;
        const barX = ex - enemy.radius;
        const barY = ey - enemy.radius - 6;

        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(barX, barY, barW, barH);

        const hpRatio = Math.max(0, enemy.hp / enemy.maxHp);
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(barX, barY, barW * hpRatio, barH);
      }
    });

    // 5. Draw Player Character (Dynamically Animated Wuxia Chibi Human Figure)
    const px = r.player.x - r.camera.x;
    const py = r.player.y - r.camera.y;

    const bobY = Math.sin(Date.now() * 0.005) * 5.5; // Flotation bobbing (御空飞行)
    const activePy = py + bobY;
    const isMoving = r.player.facingX !== 0 || r.player.facingY !== 0;

    // A. Soft dynamic shadow beneath the player - shrinks as they float higher
    const shadowScale = 1 - (bobY / 22);
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(px, py + 14, r.player.radius * 1.15 * shadowScale, r.player.radius * 0.38 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0, 0, 0, 0.38)";
    ctx.fill();
    ctx.restore();

    // Damage Flash overlay
    const isInvulnerable = r.player.invulnTime > 0;
    if (isInvulnerable && Math.floor(Date.now() / 80) % 2 === 0) {
      // flash opacity skips rendering character shape directly to simulate blink
    } else {
      ctx.save();
      // Translate to player center
      ctx.translate(px, activePy - 3);

      // Flip character horizontally based on movement direction so they naturally face running way
      const isFacingLeft = r.player.facingX < 0;
      if (isFacingLeft) {
        ctx.scale(-1, 1);
      }

      // Determine colors & styling parameters tailored specifically for each hero
      const charId = charDef.id;
      let primaryRobe = "#ccfbf1";
      let secondaryRobe = "#0f766e";
      let beltColor = "#2dd4bf";
      let innerCollar = "#ffffff";
      let hairColor = "#111827";
      let hairLength = 22;
      let weaponColor = "#38bdf8";
      let faceMark = "#06b6d4";

      if (charId === "lu_xueqi") {
        primaryRobe = "#e2fbf7";
        secondaryRobe = "#0f766e";
        beltColor = "#2dd4bf";
        innerCollar = "#ffffff";
        hairColor = "#0f172a";
        hairLength = 22;
        weaponColor = "#38bdf8";
        faceMark = "#06b6d4";
      } else if (charId === "xiao_yan") {
        primaryRobe = "#450a0a";
        secondaryRobe = "#f87171";
        beltColor = "#ea580c";
        innerCollar = "#1c1917";
        hairColor = "#18181b";
        hairLength = 17;
        weaponColor = "#f97316";
        faceMark = "#ef4444";
      } else if (charId === "han_li") {
        primaryRobe = "#064e43";
        secondaryRobe = "#6ee7b7";
        beltColor = "#059669";
        innerCollar = "#fcf3e8";
        hairColor = "#27272a";
        hairLength = 18;
        weaponColor = "#34d399";
        faceMark = "#10b981";
      } else if (charId === "man_shen") {
        primaryRobe = "#78350f";
        secondaryRobe = "#fbbf24";
        beltColor = "#dc2626";
        innerCollar = "#451a03";
        hairColor = "#71717a";
        hairLength = 24;
        weaponColor = "#fbbf24";
        faceMark = "#f59e0b";
      } else if (charId === "frost_deity") {
        primaryRobe = "#eff6ff";
        secondaryRobe = "#3b82f6";
        beltColor = "#60a5fa";
        innerCollar = "#ffffff";
        hairColor = "#e2e8f0";
        hairLength = 25;
        weaponColor = "#60a5fa";
        faceMark = "#38bdf8";
      }

      // B. Draw Long Flowing Hair/Sashes behind shoulders (随风飘摆)
      ctx.fillStyle = hairColor;
      ctx.beginPath();
      ctx.moveTo(-5, -12);
      ctx.bezierCurveTo(
        -11 - Math.sin(Date.now() * 0.006) * 2, -5,
        -13 + Math.sin(Date.now() * 0.007) * 1.5, hairLength / 2,
        -6 - Math.sin(Date.now() * 0.006) * 3, hairLength
      );
      ctx.lineTo(-2, hairLength - 2);
      ctx.quadraticCurveTo(-4, -4, -1, -8);
      ctx.closePath();
      ctx.fill();

      // C. Draw Back Sleeve (仙风大袖)
      ctx.fillStyle = secondaryRobe;
      ctx.beginPath();
      ctx.moveTo(-3.5, -6);
      ctx.bezierCurveTo(-14, -2, -18 + Math.sin(Date.now() * 0.01) * 3, 4, -12, 11);
      ctx.quadraticCurveTo(-7, 7, -2.5, 2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.15)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // D. Draw Leg/Boots with simple walking gait animation
      const moveSwingState = isMoving ? Math.sin(Date.now() * 0.012) * 4 : 0;
      ctx.fillStyle = "#111827"; // traditional boots
      ctx.fillRect(-4 + moveSwingState, 11, 3.2, 5);
      ctx.fillRect(1 - moveSwingState, 11, 3.2, 5);

      // E. Draw main Robes/Gown (下摆/道袍)
      ctx.fillStyle = primaryRobe;
      ctx.beginPath();
      ctx.moveTo(-6, -6);
      ctx.lineTo(6, -6);
      ctx.quadraticCurveTo(8.5, 2, 8.5, 11 + Math.sin(Date.now() * 0.01) * 0.8);
      ctx.lineTo(-9.5, 11 + Math.sin(Date.now() * 0.01) * 0.8);
      ctx.quadraticCurveTo(-8.5, 2, -6, -6);
      ctx.closePath();
      ctx.fill();

      // Draw elegant center folds on robes
      ctx.strokeStyle = secondaryRobe;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(-4.5, 11);
      ctx.stroke();

      // F. Traditional Crossover Robe Collars (交领右衽)
      ctx.fillStyle = innerCollar;
      ctx.beginPath();
      ctx.moveTo(-4, -11.5);
      ctx.lineTo(0, -6);
      ctx.lineTo(3.5, -11.5);
      ctx.lineTo(0, -11.5);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = secondaryRobe;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-4, -11.5);
      ctx.lineTo(2, -6);
      ctx.moveTo(-2, -11.5);
      ctx.lineTo(4, -6);
      ctx.stroke();

      // G. Waist Belt & Floating Girdle Ribbon (束腰和羽化飘带)
      ctx.fillStyle = beltColor;
      ctx.fillRect(-6.5, -2, 13, 3);

      ctx.strokeStyle = beltColor;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-3, 0);
      ctx.bezierCurveTo(
        -8, 3,
        -15 - Math.sin(Date.now() * 0.008) * 4, 8 + Math.cos(Date.now() * 0.008) * 2,
        -14, 15
      );
      ctx.moveTo(1.2, 0);
      ctx.bezierCurveTo(
        -4, 4,
        -11 - Math.cos(Date.now() * 0.009) * 3, 10 + Math.sin(Date.now() * 0.009) * 3,
        -9, 17
      );
      ctx.stroke();

      // H. Front Sleeve (前置流仙袖)
      ctx.fillStyle = primaryRobe;
      ctx.beginPath();
      ctx.moveTo(4, -6);
      ctx.bezierCurveTo(12, -1.2, 15 + Math.sin(Date.now() * 0.011) * 2, 6, 8.5, 11.5);
      ctx.quadraticCurveTo(3, 8.5, 2, 1);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.18)";
      ctx.stroke();

      // I. Head & Facial Expressions
      // Face skin base
      ctx.fillStyle = "#fdf4e3";
      ctx.beginPath();
      ctx.arc(0, -12, 6.5, 0, Math.PI * 2);
      ctx.fill();

      // Charming blush cheeks
      ctx.fillStyle = "rgba(239, 68, 68, 0.22)";
      ctx.beginPath();
      ctx.arc(3.5, -11, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Forehead Cinnabar Sigil (眉间修仙印记)
      ctx.fillStyle = faceMark;
      ctx.beginPath();
      ctx.arc(2.5, -14, 0.8, 0, Math.PI * 2);
      ctx.fill();

      // Serene curved closed eyes path
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(3.2, -12.5, 1.2, 1.15 * Math.PI, 1.85 * Math.PI, false); // serene closed eyes
      ctx.stroke();

      // J. Hair & Traditional Crown Top-Knot (发冠和刘海)
      ctx.fillStyle = hairColor;
      // Main head bangs
      ctx.beginPath();
      ctx.moveTo(-7, -13.5);
      ctx.quadraticCurveTo(-1.2, -18.5, 7, -13.5);
      ctx.quadraticCurveTo(3, -11.5, 1, -13.5);
      ctx.quadraticCurveTo(-2, -11.5, -4.5, -13.5);
      ctx.closePath();
      ctx.fill();

      // Side strands (两鬓)
      ctx.beginPath();
      ctx.moveTo(-6, -12);
      ctx.lineTo(-7, -3.5);
      ctx.lineTo(-5, -9.5);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(6, -12);
      ctx.lineTo(5.2, -3.5);
      ctx.lineTo(4.2, -9.5);
      ctx.closePath();
      ctx.fill();

      // Top hair bun (发髻)
      ctx.beginPath();
      ctx.arc(-1.5, -18.5, 2.8, 0, Math.PI * 2);
      ctx.fill();

      // Ribbon holder crown (发冠/发带)
      ctx.fillStyle = faceMark;
      ctx.fillRect(-3, -20.5, 3.2, 2.2);

      // K. Hand-Held Hovering Spiritual Treasures (手持法宝仙功)
      const handX = 8.5;
      const handY = -3.8;
      ctx.fillStyle = "#fdf4e3";
      ctx.beginPath();
      ctx.arc(handX, handY, 1.8, 0, Math.PI * 2);
      ctx.fill();

      const itemX = handX + 1.2;
      const itemY = handY - 9.5 + Math.sin(Date.now() * 0.015) * 1.8;

      ctx.save();
      ctx.shadowBlur = 8;
      ctx.shadowColor = weaponColor;
      ctx.fillStyle = weaponColor;

      if (charId === "lu_xueqi") {
        // Celestial white-blue hovering sword (天琊神剑)
        ctx.translate(itemX, itemY);
        ctx.rotate(0.42);
        // Blade
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(-1.1, -7.5, 2.2, 9.5);
        ctx.beginPath();
        ctx.moveTo(-1.1, -7.5);
        ctx.lineTo(0, -11.5);
        ctx.lineTo(1.1, -7.5);
        ctx.fill();
        // Crossguard & Hilt
        ctx.fillStyle = weaponColor;
        ctx.fillRect(-2.8, 2, 5.6, 1.2);
        ctx.fillRect(-0.7, 3.2, 1.4, 3.0);
      } else if (charId === "xiao_yan") {
        // Swirling hot orange Lotus flame (异火莲华)
        ctx.beginPath();
        ctx.arc(itemX, itemY, 4.2, 0, Math.PI * 2);
        ctx.fill();
        for (let f = 0; f < 3; f++) {
          const fa = (Date.now() * 0.022 + f * 2.1) % (Math.PI * 2);
          ctx.fillStyle = "#f43f5e";
          ctx.fillRect(itemX + Math.cos(fa) * 5.2, itemY + Math.sin(fa) * 5.2, 1.8, 1.8);
        }
      } else if (charId === "han_li") {
        // Hovering healing green cauldron (掌天绿鼎)
        ctx.fillStyle = "#34d399";
        ctx.fillRect(itemX - 2.8, itemY - 3.2, 5.6, 6.8);
        ctx.fillStyle = "#10b981";
        ctx.fillRect(itemX - 3.8, itemY - 4.5, 7.6, 2.1);
        ctx.beginPath();
        ctx.arc(itemX, itemY + 3.8, 2.1, 0, Math.PI * 2);
        ctx.fill();
      } else if (charId === "man_shen") {
        // Golden force field sparks (荒古神力)
        ctx.beginPath();
        ctx.arc(itemX, itemY, 4.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(itemX - 1, itemY - 1, 1.6, 0, Math.PI * 2);
        ctx.fill();
      } else if (charId === "frost_deity") {
        // Shards of crystalline sacred snowflake (太阴霜花)
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (let a = 0; a < 6; a++) {
          const rad = (a * Math.PI) / 3 + (Date.now() * 0.0035);
          ctx.moveTo(itemX, itemY);
          ctx.lineTo(itemX + Math.cos(rad) * 6.2, itemY + Math.sin(rad) * 6.2);
        }
        ctx.stroke();
      }
      ctx.restore();

      // L. Circular Sect/Aura boundary line around player body (金丹/元婴神环)
      ctx.strokeStyle = charDef.id === "lu_xueqi" ? "rgba(45, 212, 191, 0.45)" : charDef.id === "xiao_yan" ? "rgba(249, 115, 22, 0.45)" : "rgba(245, 158, 11, 0.45)";
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 6]);
      ctx.lineDashOffset = -(Date.now() * 0.05) % 10;
      ctx.beginPath();
      ctx.arc(0, -3, r.player.radius * 1.35, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.restore();
    }


    // 6. Draw Damage floating numbers
    r.floatingTexts.forEach((txt) => {
      ctx.save();
      ctx.globalAlpha = txt.opacity;
      ctx.fillStyle = txt.color;
      ctx.font = `bold ${txt.size}px font-serif`;
      ctx.fillText(txt.text, txt.x - r.camera.x - 10, txt.y - r.camera.y);
      ctx.restore();
    });
  };

  // Click handler to active touch movement vectors
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const r = stateRef.current;
    r.isMouseDown = true;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      r.mouseMoveTarget = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const r = stateRef.current;
    if (!r.isMouseDown) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      r.mouseMoveTarget = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const handleMouseEnd = () => {
    const r = stateRef.current;
    r.isMouseDown = false;
    r.mouseMoveTarget = null;
  };

  // Support mobile touch joystick
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const r = stateRef.current;
    r.isMouseDown = true;
    const touch = e.touches[0];
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect && touch) {
      r.mouseMoveTarget = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const r = stateRef.current;
    if (!r.isMouseDown) return;
    const touch = e.touches[0];
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect && touch) {
      r.mouseMoveTarget = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    }
  };

  const formatMinSec = (sec: number) => {
    const mind = Math.floor(sec / 60);
    const secd = Math.floor(sec % 60);
    return `${mind}:${secd < 10 ? "0" : ""}${secd}`;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-[#e5e1d8] flex flex-col justify-start items-stretch select-none"
    >
      {/* Top HUD UI Panel overlaying Canvas */}
      <div className="absolute top-0 inset-x-0 bg-transparent p-4 flex flex-col gap-2 z-10 pointer-events-none">
        
        {/* Top bar: Stats and Time */}
        <div className="flex items-center justify-between pointer-events-auto">
          {/* Pause btn & Back */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onExitGame()}
              className="px-3 py-1.5 bg-[#1a1a1a] text-white hover:bg-neutral-800 border-none font-sans font-bold tracking-wider text-[10px] cursor-pointer shadow"
            >
              放弃飞升
            </button>
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="px-3 py-1.5 bg-[#f5f2ed] hover:bg-neutral-200 text-[#1a1a1a] border border-[#1a1a1a] font-sans font-bold tracking-wider text-[10px] cursor-pointer shadow"
            >
              {isPaused ? "继续游玩" : "法术凝滞"}
            </button>
          </div>

          {/* Clock timer */}
          <div className="px-5 py-1.5 bg-[#1a1a1a] text-white border border-[#1a1a1a] flex flex-col items-center">
            <span className="text-[9px] text-amber-400 font-serif font-black tracking-widest mb-0.5">
              {isTribulation ? "⚡ 天劫试炼中" : "生存进度时间"}
            </span>
            <span className="font-mono text-base font-bold text-white leading-none">
              {isTribulation ? `坚持生存 ${tribulationTimeLeft} 秒` : formatMinSec(gameTime)}
            </span>
          </div>

          {/* Stones and kills stats */}
          <div className="flex gap-2 text-[10px] font-sans uppercase font-bold">
            <div className="px-3 py-1.5 bg-[#f5f2ed] border border-[#1a1a1a] flex items-center gap-1.5 shadow">
              <span className="text-neutral-600">斩妖:</span>
              <span className="text-red-700 font-mono font-black">{killedCount}</span>
            </div>
            <div className="px-3 py-1.5 bg-[#f5f2ed] border border-[#1a1a1a] flex items-center gap-1.5 shadow">
              <span className="text-amber-500">🪙</span>
              <span className="text-neutral-900 font-mono font-black">{stoneCount}</span>
            </div>
          </div>
        </div>

        {/* State / Region Indicator */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pointer-events-auto bg-[#f5f2ed]/95 border border-[#1a1a1a] px-3 py-1.5 shadow gap-2 text-[#1a1a1a]">
          <div className="flex items-center gap-2">
            <span className="text-[9.5px] px-1.5 py-0.5 bg-red-700 text-white font-serif font-black tracking-wide rounded-sm shrink-0">当前州域</span>
            <span className="text-xs font-serif font-black text-[#1a1a1a]">{activeState.name}</span>
            <span className="text-[10px] text-neutral-600 font-serif leading-none mt-0.5">{activeState.desc}</span>
          </div>
          <div className="text-[10px] font-mono text-neutral-700 flex items-center gap-1.5 sm:self-auto self-end">
            <span>坐标:</span>
            <span className="font-extrabold text-[#1a1a1a] bg-[#e5e1d8] px-1.5 py-0.5 border border-neutral-400 font-mono text-[9px] rounded-sm">
              X: {Math.round(stateRef.current?.player?.x || 0)}, Y: {Math.round(stateRef.current?.player?.y || 0)}
            </span>
            <span className="text-[10px] font-serif text-amber-600 font-bold">{activeState.landDetails}</span>
          </div>
        </div>

        {/* Level Up progress bar */}
        <div className="flex items-center gap-3 mt-1.5">
          <div className="px-2 py-0.5 bg-[#1a1a1a] text-white text-[9.5px] font-serif font-black uppercase tracking-wider">
            {currentRealm} (晋升 Lv.{playerLevel})
          </div>
          <div className="flex-1 h-3.5 bg-[#f5f2ed] overflow-hidden border border-[#1a1a1a] p-0.5">
            <div
              className="h-full bg-red-700 transition-all duration-300"
              style={{ width: `${Math.min(100, (playerExp / getExpNeededForLevel(playerLevel)) * 100)}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-[#1a1a1a]/70 font-bold tracking-wide w-12 text-right">
            {playerExp}/{getExpNeededForLevel(playerLevel)}
          </span>
        </div>

        {/* Bottom health indicator under level bar */}
        <div className="flex items-center gap-3">
          <span className="text-[9.5px] font-sans font-black uppercase tracking-wider text-[#1a1a1a] shrink-0">气血灵海</span>
          <div className="flex-1 h-5 bg-[#f5f2ed] overflow-hidden border border-[#1a1a1a] p-0.5 relative shadow-inner">
            <div
              className={`h-full transition-all duration-200 ${
                currentHp / maxHp < 0.25
                  ? "bg-red-700 animate-pulse"
                  : "bg-red-700"
              }`}
              style={{ width: `${Math.min(100, (currentHp / maxHp) * 100)}%` }}
            />
            {/* Absolute text overlay centered within the health bar container */}
            <div className="absolute inset-0 flex items-center justify-center text-[10.5px] font-mono font-black text-white drop-shadow-[0_1px_2px_rgba(26,26,26,0.95)] tracking-wider pointer-events-none select-none">
              {Math.max(0, Math.round(currentHp))} / {Math.round(maxHp)}
            </div>
          </div>
        </div>
      </div>

      {/* Main Graphics Canvas container */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseEnd}
        onMouseLeave={handleMouseEnd}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseEnd}
        className="w-full h-full block cursor-crosshair touch-none"
      />

      {/* Floating Tutorial Message Overlay on start (Fades out after 6 seconds) */}
      {gameTime < 6 && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#f5f2ed] border-4 border-[#1a1a1a] p-6 text-center max-w-sm pointer-events-none z-20 animate-fade-out text-[#1a1a1a] shadow-2xl">
          <span className="text-2xl text-red-700 font-serif font-black block mb-2">🐉 御剑飞仙</span>
          <p className="text-xs text-neutral-800 leading-relaxed font-serif">
            请使用键盘 <strong className="text-red-700 font-extrabold">WASD / 方向键</strong> 或鼠标/屏幕 <strong className="text-red-700 font-extrabold">按住拖曳</strong> 遁走移动。<br />
            神通仙术与飞针法宝将自动袭杀四周妖魔异兽。<br />
            收集散落荧光 <span className="text-red-700 font-bold">晶核灵气</span> 来感悟境界与渡天劫。
          </p>
        </div>
      )}

      {/* ⚠️ Tribulation Warning screen overlays during final phase */}
      {rStateRefHasTribulation() && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-red-700 border-2 border-[#1a1a1a] font-serif text-center px-4 py-2 text-xs font-black uppercase text-white tracking-widest pointer-events-none animate-pulse flex items-center gap-1.5 shadow-lg">
          <span>⚡ 苍天震怒：</span>
          <span>避开雷电斑迹圈！坚持到底即金仙飞升！</span>
        </div>
      )}

      {/* Interactive Level-Up Upgrades Card Modals */}
      {levelUpOptions && (
        <UpgradeSelection
          options={levelUpOptions}
          onSelect={handleUpgradeCardSelected}
        />
      )}

      {/* 🌟 境界突破 漂浮金色文字动画 / Breakthrough Overlay */}
      {breakthroughText && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50 overflow-hidden bg-transparent">
          <div 
            key={breakthroughText}
            className="flex flex-col items-center justify-center animate-breakthrough drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]"
          >
            {/* Background Decorative Beam/Ink Brush Line */}
            <div className="relative py-4 px-12 bg-gradient-to-r from-transparent via-[#1a1a1a]/95 to-transparent border-y-2 border-amber-400 flex flex-col items-center gap-1">
              {/* Top Gold Corner Details */}
              <div className="absolute top-1 left-4 text-amber-500 font-serif text-[10px] tracking-widest leading-none">
                ✦ 乾坤同庆 ✦
              </div>
              <div className="absolute top-1 right-4 text-amber-500 font-serif text-[10px] tracking-widest leading-none">
                ✦ 凡人逆天 ✦
              </div>
              
              {/* Title */}
              <span className="text-amber-500 font-serif font-black tracking-[0.2em] text-xs uppercase animate-pulse">
                ⚡ 渡劫破境 登入天道 ⚡
              </span>
              
              {/* Main Realm Text */}
              <h1 className="text-3xl md:text-5xl font-serif font-black tracking-widest text-amber-400 text-center select-none py-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {breakthroughText}
              </h1>

              {/* Bottom Detail */}
              <span className="text-[#f5f2ed] font-serif text-[11px] tracking-[0.3em] font-medium">
                道法自然 百炼成真
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Embedded Styles for breakthrough text animation */}
      <style>{`
        @keyframes breakthroughEntrance {
          0% {
            transform: scale(0.6) translateY(40px);
            opacity: 0;
            filter: blur(10px);
          }
          15% {
            transform: scale(1.1) translateY(-5px);
            opacity: 1;
            filter: blur(0);
          }
          25% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
          80% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
          100% {
            transform: scale(0.95) translateY(-30px);
            opacity: 0;
            filter: blur(4px);
          }
        }
        .animate-breakthrough {
          animation: breakthroughEntrance 2.5s cubic-bezier(0.19, 1, 0.22, 1) forwards;
        }
      `}</style>
    </div>
  );

  // Helper inside render logic safely querying ref value without throwing hook warnings
  function rStateRefHasTribulation() {
    return stateRef.current?.stats?.isTribulation;
  }
}
