import { parsed } from 'yargs';
import { Foundry5eItem } from '../schemas/foundry/item/Foundry5eItem';
import { Parsed5eItem } from '../schemas/parsed-input-data/item/Parsed5eItem';
import { SavingThrowAbilitiesEnumSchema } from '../schemas/enums/SavingThrowAbilities';
import { SavingThrowScaling, SavingThrowScalingEnumSchema } from '../schemas/enums/SavingThrowScaling';
import { Foundry5eItemDurationSchema } from '../schemas/foundry/item/Foundry5eItemDuration';
import { Foundry5eRangeSchema } from '../schemas/foundry/item/Foundry5eRange';
import { FoundryActionTypeFromActionType } from '../schemas/enums/foundry-specific/FoundryActionType';
import { 
  mapWeaponProperties, 
  determineWeaponType, 
  getBaseItem, 
  determineEquipmentType,
  parseRarity 
} from '../utils/itemPropertyMapping';

export default class Foundry5eItemFormatter implements Foundry5eItem {
  private parsedItem: Parsed5eItem;

  constructor(parsedItem: Parsed5eItem) {
    this.parsedItem = parsedItem;
  }

  static format(parsedItem: Parsed5eItem): Foundry5eItem {
    const formatter = new Foundry5eItemFormatter(parsedItem);
    // must call gen before returning
    return {
      name: formatter.name,
      type: formatter.type,
      system: formatter.system,
      img: formatter.img,
      effects: formatter.effects,
      flags: formatter.flags,
      folder: formatter.folder,
    };
  }

  get system(): Foundry5eItem['system'] {
    const baseSystem = {
      description: this.description,
      source: this.source,
      quantity: this.quantity,
      weight: this.weight,
      price: this.price,
      attunement: this.attunement,
      equipped: false,
      rarity: this.rarity,
      identified: true,
      cover: this.cover,
      range: this.range,
      uses: this.uses,
      consume: this.consume,
      ability: this.ability,
      actionType: this.actionType,
      attackBonus: this.attackBonus,
      chatFlavor: this.chatFlavor,
      critical: this.critical,
      damage: this.damage,
      formula: this.formula,
      save: this.save,
      type: this.systemType,
      requirements: this.requirements,
      recharge: this.recharge,
      activation: this.activation,
      duration: this.duration,
      target: this.target,
      unidentified: { description: '' },
      container: null,
      crewed: false
    };

    // Add weapon-specific properties
    if (this.type === 'weapon') {
      return {
        ...baseSystem,
        properties: this.properties,
        proficient: null,
        magicalBonus: this.magicalBonus,
        activities: this.activities,
        attuned: false,
        ammunition: {},
        mastery: '',
        identifier: this.identifier
      };
    }
    
    // Add equipment-specific properties
    if (this.type === 'equipment') {
      return {
        ...baseSystem,
        armor: this.armor,
        hp: this.hp,
        speed: this.speed,
        strength: this.strength,
        proficient: null,
        properties: this.properties || []
      };
    }

    // Default system for other item types
    return baseSystem;
  }

  get name(): string {
    return this.parsedItem.name;
  }

  get type(): Foundry5eItem['type'] {
    // Use the new itemType field from the parsed item
    if (this.parsedItem.itemType) {
      switch (this.parsedItem.itemType) {
        case 'weapon':
          return 'weapon';
        case 'equipment':
        case 'tool':
        case 'loot':
        case 'backpack':
          return 'equipment';
        case 'consumable':
          return 'feat'; // Map consumables to feat for magical items/abilities
        case 'spell':
          return 'spell';
        default:
          return 'equipment';
      }
    }

    // Fallback to inferring from actionType (legacy behavior)
    switch (this.parsedItem.actionType) {
      case 'meleeWeaponAttack':
      case 'rangedWeaponAttack':
        return 'weapon';
      case 'meleeSpellAttack':
      case 'rangedSpellAttack':
      case 'healing':
      case 'ability':
      case 'savingThrow':
      case 'utility':
      default:
        return 'feat';
    }
  }

  get description(): Foundry5eItem['system']['description'] {
    return {
      value: this.parsedItem.description,
      chat: '',
      unidentified: '',
    };
  }

  get source(): string {
    return 'AI Monster Importer';
  }

  get activation(): Foundry5eItem['system']['activation'] {
    return this.parsedItem.activation;
  }

  get duration(): Foundry5eItem['system']['duration'] {
    const durationParsed = Foundry5eItemDurationSchema.safeParse(this.parsedItem.duration);
    return durationParsed.success ? durationParsed.data : { value: null, units: '' };
  }

  get cover(): number | null {
    return null;
  }

  get target(): Foundry5eItem['system']['target'] {
    return {
      ...this.parsedItem.target,
      width: null,
    };
  }

  get range(): Foundry5eItem['system']['range'] {
    return {
      value: this.parsedItem?.range?.value || null,
      long: this.parsedItem?.range?.long || null,
      units: this.parsedItem?.range?.units || '',
    };
  }

  get uses(): Foundry5eItem['system']['uses'] {
    const parsedUses = this.parsedItem.uses;
    
    if (!parsedUses?.value) {
      return {
        max: null,
        recovery: [],
        spent: 0
      };
    }
    
    // Format recovery for Foundry v5
    const recovery: Array<{period: string, type: string}> = [];
    if (parsedUses.per === 'day') {
      recovery.push({
        period: 'day',
        type: 'recoverAll'
      });
    } else if (parsedUses.per === 'shortRest') {
      recovery.push({
        period: 'sr',
        type: 'recoverAll'
      });
    } else if (parsedUses.per === 'longRest') {
      recovery.push({
        period: 'lr',
        type: 'recoverAll'
      });
    }
    
    return {
      max: String(parsedUses.value),
      recovery: recovery,
      spent: 0
    };
  }

  get consume(): Foundry5eItem['system']['consume'] {
    return {
      type: '',
      target: null,
      amount: null,
    };
  }

  get ability(): Foundry5eItem['system']['ability'] {
    return null;
  }

  get actionType(): Foundry5eItem['system']['actionType'] {
    return FoundryActionTypeFromActionType(this.parsedItem.actionType);
  }

  get attackBonus(): Foundry5eItem['system']['attackBonus'] {
    return this.magicalBonus ? this.magicalBonus.toString() : '';
  }

  get chatFlavor(): Foundry5eItem['system']['chatFlavor'] {
    return '';
  }

  get critical(): Foundry5eItem['system']['critical'] {
    return {
      threshold: null,
      damage: '',
    };
  }

  get damage(): Foundry5eItem['system']['damage'] {
    return this.parsedItem.damage;
  }

  get formula(): Foundry5eItem['system']['formula'] {
    return '';
  }

  get save(): Foundry5eItem['system']['save'] {
    const abilityParsed = SavingThrowAbilitiesEnumSchema.safeParse(this.parsedItem.save?.ability);
    const scalingParsed = SavingThrowScalingEnumSchema.safeParse('spell');
    return {
      ability: abilityParsed.success ? abilityParsed.data : '',
      dc: this.parsedItem.save?.dc || null,
      scaling: scalingParsed.success ? scalingParsed.data : 'spell', // TODO - base this on action type
    };
  }

  get systemType(): Foundry5eItem['system']['type'] {
    if (this.type === 'weapon') {
      const weaponType = this.parsedItem.weaponType || 
        determineWeaponType(this.parsedItem.itemSubtype || '', this.parsedItem.name);
      
      // Always use getBaseItem if baseItem is empty or undefined
      const baseItem = this.parsedItem.baseItem && this.parsedItem.baseItem.trim() !== '' 
        ? this.parsedItem.baseItem 
        : getBaseItem(this.parsedItem.name);
      
      return {
        value: weaponType,
        baseItem: baseItem
      };
    }
    
    if (this.type === 'equipment') {
      const equipmentType = this.parsedItem.equipmentType ||
        determineEquipmentType(this.parsedItem.itemSubtype || '', this.parsedItem.description);
        
      return {
        value: equipmentType,
        baseItem: this.parsedItem.baseItem || ''
      };
    }
    
    return {
      value: this.parsedItem.itemSubtype || '',
      baseItem: this.parsedItem.baseItem || ''
    };
  }

  get requirements(): Foundry5eItem['system']['requirements'] {
    return '';
  }

  get recharge(): Foundry5eItem['system']['recharge'] {
    return {
      value: this.parsedItem.recharge || null,
      charged: !(this.parsedItem.recharge === null),
    };
  }

  get img(): Foundry5eItem['img'] {
    return this.parsedItem.img || '';
  }

  get flags(): Foundry5eItem['flags'] {
    return this.parsedItem.flags || {};
  }

  get effects(): Foundry5eItem['effects'] {
    return [];
  }

  get folder(): Foundry5eItem['folder'] {
    return null;
  }

  // New property getters for comprehensive item data

  get quantity(): number {
    return this.parsedItem.quantity || 1;
  }

  get weight(): { value: number; units: string } {
    return {
      value: this.parsedItem.weight?.value || 0,
      units: this.parsedItem.weight?.units || 'lb'
    };
  }

  get price(): { value: number; denomination: string } {
    return {
      value: this.parsedItem.price?.value || 0,
      denomination: this.parsedItem.price?.denomination || 'gp'
    };
  }

  get attunement(): string {
    return this.parsedItem.attunement || '';
  }

  get rarity(): string {
    return this.parsedItem.rarity || 'common';
  }

  get properties(): string[] {
    const baseProperties = this.parsedItem.properties || [];
    const mappedProperties = mapWeaponProperties(baseProperties);
    
    // Add "mgc" property for magical items
    if (this.isMagicalItem() && !mappedProperties.includes('mgc')) {
      mappedProperties.push('mgc');
    }
    
    return mappedProperties;
  }

  /**
   * Determine if this is a magical item
   */
  private isMagicalItem(): boolean {
    // Check for magical bonus
    if (this.parsedItem.magicalBonus && this.parsedItem.magicalBonus > 0) {
      return true;
    }
    
    // Check for rarity above common
    if (this.parsedItem.rarity && ['uncommon', 'rare', 'veryRare', 'legendary', 'artifact'].includes(this.parsedItem.rarity)) {
      return true;
    }
    
    // Check for attunement requirement (only magic items require attunement)
    if (this.parsedItem.attunement && this.parsedItem.attunement === 'required') {
      return true;
    }
    
    // Check for special abilities in description (very basic heuristic)
    const description = this.parsedItem.description.toLowerCase();
    if (description.includes('magic') || description.includes('magical') || 
        description.includes('spell') || description.includes('enchant') ||
        description.includes('bonus to attack') || description.includes('bonus to damage')) {
      return true;
    }
    
    return false;
  }

  get magicalBonus(): number | null {
    return this.parsedItem.magicalBonus || null;
  }

  get armor(): { value: number; dex?: number; magicalBonus?: number | null } {
    return {
      value: this.parsedItem.armorClass?.value || 10,
      dex: this.parsedItem.armorClass?.dex,
      magicalBonus: this.parsedItem.armorClass?.magicalBonus || null
    };
  }

  get hp(): { value: number; max: number; dt: null; conditions: string } {
    return {
      value: 0,
      max: 0,
      dt: null,
      conditions: ''
    };
  }

  get speed(): { value: null; conditions: string } {
    return {
      value: null,
      conditions: ''
    };
  }

  get strength(): null {
    return null;
  }

  get activities(): Record<string, any> {
    if (this.type !== 'weapon') return {};

    const activities: Record<string, any> = {};
    
    // Always add the basic attack activity
    activities['dnd5eactivity000'] = this.createAttackActivity();
    
    // Add save activity if item has save mechanics
    if (this.parsedItem.save?.ability && this.parsedItem.save?.dc) {
      activities['dnd5eactivity100'] = this.createSaveActivity();
    }
    
    // Add utility activity if item has special uses
    if (this.parsedItem.uses?.value && this.parsedItem.uses.value > 0) {
      activities['dnd5eactivity300'] = this.createUtilityActivity();
    }

    return activities;
  }

  /**
   * Create the basic weapon attack activity
   */
  private createAttackActivity(): any {
    return {
      _id: 'dnd5eactivity000',
      type: 'attack',
      activation: {
        type: 'action',
        value: 1,
        condition: '',
        override: false
      },
      consumption: {
        targets: [],
        scaling: {
          allowed: false,
          max: ''
        },
        spellSlot: true
      },
      description: {
        chatFlavor: ''
      },
      duration: {
        concentration: false,
        value: '',
        units: 'inst',
        special: '',
        override: false
      },
      effects: [],
      range: {
        value: this.parsedItem.range?.value?.toString() || '5',
        units: this.parsedItem.range?.units || 'ft',
        special: '',
        override: false
      },
      target: {
        template: {
          count: '',
          contiguous: false,
          type: '',
          size: '',
          width: '',
          height: '',
          units: ''
        },
        affects: {
          count: '',
          type: '',
          choice: false,
          special: ''
        },
        prompt: true,
        override: false
      },
      attack: {
        ability: '',
        bonus: this.magicalBonus ? this.magicalBonus.toString() : '',
        critical: {
          threshold: null
        },
        flat: false,
        type: {
          value: this.determineAttackType(),
          classification: 'weapon'
        }
      },
      damage: {
        critical: {
          bonus: ''
        },
        includeBase: true,
        parts: this.getBaseDamageParts()
      },
      uses: {
        spent: 0,
        recovery: []
      },
      sort: 0
    };
  }

  /**
   * Create save activity for special effects
   */
  private createSaveActivity(): any {
    return {
      _id: 'dnd5eactivity100',
      type: 'save',
      activation: {
        type: 'action',
        value: 1,
        condition: '',
        override: false
      },
      consumption: {
        targets: [],
        scaling: {
          allowed: false,
          max: ''
        },
        spellSlot: true
      },
      description: {
        chatFlavor: ''
      },
      duration: {
        concentration: false,
        value: '',
        units: 'inst',
        special: '',
        override: false
      },
      effects: [],
      range: {
        value: this.parsedItem.range?.value?.toString() || '5',
        units: this.parsedItem.range?.units || 'ft',
        special: '',
        override: false
      },
      target: {
        template: {
          count: '',
          contiguous: false,
          type: '',
          size: '',
          width: '',
          height: '',
          units: ''
        },
        affects: {
          count: '',
          type: '',
          choice: false,
          special: ''
        },
        prompt: true,
        override: false
      },
      damage: {
        onSave: 'half',
        parts: this.getSaveDamageParts()
      },
      save: {
        ability: [this.parsedItem.save?.ability || 'con'],
        dc: {
          calculation: '',
          formula: this.parsedItem.save?.dc?.toString() || '15'
        }
      },
      uses: {
        spent: 0,
        recovery: [],
        max: ''
      },
      sort: 0,
      name: ''
    };
  }

  /**
   * Create utility activity for special item uses
   */
  private createUtilityActivity(): any {
    return {
      _id: 'dnd5eactivity300',
      type: 'utility',
      activation: {
        type: 'action',
        value: 1,
        condition: '',
        override: false
      },
      consumption: {
        targets: [
          {
            type: 'itemUses',
            value: '1',
            target: '',
            scaling: {}
          }
        ],
        scaling: {
          allowed: false,
          max: ''
        },
        spellSlot: true
      },
      description: {
        chatFlavor: ''
      },
      duration: {
        concentration: false,
        value: '',
        units: 'inst',
        special: '',
        override: false
      },
      effects: [],
      range: {
        value: this.parsedItem.range?.value?.toString() || '5',
        units: this.parsedItem.range?.units || 'ft',
        special: '',
        override: false
      },
      target: {
        template: {
          count: '',
          contiguous: false,
          type: '',
          size: '',
          width: '',
          height: '',
          units: ''
        },
        affects: {
          count: '',
          type: '',
          choice: false,
          special: ''
        },
        prompt: true,
        override: false
      },
      roll: {
        formula: '',
        name: '',
        prompt: false,
        visible: false
      },
      uses: {
        spent: 0,
        recovery: [],
        max: ''
      },
      sort: 0,
      name: this.getUtilityActivityName()
    };
  }

  get identifier(): string {
    return this.parsedItem.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
  }

  /**
   * Determine attack type based on weapon type and properties
   */
  private determineAttackType(): 'melee' | 'ranged' {
    const weaponType = this.parsedItem.weaponType;
    const weaponName = this.parsedItem.name.toLowerCase();
    const properties = this.parsedItem.properties || [];
    
    // Check weapon type first
    if (weaponType === 'simpleR' || weaponType === 'martialR') {
      return 'ranged';
    }
    
    // Check for explicitly ranged weapons by name
    const rangedWeapons = ['bow', 'crossbow', 'sling', 'blowgun', 'dart'];
    if (rangedWeapons.some(weapon => weaponName.includes(weapon))) {
      return 'ranged';
    }
    
    // Check if weapon has thrown property but isn't primarily ranged
    if (properties.includes('thrown') || properties.includes('thr')) {
      // Thrown weapons like daggers, javelins are still melee weapons when used in melee
      // They can be thrown, but their primary attack is melee
      return 'melee';
    }
    
    // Default to melee for most weapons
    return 'melee';
  }

  /**
   * Generate base damage parts for weapon attacks (includes ALL damage types)
   */
  private getBaseDamageParts(): Array<any> {
    console.log('🔍 DEBUG getBaseDamageParts:', {
      hasDamage: !!this.parsedItem.damage,
      hasParts: !!this.parsedItem.damage?.parts,
      partsLength: this.parsedItem.damage?.parts?.length || 0,
      parts: this.parsedItem.damage?.parts,
      magicalBonus: this.magicalBonus
    });
    
    if (!this.parsedItem.damage?.parts || this.parsedItem.damage.parts.length === 0) {
      console.log('⚠️ No damage parts found, returning empty array');
      return [];
    }

    // Include ALL damage parts in the weapon attack
    const damageParts = this.parsedItem.damage.parts.map(([damage, type], index) => {
      // Apply magical bonus only to the first (base weapon) damage part
      const shouldApplyMagicalBonus = index === 0 && this.magicalBonus;
      
      // Parse damage formula like "1d8" or "1d8 + @mod" into components
      const damageMatch = damage.match(/(\d+)d(\d+)/);
      const number = damageMatch ? parseInt(damageMatch[1]) : null;
      const denomination = damageMatch ? parseInt(damageMatch[2]) : null;
      
      // Handle bonus part of damage formula
      let bonus = '';
      if (damage.includes('+ @mod')) {
        bonus = shouldApplyMagicalBonus ? `@mod + ${this.magicalBonus}` : '@mod';
      } else if (damage.includes('@mod')) {
        bonus = shouldApplyMagicalBonus ? `@mod + ${this.magicalBonus}` : '@mod';  
      } else if (shouldApplyMagicalBonus) {
        bonus = this.magicalBonus.toString();
      }
      
      return {
        custom: {
          enabled: false,
          formula: ''
        },
        number: number,
        denomination: denomination,
        bonus: bonus,
        types: [type],
        scaling: {
          number: 1
        }
      };
    });
    
    console.log('📊 Generated damage parts:', damageParts);
    return damageParts;
  }

  /**
   * Generate damage parts for save effects (special abilities)
   */
  private getSaveDamageParts(): Array<any> {
    if (!this.parsedItem.damage?.parts || this.parsedItem.damage.parts.length < 2) {
      return [];
    }

    // Get special effect damage (typically the second damage part for items like Dagger of Venom)
    const specialDamageParts = this.parsedItem.damage.parts.slice(1);
    
    return specialDamageParts.map(([damage, type]) => {
      // Parse damage formula like "2d10" into number and denomination
      const match = damage.match(/(\d+)d(\d+)/);
      const number = match ? parseInt(match[1]) : 2;
      const denomination = match ? parseInt(match[2]) : 10;
      
      return {
        custom: {
          enabled: false,
          formula: ''
        },
        number: number,
        denomination: denomination,
        bonus: '',
        types: [type],
        scaling: {
          number: 1
        }
      };
    });
  }

  /**
   * Get utility activity name based on item description
   */
  private getUtilityActivityName(): string {
    const name = this.parsedItem.name.toLowerCase();
    const description = this.parsedItem.description.toLowerCase();
    
    if (name.includes('venom') || description.includes('poison')) {
      return 'Poison Blade';
    }
    
    if (description.includes('fire') || description.includes('flame')) {
      return 'Ignite';
    }
    
    if (description.includes('light') || description.includes('illuminate')) {
      return 'Illuminate';
    }
    
    return 'Special Ability';
  }
}
