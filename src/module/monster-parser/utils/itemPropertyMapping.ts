/**
 * Utilities for mapping D&D 5e item properties to FoundryVTT format
 */

// Map D&D weapon property names to Foundry property codes
export const WEAPON_PROPERTY_MAPPING: Record<string, string> = {
  'versatile': 'ver',
  'finesse': 'fin', 
  'light': 'lgt',
  'heavy': 'hvy',
  'reach': 'rch',
  'thrown': 'thr',
  'two-handed': 'two',
  'ammunition': 'amm',
  'loading': 'lod',
  'special': 'spc',
  'silvered': 'sil',
  'adamantine': 'ada',
  'magical': 'mgc',
  'monk': 'mnk',
  'improvised': 'imp',
  'focus': 'foc',
  'returning': 'ret'
};

// Map D&D weapon names to Foundry base item types
export const BASE_WEAPON_MAPPING: Record<string, string> = {
  'longsword': 'longsword',
  'shortsword': 'shortsword', 
  'dagger': 'dagger',
  'rapier': 'rapier',
  'scimitar': 'scimitar',
  'battleaxe': 'battleaxe',
  'handaxe': 'handaxe',
  'greataxe': 'greataxe',
  'greatsword': 'greatsword',
  'maul': 'maul',
  'warhammer': 'warhammer',
  'club': 'club',
  'mace': 'mace',
  'quarterstaff': 'quarterstaff',
  'spear': 'spear',
  'trident': 'trident',
  'glaive': 'glaive',
  'halberd': 'halberd',
  'pike': 'pike',
  'lance': 'lance',
  'javelin': 'javelin',
  'dart': 'dart',
  'sling': 'sling',
  'shortbow': 'shortbow',
  'longbow': 'longbow',
  'crossbow': 'lightcrossbow',
  'light crossbow': 'lightcrossbow',
  'heavy crossbow': 'heavycrossbow',
  'hand crossbow': 'handcrossbow',
  'blowgun': 'blowgun',
  'net': 'net',
  'whip': 'whip'
};

// Map D&D weapon categories to Foundry weapon types
export const WEAPON_TYPE_MAPPING: Record<string, string> = {
  'simple melee': 'simpleM',
  'simple ranged': 'simpleR', 
  'martial melee': 'martialM',
  'martial ranged': 'martialR',
  'natural': 'natural',
  'improvised': 'improv'
};

// Common D&D equipment types to Foundry equipment categories
export const EQUIPMENT_TYPE_MAPPING: Record<string, string> = {
  'light armor': 'light',
  'medium armor': 'medium',
  'heavy armor': 'heavy',
  'shield': 'shield',
  'clothing': 'clothing',
  'trinket': 'trinket',
  'wondrous item': 'clothing' // Default for magic items
};

/**
 * Convert D&D weapon properties to Foundry property codes
 */
export function mapWeaponProperties(properties: string[]): string[] {
  return properties
    .map(prop => {
      const normalized = prop.toLowerCase().trim();
      return WEAPON_PROPERTY_MAPPING[normalized] || normalized;
    })
    .filter(Boolean);
}

/**
 * Determine Foundry weapon type from D&D weapon category and name
 */
export function determineWeaponType(weaponCategory: string, weaponName: string): string {
  const category = weaponCategory.toLowerCase().trim();
  
  // Check direct mapping first
  if (WEAPON_TYPE_MAPPING[category]) {
    return WEAPON_TYPE_MAPPING[category];
  }
  
  // Infer from weapon name if category not found
  const name = weaponName.toLowerCase();
  
  // Simple melee weapons
  if (['club', 'dagger', 'dart', 'javelin', 'mace', 'quarterstaff', 'sickle', 'spear', 'crossbow', 'shortbow'].some(w => name.includes(w))) {
    return name.includes('bow') || name.includes('crossbow') || name.includes('dart') || name.includes('javelin') ? 'simpleR' : 'simpleM';
  }
  
  // Martial weapons
  if (['longsword', 'shortsword', 'rapier', 'scimitar', 'battleaxe', 'greataxe', 'greatsword', 'maul', 'warhammer'].some(w => name.includes(w))) {
    return 'martialM';
  }
  
  if (['longbow', 'heavy crossbow', 'hand crossbow'].some(w => name.includes(w))) {
    return 'martialR';
  }
  
  // Default based on likely usage
  if (name.includes('bow') || name.includes('crossbow') || name.includes('sling')) {
    return 'simpleR';
  }
  
  return 'martialM'; // Default to martial melee
}

/**
 * Get base item name from weapon name
 */
export function getBaseItem(weaponName: string): string {
  const name = weaponName.toLowerCase().replace(/\s*\+\d+$/, ''); // Remove magical bonus
  
  // Direct mapping
  if (BASE_WEAPON_MAPPING[name]) {
    return BASE_WEAPON_MAPPING[name];
  }
  
  // Partial matching
  for (const [key, value] of Object.entries(BASE_WEAPON_MAPPING)) {
    if (name.includes(key)) {
      return value;
    }
  }
  
  return ''; // No base item found
}

/**
 * Determine equipment type from item description
 */
export function determineEquipmentType(itemType: string, description: string): string {
  const type = itemType.toLowerCase();
  const desc = description.toLowerCase();
  
  // Direct mapping
  if (EQUIPMENT_TYPE_MAPPING[type]) {
    return EQUIPMENT_TYPE_MAPPING[type];
  }
  
  // Infer from description
  if (desc.includes('light armor') || desc.includes('padded') || desc.includes('leather armor') || desc.includes('studded leather')) {
    return 'light';
  }
  
  if (desc.includes('medium armor') || desc.includes('hide armor') || desc.includes('chain shirt') || desc.includes('scale mail') || desc.includes('breastplate') || desc.includes('half plate')) {
    return 'medium';
  }
  
  if (desc.includes('heavy armor') || desc.includes('ring mail') || desc.includes('chain mail') || desc.includes('splint') || desc.includes('plate armor')) {
    return 'heavy';
  }
  
  if (desc.includes('shield')) {
    return 'shield';
  }
  
  return 'clothing'; // Default for wondrous items, clothing, etc.
}

/**
 * Parse rarity from text
 */
export function parseRarity(text: string): string {
  const rarity = text.toLowerCase().trim();
  
  const rarityMap: Record<string, string> = {
    'common': 'common',
    'uncommon': 'uncommon', 
    'rare': 'rare',
    'very rare': 'veryRare',
    'legendary': 'legendary',
    'artifact': 'artifact',
    'none': 'common'
  };
  
  return rarityMap[rarity] || 'common';
}