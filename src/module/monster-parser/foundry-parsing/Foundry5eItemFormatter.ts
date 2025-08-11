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
    return {
      value: parsedUses?.value || null,
      // convert value to string
      max: parsedUses?.value ? String(parsedUses.value) : null,
      per: parsedUses?.per || null,
      recovery: parsedUses?.recovery || '',
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
    return '';
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
      
      return {
        value: weaponType,
        subtype: this.parsedItem.baseItem || getBaseItem(this.parsedItem.name)
      };
    }
    
    if (this.type === 'equipment') {
      const equipmentType = this.parsedItem.equipmentType ||
        determineEquipmentType(this.parsedItem.itemSubtype || '', this.parsedItem.description);
        
      return {
        value: equipmentType,
        subtype: this.parsedItem.baseItem || ''
      };
    }
    
    return {
      value: this.parsedItem.itemSubtype || '',
      subtype: this.parsedItem.baseItem || ''
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
    if (!this.parsedItem.properties) return [];
    return mapWeaponProperties(this.parsedItem.properties);
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

    // Generate a basic attack activity for weapons
    return {
      'dnd5eactivity000': {
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
          bonus: '',
          critical: {
            threshold: null
          },
          flat: false,
          type: {
            value: this.parsedItem.range?.value ? 'ranged' : 'melee',
            classification: 'weapon'
          }
        },
        damage: {
          critical: {
            bonus: ''
          },
          includeBase: true,
          parts: []
        },
        uses: {
          spent: 0,
          recovery: []
        },
        sort: 0
      }
    };
  }

  get identifier(): string {
    return this.parsedItem.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
  }
}
