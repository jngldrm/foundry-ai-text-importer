import { Parsed5eMonsterBasicInfo } from '../schemas/parsed-input-data/monster/Parsed5eMonster';
import type { Foundry5eMonster } from '../schemas/foundry/monster/Foundry5eMonster';
import { Foundry5eMonsterAttributes } from '../schemas/foundry/monster/Foundry5eMonsterAttributes';
import { Foundry5eMonsterDetails } from '../schemas/foundry/monster/Foundry5eMonsterDetails';
import { Foundry5eMonsterTraits } from '../schemas/foundry/monster/Foundry5eMonsterTraits';
import { Foundry5eMonsterCurrency } from '../schemas/foundry/monster/Foundry5eMonsterCurrency';
import {
  Foundry5eMonsterBonuses,
  Foundry5eMonsterBonusesSchema,
} from '../schemas/foundry/monster/Foundry5eMonsterBonuses';
import {
  Foundry5eMonsterSpells,
  Foundry5eMonsterSpellsSchema,
} from '../schemas/foundry/monster/Foundry5eMonsterSpells';
import {
  Foundry5eMonsterSkills,
  Foundry5eMonsterSkillsSchema,
} from '../schemas/foundry/monster/Foundry5eMonsterSkills';
import {
  Foundry5eMonsterResources,
  Foundry5eMonsterResourcesSchema,
} from '../schemas/foundry/monster/Foundry5eMonsterResources';
import { Foundry5eItem } from '../schemas/foundry/item/Foundry5eItem';

import gargoyleJSON from '../srd/foundry_db_pastes/gargoyle.json';
import { sizeToFoundrySize } from '../schemas/enums/Size';
import StockAvatars from '../avatars/StockAvatars';

export default class Foundry5eMonsterFormatter implements Foundry5eMonster {
  private basicInfo: Parsed5eMonsterBasicInfo;
  private foundryItems: Foundry5eItem[];

  constructor(basicInfo: Parsed5eMonsterBasicInfo, foundryItems: Foundry5eItem[]) {
    this.basicInfo = basicInfo;
    this.foundryItems = foundryItems;
  }

  /**
   * Format the basic info and foundry items into a Foundry5eMonster
   * (Items must already be formatted for foundry)
   *
   * @param basicInfo
   * @param foundryItems
   * @returns
   */
  static format(basicInfo: Parsed5eMonsterBasicInfo, foundryItems: Foundry5eItem[]): Foundry5eMonster {
    const formatter = new Foundry5eMonsterFormatter(basicInfo, foundryItems);
    // must call gen before returning
    return {
      name: formatter.name,
      items: formatter.items,
      system: formatter.system,
      // _stats: formatter._stats,
      type: formatter.type,
      img: formatter.img,
      effects: formatter.effects,
      // TODO - update folder for compendium?
      folder: formatter.folder,
      sort: formatter.sort,
      ownership: {
        default: 0,
      },
      flags: {},
      _id: '',
    };
  }

  get items(): Foundry5eItem[] {
    return this.foundryItems;
  }

  get system() {
    return {
      abilities: this.abilities,
      attributes: this.attributes,
      details: this.details,
      traits: this.traits,
      currency: this.currency,
      skills: this.skills,
      spells: this.spells,
      bonuses: this.bonuses,
      resources: this.resources,
    };
  }
  // Hardcoded values
  type: 'npc' = 'npc';
  effects = [];
  folder = null;
  sort = 0;
  ownership = { default: 0 };
  flags = {};
  _id = '';

  get name(): string {
    return this.basicInfo.name;
  }

  get img(): string {
    return StockAvatars[this.basicInfo.type];
  }

  get abilities() {
    // Schemas here are identical (with optional fields in warf version)
    return this.basicInfo.abilities;
  }

  get attributes(): Foundry5eMonsterAttributes {
    const { basicInfo } = this;
    return {
      ac: {
        flat: basicInfo.armorClass.value,
        calc: basicInfo.armorClass.type,
        formula: basicInfo.armorClass.formula,
      },
      hp: {
        value: basicInfo.hitPoints.average,
        max: basicInfo.hitPoints.average,
        formula: basicInfo.hitPoints.formula,
      },
      // TODO
      init: {
        ability: 'dex',
        bonus: '',
      },
      movement: {
        ...basicInfo.movementSpeed,
        hover: basicInfo.hover,
        units: 'ft',
      },
      attunement: {
        max: 0,
      },
      senses: {
        ...basicInfo.senses,
        units: 'ft',
        special: '',
      },
      spellcasting: '',
    };
  }

  get details(): Foundry5eMonsterDetails {
    return {
      alignment: this.basicInfo.alignment,
      type: {
        value: this.basicInfo.type,
        subtype: this.basicInfo.subtype,
        swarm: this.basicInfo.isASwarm ? 'tiny' : '',
        custom: '',
      },
      cr: this.basicInfo.challengeRating,
      source: 'AI Monster Importer',
      biography: {
        value: this.basicInfo.biography,
        public: this.basicInfo.biography,
      },
      race: this.basicInfo.race,
      environment: this.basicInfo.environment,
      spellLevel: 0,
    };
  }

  get traits(): Foundry5eMonsterTraits {
    // TODO - handle bypasses
    return {
      size: sizeToFoundrySize(this.basicInfo.size),
      di: {
        value: this.basicInfo.damageImmunities,
        bypasses: [],
        custom: '',
      },
      dr: {
        value: this.basicInfo.damageResistances,
        bypasses: [],
        custom: '',
      },
      dv: {
        value: this.basicInfo.damageVulnerabilities,
        bypasses: [],
        custom: '',
      },
      ci: {
        value: this.basicInfo.conditionImmunities,
        custom: '',
      },
      languages: {
        value: this.basicInfo.languages,
        custom: '',
      },
    };
  }

  get currency(): Foundry5eMonsterCurrency {
    return {
      cp: 0,
      sp: 0,
      ep: 0,
      gp: 0,
      pp: 0,
    };
  }
  // TODO - this is messy, uses Parse but might be the way to go
  get skills(): Foundry5eMonsterSkills {
    const skillMapping: { [key: string]: string } = {
      Athletics: 'ath',
      Acrobatics: 'acr',
      'Sleight of Hand': 'slt',
      Stealth: 'ste',
      Arcana: 'arc',
      History: 'his',
      Investigation: 'inv',
      Nature: 'nat',
      Religion: 'rel',
      'Animal Handling': 'ani',
      Insight: 'ins',
      Medicine: 'med',
      Perception: 'prc',
      Survival: 'sur',
      Deception: 'dec',
      Intimidation: 'itm',
      Performance: 'prf',
      Persuasion: 'per',
      // Add other mappings as necessary
    };

    const foundrySkills = {};
    this.basicInfo.skills.forEach((skill) => {
      const skillAbbreviation = skillMapping[skill.name];
      if (!skillAbbreviation) return;

      const modifierValue = parseInt(skill.modifier, 10) || 0;
      foundrySkills[skillAbbreviation] = {
        value: modifierValue,
        ability: 'dex', // This should be set according to your game's logic
        bonuses: {
          check: '',
          passive: '',
        },
      };
    });

    return Foundry5eMonsterSkillsSchema.parse(foundrySkills);
  }

  // TODO - spell slot parsing
  get spells(): Foundry5eMonsterSpells {
    // TODO - boilerplate from gargoyle example for now
    return Foundry5eMonsterSpellsSchema.parse(gargoyleJSON.system.spells);
  }

  get bonuses(): Foundry5eMonsterBonuses {
    return Foundry5eMonsterBonusesSchema.parse(gargoyleJSON.system.bonuses);
  }

  get resources(): Foundry5eMonsterResources {
    return Foundry5eMonsterResourcesSchema.parse(gargoyleJSON.system.resources);
  }

  // get _stats(): FoundryMonsterStats {
  //   return FoundryMonsterStatsSchema.parse(gargoyleJSON._stats);
  // }
}
