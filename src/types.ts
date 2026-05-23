/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Cultivator Sects / Types
export enum CultivatorType {
  SWORD = "SWORD", // 剑修 - Flying sword
  SPELL = "SPELL", // 法修 - Magic/Fireball
  BODY  = "BODY",  // 体修 - Shield/Close-combat
}

// Realm of cultivation
export enum CultivationRealm {
  LIAN_QI = "练气期",
  ZHU_JI = "筑基期",
  JIN_DAN = "金丹期",
  YUAN_YING = "元婴期",
  HUA_SHEN = "化神期",
  LIAN_XU = "炼虚期",
  HE_TI = "合体期",
  DA_CHENG = "大乘期",
}

// Weapon / Spell skill types
export enum WeaponId {
  FLY_SWORD = "FLY_SWORD",       // 青锋飞剑
  THUNDER_STRIKE = "THUNDER_STRIKE", // 九天御雷真诀
  FIRE_RING = "FIRE_RING",       // 八荒烈火阵
  ICE_SHARD = "ICE_SHARD",       // 玄冰寒狱
  SHIELD = "SHIELD",             // 金刚护体障
  MAGNET_POT = "MAGNET_POT",     // 聚灵乾坤鼎
}

// Passive talent types
export enum TalentId {
  DAMAGE = "DAMAGE",       // 太乙心经 (伤害提升)
  SPEED = "SPEED",         // 逍遥步法 (移速提升)
  HEALTH = "HEALTH",       // 神农百草诀 (血量上限和回复)
  MAGNET = "MAGNET",       // 聚灵诀 (吸取范围)
  EXP_BOOST = "EXP_BOOST", // 气运昌隆 (经验获取)
  ARMOR = "ARMOR",         // 玄甲诀 (伤害减免)
}

// Upgrade Card Info (Roguelike options)
export interface UpgradeOption {
  id: string; // WeaponId or TalentId
  type: "WEAPON" | "TALENT";
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  icon: string;
}

// Permanent upgrades using spirit stones
export interface PermanentUpgrade {
  id: string;
  name: string;
  description: string;
  currentLevel: number;
  maxLevel: number;
  costMultiplier: number;
  baseCost: number;
  statBonusPerLevel: number;
  statType: "health_mult" | "damage_mult" | "speed_mult" | "magnet_mult" | "exp_mult" | "gold_mult";
}

// Save states (meta-progression)
export interface SaveState {
  spiritStones: number;
  permanentUpgrades: Record<string, number>;
  unlockedCharacters: string[];
  highScoreTime: number; // in seconds
  highScoreEnemies: number;
  totalRuns: number;
}

// Physics & Game entities
export interface Player {
  x: number;
  y: number;
  radius: number;
  hp: number;
  maxHp: number;
  speed: number;
  level: number;
  exp: number;
  expNeeded: number;
  facingX: number;
  facingY: number;
  invulnTime: number; // Invulnerable state frame counts or seconds
}

export interface Enemy {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  speed: number;
  hp: number;
  maxHp: number;
  damage: number;
  isBoss: boolean;
  color: string;
  type: "beast" | "demon" | "specter" | "tribulation_lightning" | "scorpion_boss";
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  color: string;
  type: WeaponId;
  angle?: number; // for sword graphics
  pierce: number; // remaining pierce count
  duration: number; // remaining duration in ticks/seconds
  scale?: number;
}

export interface EnergyGem {
  id: string;
  x: number;
  y: number;
  expValue: number;
  stoneValue: number; // spirit stones
  radius: number;
  isMagnetized: boolean;
  color: string;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  opacity: number;
  size: number;
  vy: number;
  duration: number; // living timer
}

export interface GameStats {
  timeElapsed: number; // in seconds
  enemiesKilled: number;
  spiritStonesCollected: number;
  realm: CultivationRealm;
  isTribulation: boolean; // Heavenly Tribulation active
  tribulationProgress: number; // 0 to 100 for surviving tribulation
}
