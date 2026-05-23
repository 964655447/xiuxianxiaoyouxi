/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CultivatorType,
  CultivationRealm,
  WeaponId,
  TalentId,
  PermanentUpgrade,
  SaveState,
  UpgradeOption
} from "./types";

import luXueqiImg from "./assets/images/lu_xueqi_portrait_1779531253532.png";
import xiaoYanImg from "./assets/images/xiao_yan_portrait_1779531267514.png";
import manShenImg from "./assets/images/man_shen_portrait_1779531281900.png";
import hanLiImg from "./assets/images/han_li_portrait_1779532349047.png";
import frostDeityImg from "./assets/images/frost_deity_portrait_1779532367482.png";

// Character details
export interface CharacterDef {
  id: string;
  name: string;
  sect: string;
  type: CultivatorType;
  description: string;
  baseHp: number;
  baseSpeed: number;
  startingWeapon: WeaponId;
  bgGradient: string; // Tailwind class
  unlockedCost: number; // Spirit stones needed to unlock. 0 means unlocked by default
  avatar: string; // Decorative text or emoji code
  illustration: string; // Image asset path
}

export const CHARACTER_DEFS: CharacterDef[] = [
  {
    id: "lu_xueqi",
    name: "青云剑修 · 陆雪琪",
    sect: "青云门小竹峰",
    type: CultivatorType.SWORD,
    description: "御剑流：初始携带【青锋飞剑】，飞剑数量多，穿透性能强，擅长御剑斩妖于千里之外。",
    baseHp: 100,
    baseSpeed: 3.2,
    startingWeapon: WeaponId.FLY_SWORD,
    bgGradient: "from-sky-500/10 to-teal-500/10 border-sky-400/50",
    unlockedCost: 0,
    avatar: "🗡️",
    illustration: luXueqiImg,
  },
  {
    id: "xiao_yan",
    name: "八荒法修 · 萧炎",
    sect: "迦南学院",
    type: CultivatorType.SPELL,
    description: "群爆流：初始携带【八荒烈火阵】，火环能不断向外扩散并灼烧击退范围内的怪物，克制虫群。",
    baseHp: 80,
    baseSpeed: 2.8,
    startingWeapon: WeaponId.FIRE_RING,
    bgGradient: "from-amber-500/10 to-red-500/10 border-amber-400/50",
    unlockedCost: 100,
    avatar: "🔥",
    illustration: xiaoYanImg,
  },
  {
    id: "han_li",
    name: "天机散仙 · 韩立",
    sect: "落云宗天机阁",
    type: CultivatorType.SPELL,
    description: "聚灵流：初始携带【聚灵乾坤鼎】，定期触发大范围真灵能量吸附波纹，并以通天之水震破周围群魔。",
    baseHp: 90,
    baseSpeed: 3.0,
    startingWeapon: WeaponId.MAGNET_POT,
    bgGradient: "from-emerald-500/10 to-teal-600/10 border-emerald-400/50",
    unlockedCost: 150,
    avatar: "🏺",
    illustration: hanLiImg,
  },
  {
    id: "man_shen",
    name: "不灭体修 · 洪荒蛮神",
    sect: "万兽蛮体山",
    type: CultivatorType.BODY,
    description: "肉盾流：初始携带【金刚护体障】，自带旋转金刚钟，反震附近怪物，回血迅速、皮糙肉厚。",
    baseHp: 160,
    baseSpeed: 2.5,
    startingWeapon: WeaponId.SHIELD,
    bgGradient: "from-amber-600/10 to-orange-500/10 border-amber-500/50",
    unlockedCost: 200,
    avatar: "🛡️",
    illustration: manShenImg,
  },
  {
    id: "frost_deity",
    name: "太阴霜尊 · 绝代仙尊",
    sect: "太阴玄寒仙宫",
    type: CultivatorType.SWORD,
    description: "霜寒流：初始携带【玄冰寒狱】，向扇形爆射大片锋利无匹的太阴寒冰破，使触及的异兽法力凝滞，速度立减。",
    baseHp: 110,
    baseSpeed: 3.1,
    startingWeapon: WeaponId.ICE_SHARD,
    bgGradient: "from-blue-500/10 to-indigo-500/10 border-blue-400/50",
    unlockedCost: 300,
    avatar: "❄️",
    illustration: frostDeityImg,
  }
];

// Permanent Upgrades Definition
export const PERMANENT_UPGRADES_DEF: PermanentUpgrade[] = [
  {
    id: "talent_hp",
    name: "混沌不灭体 (生命上限)",
    description: "每级增加 15% 最大生命值，提高战场容错率。",
    currentLevel: 0,
    maxLevel: 10,
    baseCost: 50,
    costMultiplier: 1.5,
    statBonusPerLevel: 0.15,
    statType: "health_mult",
  },
  {
    id: "talent_damage",
    name: "太古天灵根 (通法伤害)",
    description: "提升体内法力纯度，每级增加 10% 所有法宝与法术伤害。",
    currentLevel: 0,
    maxLevel: 10,
    baseCost: 60,
    costMultiplier: 1.5,
    statBonusPerLevel: 0.1,
    statType: "damage_mult",
  },
  {
    id: "talent_speed",
    name: "九霄逍遥步 (遁速提升)",
    description: "融会风雷遁术，每级增加 5% 移动速度，身轻如燕。",
    currentLevel: 0,
    maxLevel: 8,
    baseCost: 40,
    costMultiplier: 1.6,
    statBonusPerLevel: 0.05,
    statType: "speed_mult",
  },
  {
    id: "talent_magnet",
    name: "乾坤无极纳 (吸取范围)",
    description: "神识外放扩增，每级增加 20% 灵气收集半径，轻松拾取灵石。",
    currentLevel: 0,
    maxLevel: 8,
    baseCost: 30,
    costMultiplier: 1.4,
    statBonusPerLevel: 0.2,
    statType: "magnet_mult",
  },
  {
    id: "talent_exp",
    name: "逆天顿悟气 (福缘经验)",
    description: "福气连连，冥冥中天道垂青。每级增加 8% 灵气经验获取速度。",
    currentLevel: 0,
    maxLevel: 10,
    baseCost: 80,
    costMultiplier: 1.6,
    statBonusPerLevel: 0.08,
    statType: "exp_mult",
  },
  {
    id: "talent_gold",
    name: "点石成金术 (灵石加成)",
    description: "每次通关或击败异兽，每级增加 15% 获得的灵石掉落收益。",
    currentLevel: 0,
    maxLevel: 10,
    baseCost: 50,
    costMultiplier: 1.5,
    statBonusPerLevel: 0.15,
    statType: "gold_mult",
  }
];

// Experience curve calculations based on player level
export function getExpNeededForLevel(level: number): number {
  if (level <= 1) return 20;
  if (level <= 5) return 20 + (level - 1) * 15;
  if (level <= 15) return 80 + (level - 5) * 30;
  return 380 + (level - 15) * 60;
}

// Convert level to Cultivation Realm
export function getRealmByLevel(level: number): CultivationRealm {
  if (level <= 5) return CultivationRealm.LIAN_QI;   // 1-5 练气期
  if (level <= 10) return CultivationRealm.ZHU_JI;   // 6-10 筑基期
  if (level <= 15) return CultivationRealm.JIN_DAN;  // 11-15 金丹期
  if (level <= 20) return CultivationRealm.YUAN_YING; // 16-20 元婴期
  if (level <= 25) return CultivationRealm.HUA_SHEN; // 21-25 化神期
  if (level <= 30) return CultivationRealm.LIAN_XU;   // 26-30 炼虚期
  if (level <= 35) return CultivationRealm.HE_TI;    // 31-35 合体期
  return CultivationRealm.DA_CHENG;                  // 36+ 大乘期
}

// Default meta progression save state
export const DEFAULT_SAVE_STATE: SaveState = {
  spiritStones: 50, // Starts with minor funds to try permanent store
  permanentUpgrades: {
    talent_hp: 0,
    talent_damage: 0,
    talent_speed: 0,
    talent_magnet: 0,
    talent_exp: 0,
    talent_gold: 0,
  },
  unlockedCharacters: ["lu_xueqi"], // Lu Xueqi is default unlocked
  highScoreTime: 0,
  highScoreEnemies: 0,
  totalRuns: 0,
};

// Map upgrade configurations for active/passive skills
export interface DetailUpgradeInfo {
  name: string;
  desc: string;
  icon: string;
}

export const SKILL_METADATA: Record<string, DetailUpgradeInfo> = {
  // Active Spells
  [WeaponId.FLY_SWORD]: {
    name: "青锋飞剑",
    desc: "凝聚仙风之气祭出本鸣飞剑，自动追击击中异兽，可多级穿透。",
    icon: "🗡️",
  },
  [WeaponId.THUNDER_STRIKE]: {
    name: "九天御雷真诀",
    desc: "沟通天地雷劫，落下狂暴玄雷轰砸异兽密集区域，造成极高范围群伤。",
    icon: "⚡",
  },
  [WeaponId.FIRE_RING]: {
    name: "八荒烈火阵",
    desc: "在自身周围凝聚八荒地火环，断续扩充扫荡，高烈度灼烧并震退周围敌人。",
    icon: "🔥",
  },
  [WeaponId.ICE_SHARD]: {
    name: "玄冰寒狱",
    desc: "散射散射爆裂冰梭，可使触及的异兽法力迟滞，速度永久降低 35%。",
    icon: "❄️",
  },
  [WeaponId.SHIELD]: {
    name: "金刚护体障",
    desc: "体外浮现一圈金光灿灿的护体佛钟旋转抵挡，对贴身碰撞敌人造成极大反震。",
    icon: "🛡️",
  },
  [WeaponId.MAGNET_POT]: {
    name: "聚灵乾坤鼎",
    desc: "激发乾坤巨鼎的灵力牵引。定期发出一道太极波纹，将全屏范围灵气强制吸附过来。",
    icon: "🏺",
  },

  // Passive Talents
  [TalentId.DAMAGE]: {
    name: "太乙心经",
    desc: "太乙真传心法，增加 10% 基础灵威伤害（乘法乘积加成）。",
    icon: "📈",
  },
  [TalentId.SPEED]: {
    name: "逍遥步法",
    desc: "参悟逍遥神行术，步伐虚无缥缈，永久加快 8% 移动遁速。",
    icon: "👟",
  },
  [TalentId.HEALTH]: {
    name: "神农百草诀",
    desc: "神农尝百草留下的生命长生法。每5秒恢复 2 点生命，且最大血量 +15%。",
    icon: "🌱",
  },
  [TalentId.MAGNET]: {
    name: "聚灵诀",
    desc: "真元扩散，增加 25% 灵力吸附范围，轻松掠夺方圆晶石。",
    icon: "🧲",
  },
  [TalentId.EXP_BOOST]: {
    name: "气运昌隆",
    desc: "悟性大开，玄黄福缘灌顶！局内修炼经验吸取效率额外 +15%。",
    icon: "🍀",
  },
  [TalentId.ARMOR]: {
    name: "玄甲诀",
    desc: "凝聚厚重护体罡气。每次受到攻击，减免 1 点真实伤害（最低降至0）。",
    icon: "💎",
  }
};

// Generates detailed text description for weapon level progression
export function getUpgradeDescription(id: string, nextLevel: number): string {
  const meta = SKILL_METADATA[id];
  const name = meta?.name || id;

  switch (id) {
    case WeaponId.FLY_SWORD:
      if (nextLevel === 1) return `获得1柄快速飞舞击退敌人的飞剑`;
      if (nextLevel === 2) return `飞剑等级提升：伤害 +25%，增加 1 柄连携飞剑`;
      if (nextLevel === 3) return `飞剑等级提升：穿透敌物 +1，飞行速度增加`;
      if (nextLevel === 4) return `飞剑等级提升：额外召唤 1 柄飞剑，旋转环绕`;
      return `飞剑超凡：伤害翻倍！所有飞剑附加追踪灵爆效果`;

    case WeaponId.THUNDER_STRIKE:
      if (nextLevel === 1) return `获得天道神雷。周期性轰击区域敌人`;
      if (nextLevel === 2) return `雷击频次加快，每次落下 2 道雷劫`;
      if (nextLevel === 3) return `落雷威力 +30%，爆破圈半径扩大 25%`;
      if (nextLevel === 4) return `雷劫狂飙：额外增加 1 道雷劫击打随机精英`;
      return `雷公化形：玄天神雷落地后形成残留闪电网持续电疗`;

    case WeaponId.FIRE_RING:
      if (nextLevel === 1) return `身体散发出推开怪群的火波，每4秒发作1次`;
      if (nextLevel === 2) return `地火威力增加 25%，火环冷却降低 0.8 秒`;
      if (nextLevel === 3) return `火环范围扩增，被击退的异兽附带 灼烧 几秒`;
      if (nextLevel === 4) return `每次发作连续推出 2 道热浪火圈`;
      return `三昧真火：火焰在四周持续燃烧不散，进入即融化`;

    case WeaponId.ICE_SHARD:
      if (nextLevel === 1) return `射出 3 枚扇形玄冰锥击退冰封异兽`;
      if (nextLevel === 2) return `冰魄威力提升 20%，增至 4 枚扇形爆射`;
      if (nextLevel === 3) return `冰封极寒增加，穿透数量 +1，缓速时间翻倍`;
      if (nextLevel === 4) return `向四周散射 6 枚绝对零度玄冰锥`;
      return `太阴极寒：击中受到双重冰破反应，造成范围二次溅落`;

    case WeaponId.SHIELD:
      if (nextLevel === 1) return `护体金光罩：1个旋转盾球，伤害接触的怪物`;
      if (nextLevel === 2) return `增加至 2 个环绕光罩，旋转速度微幅增加`;
      if (nextLevel === 3) return `金光罩伤害提升 35%，旋转半径适度增大`;
      if (nextLevel === 4) return `增加至 3 个金刚障护盾，安全感爆棚`;
      return `金刚仙罩：旋转钟体积翻倍，阻挡飞行弹丸且阻碍冲撞`;

    case WeaponId.MAGNET_POT:
      if (nextLevel === 1) return `聚灵宝鼎：每 20 秒发波强制搜刮全屏灵气`;
      if (nextLevel === 2) return `宝鼎炼气：发波间隔缩短至 15 秒，神识更清爽`;
      if (nextLevel === 3) return `宝鼎福缘：每次全屏吸附同时带来 1 灵石暴击`;
      if (nextLevel === 4) return `聚灵乾坤：缩短至 10 秒，发波瞬间击碎较弱妖兽`;
      return `乾坤永纳：永久处于超级巨大磁吸范围中，不再等待`;

    // Passives
    case TalentId.DAMAGE:
      return `所有神射与法宝的基础威力提升 10%`;
    case TalentId.SPEED:
      return `移动速度提升 8%，更易跑过极速野兽`;
    case TalentId.HEALTH:
      return `血量上限增加 15%，每 5 秒额外自愈 2 点血`;
    case TalentId.MAGNET:
      return `灵魂感知力外扩 25%，抓取更远处的水晶灵体`;
    case TalentId.EXP_BOOST:
      return `局内悟道经验转换效率 +15%`;
    case TalentId.ARMOR:
      return `修成钢筋铁骨：每次受伤所扣减健康度固定降低 1`;
    default:
      return `等级提升，战斗力全面蜕变。`;
  }
}
