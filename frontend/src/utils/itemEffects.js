// src/utils/itemEffects.js - ENHANCED TURN-BASED EFFECTS WITH FIXED SPELL DAMAGE

// BALANCED: Get tool effect details with reasonable impact
export const getToolEffect = (tool) => {
  // Validate input - prevent null/undefined access
  if (!tool || !tool.tool_effect || !tool.tool_type) {
    console.error("Invalid tool data:", tool);
    // Return safe default values to prevent crashes
    return {
      statChanges: { physicalDefense: 2 },
      duration: 1
    };
  }

  const effect = tool.tool_effect;
  const type = tool.tool_type;
  
  // ENHANCED: Base effects that apply EVERY TURN
  const baseEffects = {
    energy: { 
      statChanges: { energyCost: -0.5 }, // Applied every turn
      energyGain: 2,
      healthOverTime: 2, // Heal 2 HP per turn
      duration: 4,
      applyEachTurn: true // Flag for per-turn application
    },
    strength: { 
      statChanges: { 
        physicalAttack: 10,  // Applied every turn
        physicalDefense: 5   // Applied every turn
      },
      healthOverTime: 3, // Heal 3 HP per turn
      duration: 3,
      applyEachTurn: true
    },
    magic: { 
      statChanges: { 
        physicalDefense: 10,  // Applied every turn
        magicalDefense: 10,   // Applied every turn
        maxHealth: 15         // Applied every turn
      },
      healthOverTime: 5, // Heal 5 HP per turn
      duration: 3,
      applyEachTurn: true
    },
    stamina: { 
      statChanges: { 
        physicalDefense: 5    // Base defense, increases with charge
      },
      healthOverTime: 10, // Base healing
      chargeEffect: {         // CHARGE: Increases each turn
        targetStats: ["physicalDefense", "magicalDefense"],
        baseValue: 5,
        perTurnIncrease: 5,
        maxTurns: 4,
        finalBurst: 25,
        healingBase: 10,
        healingIncrease: 5
      },
      duration: 4,
      applyEachTurn: true
    },
    speed: { 
      statChanges: { 
        physicalAttack: 8,    // Applied every turn
        magicalAttack: 8,     // Applied every turn
        physicalDefense: -2,  // Applied every turn
        magicalDefense: -2    // Applied every turn
      },
      healthOverTime: 5, // Heal 5 HP per turn
      duration: 4,
      applyEachTurn: true
    }
  };
  
  // Ensure we have a valid base effect, with fallback
  const baseEffect = baseEffects[type] || { 
    statChanges: { physicalAttack: 3 },
    duration: 3,
    applyEachTurn: true
  };
  
  // Special handling for specific tool effects
  switch (effect) {
    case 'Surge':
      // Surge effects are powerful but short-lived
      if (type === 'strength') {
        return {
          statChanges: { 
            physicalAttack: 15,  // Higher per-turn bonus
            physicalDefense: 8   // Higher per-turn bonus
          },
          healthOverTime: 5,
          duration: 2, // Shorter duration
          applyEachTurn: true
        };
      }
      // Default Surge behavior for other types
      return {
        ...baseEffect,
        statChanges: Object.entries(baseEffect.statChanges || {}).reduce((acc, [stat, value]) => {
          acc[stat] = value * 2; // Double the per-turn effect
          return acc;
        }, {}),
        healthOverTime: (baseEffect.healthOverTime || 3) * 2,
        duration: 2,
        applyEachTurn: true
      };
      
    case 'Shield':
      // Shield effects provide consistent protection
      if (type === 'magic') {
        return {
          statChanges: { 
            physicalDefense: 12,  // Per-turn defense
            magicalDefense: 12,   // Per-turn defense
            maxHealth: 20         // Per-turn health boost
          },
          healthOverTime: 8,      // Heal 8 per turn
          duration: 3,
          applyEachTurn: true
        };
      }
      // Default Shield behavior
      return {
        statChanges: { 
          physicalDefense: 12,
          magicalDefense: 12,
          maxHealth: 20
        },
        healthOverTime: 10,
        duration: 4,
        applyEachTurn: true
      };
      
    case 'Echo':
      // ECHO: Starts strong and diminishes
      if (type === 'energy') {
        return {
          statChanges: { energyCost: -0.5 },
          echoEffect: {
            targetStats: ["energyCost"],
            baseValue: -0.5,
            decayRate: 0.7, // Each turn is 70% of previous
            healingBase: 5,
            healingDecay: 0.7
          },
          duration: 4,
          applyEachTurn: true
        };
      }
      // Default Echo behavior
      return {
        ...baseEffect,
        echoEffect: {
          statMultiplier: 1.5, // Start at 150% effectiveness
          decayRate: 0.7,      // Reduce to 70% each turn
          healingBase: (baseEffect.healthOverTime || 5) * 1.5,
          healingDecay: 0.7
        },
        duration: 6,
        applyEachTurn: true
      };
      
    case 'Drain':
      // Drain effects convert defense to offense each turn
      if (type === 'speed') {
        return {
          statChanges: {
            physicalAttack: 10,   // Per-turn bonus
            magicalAttack: 10,    // Per-turn bonus
            physicalDefense: -3,  // Per-turn penalty
            magicalDefense: -3    // Per-turn penalty
          },
          healthOverTime: 7,      // Drain health per turn
          duration: 4,
          applyEachTurn: true
        };
      }
      // Default Drain behavior
      return {
        statChanges: {
          physicalAttack: 10,
          magicalAttack: 10,
          physicalDefense: -4,
          magicalDefense: -4
        },
        healthOverTime: 8,
        duration: 4,
        applyEachTurn: true
      };
      
    case 'Charge':
      // CHARGE: Builds up over time
      if (type === 'stamina') {
        return {
          chargeEffect: {
            targetStats: ["physicalDefense", "magicalDefense", "maxHealth"],
            baseValue: 3,
            perTurnIncrease: 5,
            maxTurns: 4,
            finalBurst: 30,
            healingBase: 5,
            healingIncrease: 5
          },
          duration: 4,
          applyEachTurn: true
        };
      }
      // Default Charge behavior
      return {
        chargeEffect: {
          targetStats: Object.keys(baseEffect.statChanges || {}).length > 0 
            ? Object.keys(baseEffect.statChanges) 
            : ["physicalAttack"],
          baseValue: 5,
          perTurnIncrease: 5,
          maxTurns: 3,
          finalBurst: 20,
          healingBase: 3,
          healingIncrease: 3
        },
        duration: 4,
        applyEachTurn: true
      };
      
    // Default case - use the base effect
    default:
      return {
        ...baseEffect,
        statChanges: Object.entries(baseEffect.statChanges || {}).reduce((acc, [stat, value]) => {
          acc[stat] = Math.round(value * 1.1);
          return acc;
        }, {}),
        healthOverTime: Math.round((baseEffect.healthOverTime || 5) * 1.1),
        duration: (baseEffect.duration || 2) + 1,
        applyEachTurn: true
      };
  }
};

// COMPLETE FIX: Get spell effect details with guaranteed damage values
export const getSpellEffect = (spell, casterMagic = 5) => {
  console.log(`Getting spell effect for: ${spell?.name} (${spell?.spell_type}/${spell?.spell_effect})`);
  
  // Validate input
  if (!spell || !spell.spell_effect || !spell.spell_type) {
    console.error("Invalid spell data:", spell);
    return {
      damage: 10,
      duration: 0
    };
  }

  const effect = spell.spell_effect;
  const type = spell.spell_type;
  
  // Magic power modifier
  const magicPower = 1 + (casterMagic * 0.15);
  console.log(`Caster magic: ${casterMagic}, Power multiplier: ${magicPower}`);
  
  // CRITICAL FIX: Define spell configurations with explicit instant damage
  const spellConfigurations = {
    // Babylon Burst - Energy/Surge
    'energy-Surge': {
      damage: 30,              // Base instant damage
      criticalChance: 20,
      armorPiercing: true,
      duration: 0              // INSTANT
    },
    
    // Shardstorm - Magic/Surge  
    'magic-Surge': {
      damage: 25,              // Base instant damage
      areaEffect: true,
      criticalChance: 15,
      duration: 0              // INSTANT
    },
    
    // Scrpto Surge - Strength/Drain
    'strength-Drain': {
      damageOverTime: 12,      // Damage per turn
      selfHealOverTime: 10,    // Heal caster per turn
      statChanges: {
        physicalAttack: -4,
        magicalAttack: -4
      },
      selfStatChanges: {
        physicalAttack: 3,
        magicalAttack: 3
      },
      duration: 3,             // 3 turns
      applyEachTurn: true
    },
    
    // Other instant damage spells
    'speed-Surge': {
      damage: 22,
      criticalChance: 25,
      duration: 0
    },
    
    'stamina-Surge': {
      damage: 28,
      armorPiercing: true,
      duration: 0
    },
    
    'strength-Surge': {
      damage: 26,
      criticalChance: 18,
      duration: 0
    },
    
    // Shield spells (healing/defense)
    'stamina-Shield': {
      statChanges: {
        physicalDefense: 10,
        magicalDefense: 10,
        maxHealth: 20
      },
      healingOverTime: 20,
      damageReduction: 0.2,
      duration: 4,
      applyEachTurn: true
    },
    
    'magic-Shield': {
      statChanges: {
        physicalDefense: 12,
        magicalDefense: 15,
        maxHealth: 25
      },
      healingOverTime: 15,
      duration: 3,
      applyEachTurn: true
    },
    
    'energy-Shield': {
      statChanges: {
        physicalDefense: 8,
        magicalDefense: 8,
        energyCost: -0.3
      },
      healingOverTime: 10,
      duration: 4,
      applyEachTurn: true
    },
    
    // Echo spells (diminishing effects)
    'speed-Echo': {
      echoEffect: {
        statBase: {
          initiative: 8,
          dodgeChance: 5,
          criticalChance: 5
        },
        decayRate: 0.7,
        healingBase: 10,
        healingDecay: 0.7
      },
      duration: 4,
      applyEachTurn: true
    },
    
    'magic-Echo': {
      echoEffect: {
        damageBase: 18,
        damageDecay: 0.7,
        statBase: {
          magicalAttack: 6,
          magicalDefense: 6
        },
        statDecay: 0.7
      },
      duration: 4,
      applyEachTurn: true
    },
    
    // Charge spells (building damage)
    'magic-Charge': {
      chargeEffect: {
        damageBase: 5,
        damageIncrease: 10,
        maxTurns: 2,
        finalBurst: 40,
        areaEffect: true
      },
      duration: 2,
      applyEachTurn: true
    },
    
    'energy-Charge': {
      chargeEffect: {
        damageBase: 8,
        damageIncrease: 12,
        maxTurns: 3,
        finalBurst: 45,
        criticalChance: 25
      },
      duration: 3,
      applyEachTurn: true
    },
    
    // Drain spells (damage and heal)
    'magic-Drain': {
      damageOverTime: 15,
      selfHealOverTime: 12,
      statChanges: {
        magicalDefense: -5
      },
      selfStatChanges: {
        magicalAttack: 4
      },
      duration: 3,
      applyEachTurn: true
    },
    
    'speed-Drain': {
      damageOverTime: 10,
      selfHealOverTime: 8,
      statChanges: {
        initiative: -3,
        dodgeChance: -2
      },
      selfStatChanges: {
        initiative: 2,
        dodgeChance: 2
      },
      duration: 4,
      applyEachTurn: true
    }
  };
  
  // Get specific configuration or build default
  const configKey = `${type}-${effect}`;
  let spellEffect = spellConfigurations[configKey];
  
  if (!spellEffect) {
    console.log(`No specific config for ${configKey}, building default`);
    
    // Build default based on effect type
    switch (effect) {
      case 'Surge':
        // All surge spells should be instant damage
        spellEffect = {
          damage: 20,
          criticalChance: 15,
          duration: 0
        };
        break;
        
      case 'Shield':
        spellEffect = {
          statChanges: {
            physicalDefense: 8,
            magicalDefense: 8
          },
          healingOverTime: 12,
          duration: 3,
          applyEachTurn: true
        };
        break;
        
      case 'Drain':
        spellEffect = {
          damageOverTime: 10,
          selfHealOverTime: 8,
          statChanges: {
            physicalAttack: -3,
            magicalAttack: -3
          },
          duration: 3,
          applyEachTurn: true
        };
        break;
        
      case 'Echo':
        spellEffect = {
          echoEffect: {
            damageBase: 15,
            damageDecay: 0.7,
            healingBase: 10,
            healingDecay: 0.7
          },
          duration: 4,
          applyEachTurn: true
        };
        break;
        
      case 'Charge':
        spellEffect = {
          chargeEffect: {
            damageBase: 8,
            damageIncrease: 8,
            maxTurns: 3,
            finalBurst: 35
          },
          duration: 3,
          applyEachTurn: true
        };
        break;
        
      default:
        // Unknown effect - default instant damage
        spellEffect = {
          damage: 15,
          duration: 0
        };
    }
  }
  
  // Apply magic power scaling
  const scaledEffect = { ...spellEffect };
  
  // Scale damage values
  if (scaledEffect.damage) {
    scaledEffect.damage = Math.round(scaledEffect.damage * magicPower);
    console.log(`Scaled instant damage: ${scaledEffect.damage}`);
  }
  
  if (scaledEffect.damageOverTime) {
    scaledEffect.damageOverTime = Math.round(scaledEffect.damageOverTime * magicPower);
  }
  
  if (scaledEffect.healingOverTime) {
    scaledEffect.healingOverTime = Math.round(scaledEffect.healingOverTime * magicPower);
  }
  
  if (scaledEffect.selfHealOverTime) {
    scaledEffect.selfHealOverTime = Math.round(scaledEffect.selfHealOverTime * magicPower);
  }
  
  // Scale charge effect values
  if (scaledEffect.chargeEffect) {
    scaledEffect.chargeEffect = {
      ...scaledEffect.chargeEffect,
      damageBase: Math.round((scaledEffect.chargeEffect.damageBase || 0) * magicPower),
      damageIncrease: Math.round((scaledEffect.chargeEffect.damageIncrease || 0) * magicPower),
      finalBurst: Math.round((scaledEffect.chargeEffect.finalBurst || 0) * magicPower)
    };
  }
  
  // Scale echo effect values
  if (scaledEffect.echoEffect) {
    if (scaledEffect.echoEffect.damageBase) {
      scaledEffect.echoEffect.damageBase = Math.round(scaledEffect.echoEffect.damageBase * magicPower);
    }
    if (scaledEffect.echoEffect.healingBase) {
      scaledEffect.echoEffect.healingBase = Math.round(scaledEffect.echoEffect.healingBase * magicPower);
    }
  }
  
  console.log(`Final spell effect:`, scaledEffect);
  return scaledEffect;
};

// Calculate effect power based on multiple factors
export const calculateEffectPower = (item, casterStats, difficulty = 'medium') => {
  let powerMultiplier = 1.0;
  
  // Difficulty scaling (reduced impact)
  switch (difficulty) {
    case 'easy': powerMultiplier *= 0.9; break;
    case 'medium': powerMultiplier *= 1.0; break;
    case 'hard': powerMultiplier *= 1.1; break;
    case 'expert': powerMultiplier *= 1.2; break;
  }
  
  // Caster stats scaling (for spells)
  if (casterStats && item.spell_type) {
    const relevantStat = casterStats[item.spell_type] || 5;
    powerMultiplier *= (1 + (relevantStat - 5) * 0.05);
  }
  
  // No rarity scaling since all items are equally rare
  // Removed the rarity multiplier section
  
  return powerMultiplier;
};

// Get contextual effect description
export const getEffectDescription = (item, effectPower = 1.0) => {
  const effect = item.tool_effect || item.spell_effect;
  const type = item.tool_type || item.spell_type;
  const isSpell = !!item.spell_type;
  
  const powerLevel = effectPower >= 1.3 ? 'powerful' :
                    effectPower >= 1.1 ? 'effective' :
                    effectPower >= 1.0 ? 'standard' : 'weak';
  
  switch (effect) {
    case 'Surge':
      return isSpell ? 
        `Unleashes a ${powerLevel} burst of ${type} energy, dealing immediate damage.` :
        `Provides a ${powerLevel} but short-lived boost to ${type} capabilities each turn.`;
        
    case 'Shield':
      return isSpell ?
        `Creates a ${powerLevel} magical barrier that protects and heals each turn.` :
        `Grants ${powerLevel} defensive protection and healing each turn.`;
        
    case 'Echo':
      return isSpell ?
        `Applies ${powerLevel} effects that start strong and diminish over time.` :
        `Creates a ${powerLevel} effect that echoes with decreasing power.`;
        
    case 'Drain':
      return isSpell ?
        `Drains life force each turn with ${powerLevel} efficiency.` :
        `Converts defensive power to offense each turn in a ${powerLevel} way.`;
        
    case 'Charge':
      return isSpell ?
        `Charges up power over time for a ${powerLevel} final burst.` :
        `Builds up increasing power each turn for a ${powerLevel} payoff.`;
        
    default:
      return isSpell ?
        `A ${powerLevel} magical effect affecting ${type}.` :
        `Enhances ${type} attributes in a ${powerLevel} way.`;
  }
};

// Calculate combo effects when multiple items are used
export const calculateComboEffect = (effects) => {
  if (!effects || effects.length < 2) return null;
  
  const comboBonus = {
    statChanges: {},
    damage: 0,
    healing: 0,
    duration: 0
  };
  
  // Synergy bonuses for combining effects (reduced values)
  const synergyPairs = [
    ['Surge', 'Drain'],   // Damage + Life steal
    ['Shield', 'Echo'],   // Defense + Duration
    ['Charge', 'Surge'],  // Buildup + Burst
    ['Drain', 'Echo'],    // Sustained drain
    ['Shield', 'Charge']  // Protected buildup
  ];
  
  effects.forEach((effect, index) => {
    effects.slice(index + 1).forEach(otherEffect => {
      const pair = [effect.name, otherEffect.name];
      const reversePair = [otherEffect.name, effect.name];
      
      if (synergyPairs.some(synergyPair => 
        (synergyPair[0] === pair[0] && synergyPair[1] === pair[1]) ||
        (synergyPair[0] === reversePair[0] && synergyPair[1] === reversePair[1])
      )) {
        // Add reduced synergy bonus
        comboBonus.damage += 5;
        comboBonus.healing += 3;
        comboBonus.duration += 1;
        
        // Add stat synergies
        Object.keys(effect.statChanges || {}).forEach(stat => {
          comboBonus.statChanges[stat] = (comboBonus.statChanges[stat] || 0) + 1;
        });
      }
    });
  });
  
  return Object.keys(comboBonus.statChanges).length > 0 || 
         comboBonus.damage > 0 || 
         comboBonus.healing > 0 ? comboBonus : null;
};

// ENHANCED: Process timed effects with turn progression
export const processTimedEffect = (effect, currentTurn, startTurn) => {
  const turnsPassed = currentTurn - startTurn;
  const turnsActive = turnsPassed + 1; // 1-indexed for calculations
  
  // Clone the effect to avoid mutations
  const processedEffect = { ...effect };
  
  // CHARGE EFFECTS: Ramp up over time
  if (effect.effectType === 'Charge' && effect.chargeEffect) {
    const progress = turnsActive / (effect.chargeEffect.maxTurns || 3);
    
    if (turnsActive < effect.chargeEffect.maxTurns) {
      // Building charge - calculate current values
      const currentDamage = effect.chargeEffect.damageBase + 
        (effect.chargeEffect.damageIncrease * (turnsActive - 1));
      const currentHealing = effect.chargeEffect.healingBase + 
        (effect.chargeEffect.healingIncrease * (turnsActive - 1));
      
      processedEffect.damageThisTurn = Math.round(currentDamage);
      processedEffect.healingThisTurn = Math.round(currentHealing);
      
      // Apply increasing stat bonuses
      if (effect.chargeEffect.targetStats) {
        processedEffect.statModifications = {};
        effect.chargeEffect.targetStats.forEach(stat => {
          const statValue = effect.chargeEffect.baseValue + 
            (effect.chargeEffect.perTurnIncrease * (turnsActive - 1));
          processedEffect.statModifications[stat] = Math.round(statValue);
        });
      }
    } else {
      // Final burst turn
      processedEffect.damageThisTurn = Math.round(effect.chargeEffect.finalBurst);
      processedEffect.isFinalBurst = true;
    }
  }
  
  // ECHO EFFECTS: Ramp down over time
  else if (effect.effectType === 'Echo' && effect.echoEffect) {
    const decayMultiplier = Math.pow(effect.echoEffect.decayRate || 0.7, turnsActive - 1);
    
    // Calculate decaying damage
    if (effect.echoEffect.damageBase) {
      processedEffect.damageThisTurn = Math.round(effect.echoEffect.damageBase * decayMultiplier);
    }
    
    // Calculate decaying healing
    if (effect.echoEffect.healingBase) {
      processedEffect.healingThisTurn = Math.round(effect.echoEffect.healingBase * decayMultiplier);
    }
    
    // Calculate decaying stat bonuses
    if (effect.echoEffect.statBase) {
      processedEffect.statModifications = {};
      Object.entries(effect.echoEffect.statBase).forEach(([stat, value]) => {
        processedEffect.statModifications[stat] = Math.round(value * decayMultiplier);
      });
    }
  }
  
  // STANDARD EFFECTS: Consistent each turn
  else if (effect.applyEachTurn) {
    // Apply consistent damage/healing
    if (effect.damageOverTime) {
      processedEffect.damageThisTurn = effect.damageOverTime;
    }
    if (effect.healingOverTime) {
      processedEffect.healingThisTurn = effect.healingOverTime;
    }
    if (effect.healthOverTime) {
      processedEffect.healingThisTurn = effect.healthOverTime;
    }
    
    // Stats are already in statModifications
    if (effect.statChanges && !processedEffect.statModifications) {
      processedEffect.statModifications = effect.statChanges;
    }
  }
  
  return processedEffect;
};

// Get visual effect data for UI animations
export const getVisualEffectData = (effect) => {
  const effectName = effect.tool_effect || effect.spell_effect || 'default';
  
  const visualEffects = {
    'Surge': {
      color: '#FFD700',
      animation: 'pulse-gold',
      particles: 'lightning',
      duration: 600,
      intensity: 'high'
    },
    'Shield': {
      color: '#4FC3F7',
      animation: 'shield-glow',
      particles: 'sparkles',
      duration: 1000,
      intensity: 'medium'
    },
    'Echo': {
      color: '#E1BEE7',
      animation: 'wave-ripple',
      particles: 'rings',
      duration: 1500,
      intensity: 'low'
    },
    'Drain': {
      color: '#F44336',
      animation: 'drain-spiral',
      particles: 'smoke',
      duration: 1200,
      intensity: 'high'
    },
    'Charge': {
      color: '#FF9800',
      animation: 'charge-buildup',
      particles: 'energy',
      duration: 2000,
      intensity: 'building'
    }
  };
  
  return visualEffects[effectName] || {
    color: '#FFFFFF',
    animation: 'fade',
    particles: 'none',
    duration: 500,
    intensity: 'low'
  };
};

// NEW: Calculate item efficiency score for AI
export const calculateItemEfficiency = (item, target, gameState) => {
  let efficiency = 0;
  
  // Base efficiency from item type (all equal rarity now)
  efficiency += 20; // Base score for all items
  
  // Context-based efficiency
  if (item.tool_effect === 'Shield' || item.spell_effect === 'Shield') {
    // Shield is more efficient on low-health targets
    const healthPercent = target.currentHealth / (target.battleStats?.maxHealth || 50);
    efficiency += (1 - healthPercent) * 50;
  } else if (item.tool_effect === 'Surge' || item.spell_effect === 'Surge') {
    // Surge is more efficient when about to attack
    if (gameState.plannedActions?.includes('attack')) {
      efficiency += 30;
    }
  } else if (item.tool_effect === 'Drain' || item.spell_effect === 'Drain') {
    // Drain is efficient when both dealing and taking damage
    if (target.currentHealth < target.battleStats?.maxHealth * 0.7) {
      efficiency += 25;
    }
  } else if (item.tool_effect === 'Echo' || item.spell_effect === 'Echo') {
    // Echo is efficient for long-term value
    efficiency += 20;
  } else if (item.tool_effect === 'Charge' || item.spell_effect === 'Charge') {
    // Charge is efficient when you have time to build up
    if (gameState.turn < 5) {
      efficiency += 35;
    }
  }
  
  // Cost efficiency (tools are free, spells cost energy)
  if (item.spell_type) {
    efficiency -= 10; // Spells have an energy cost penalty
  }
  
  return efficiency;
};

// NEW: Get recommended item usage
export const getRecommendedItemUsage = (availableItems, creatures, gameState) => {
  const recommendations = [];
  
  availableItems.forEach(item => {
    creatures.forEach(creature => {
      const efficiency = calculateItemEfficiency(item, creature, gameState);
      
      if (efficiency > 30) { // Threshold for recommendation
        recommendations.push({
          item: item,
          target: creature,
          efficiency: efficiency,
          reason: getRecommendationReason(item, creature, efficiency)
        });
      }
    });
  });
  
  // Sort by efficiency
  recommendations.sort((a, b) => b.efficiency - a.efficiency);
  
  return recommendations.slice(0, 3); // Return top 3 recommendations
};

// Get recommendation reason
const getRecommendationReason = (item, creature, efficiency) => {
  const effect = item.tool_effect || item.spell_effect;
  
  if (effect === 'Shield' && creature.currentHealth < creature.battleStats?.maxHealth * 0.5) {
    return `${creature.species_name} is low on health and needs protection`;
  } else if (effect === 'Surge' && efficiency > 50) {
    return `Boost ${creature.species_name}'s attack for maximum damage`;
  } else if (effect === 'Echo') {
    return `Apply lasting effects to ${creature.species_name}`;
  } else if (effect === 'Drain') {
    return `Convert ${creature.species_name}'s defense to offense`;
  } else if (effect === 'Charge') {
    return `Build up ${creature.species_name}'s power for later`;
  }
  
  return `Use on ${creature.species_name} for strategic advantage`;
};

// Export all functions
export default {
  getToolEffect,
  getSpellEffect,
  calculateEffectPower,
  getEffectDescription,
  calculateComboEffect,
  processTimedEffect,
  getVisualEffectData,
  calculateItemEfficiency,
  getRecommendedItemUsage
};
