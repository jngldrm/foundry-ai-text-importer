import { parsed } from 'yargs';
import { Foundry5eItem } from '../schemas/foundry/item/Foundry5eItem';
import { Parsed5eItem } from '../schemas/parsed-input-data/item/Parsed5eItem';
import { SavingThrowAbilitiesEnumSchema } from '../schemas/enums/SavingThrowAbilities';
import { SavingThrowScaling, SavingThrowScalingEnumSchema } from '../schemas/enums/SavingThrowScaling';
import { Foundry5eItemDurationSchema } from '../schemas/foundry/item/Foundry5eItemDuration';
import { Foundry5eRangeSchema } from '../schemas/foundry/item/Foundry5eRange';
import { FoundryActionTypeFromActionType } from '../schemas/enums/foundry-specific/FoundryActionType';

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
    return {
      description: this.description,
      source: this.source,
      activation: this.activation,
      duration: this.duration,
      cover: this.cover,
      target: this.target,
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
    };
  }

  get name(): string {
    return this.parsedItem.name;
  }

  get type(): Foundry5eItem['type'] {
    // Inferring foundry item type from actionType for now, only allowing weapons and feats
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
    return {
      value: '',
      subtype: '',
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
}
