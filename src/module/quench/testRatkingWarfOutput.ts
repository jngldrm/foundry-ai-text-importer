import { Foundry5eMonster } from '../monster-parser/schemas/foundry/monster/Foundry5eMonster';

const ratKing: Foundry5eMonster = {
  name: 'Rat King',
  items: [
    {
      _id: 'EsvdwAvnKR0SGP6R',
      name: 'Keen Smell',
      type: 'feat',
      img: 'icons/creatures/mammals/wolf-howl-moon-forest-blue.webp',
      system: {
        description: {
          value: 'The rat king has advantage on Wisdom (Perception) checks that rely on smell.',
          chat: '',
          unidentified: '',
        },
        source: 'SRD 5.1',
        activation: {
          type: '',
          cost: null,
          condition: '',
        },
        duration: {
          value: '',
          units: '',
        },
        cover: null,
        target: {
          value: null,
          width: null,
          units: '',
          type: '',
        },
        range: {
          value: null,
          long: null,
          units: '',
        },
        uses: {
          value: null,
          max: '',
          per: null,
          recovery: '',
        },
        consume: {
          type: '',
          target: null,
          amount: null,
        },
        ability: '',
        actionType: '',
        attackBonus: '',
        chatFlavor: '',
        critical: {
          threshold: null,
          damage: '',
        },
        damage: {
          parts: [],
          versatile: '',
        },
        formula: '',
        save: {
          ability: '',
          dc: null,
          scaling: 'spell',
        },
        type: {
          value: '',
          subtype: '',
        },
        requirements: '',
        recharge: {
          value: null,
          charged: false,
        },
      },
      effects: [],
      folder: null,
      sort: 0,
      ownership: {
        default: 0,
      },
      flags: {},
      _stats: {
        systemId: null,
        systemVersion: null,
        coreVersion: null,
        createdTime: null,
        modifiedTime: null,
        lastModifiedBy: null,
      },
    },
    {
      name: 'Plague of Ill Omen',
      type: 'weapon',
      img: '',
      system: {
        description: {
          value:
            'The rat king radiates a magical aura of misfortune. A creature that starts its turn within 15 feet of the rat king must succeed on a DC 14 Charisma saving throw or have disadvantage on attack rolls and saving throws until the start of its next turn.',
          chat: '',
          unidentified: '',
        },
        source: 'Warf Monster Importer',
        activation: {
          type: 'action',
          cost: 1,
          condition: '',
        },
        duration: {
          value: '',
          units: '',
        },
        cover: null,
        target: {
          value: null,
          width: null,
          units: '',
          type: '',
        },
        range: {
          value: 5,
          long: null,
          units: 'ft',
        },
        uses: {
          value: null,
          max: '',
          per: null,
          recovery: '',
        },
        consume: {
          type: '',
          target: null,
          amount: null,
        },
        ability: 'str',
        actionType: 'mwak',
        attackBonus: '',
        chatFlavor: '',
        critical: {
          threshold: null,
          damage: '',
        },
        damage: {
          parts: [],
          versatile: '',
        },
        formula: '',
        save: {
          ability: '',
          dc: null,
          scaling: 'spell',
        },
      },
    },
    {
      _id: 'yczO5JpGxAk51Gp8',
      name: 'Multiattack',
      type: 'feat',
      img: 'icons/skills/melee/blade-tips-triple-steel.webp',
      system: {
        description: {
          value: 'The rat king makes two Bite attacks.',
          chat: '',
          unidentified: '',
        },
        source: 'SRD 5.1',
        activation: {
          type: 'action',
          cost: 1,
          condition: '',
        },
        duration: {
          value: '',
          units: '',
        },
        cover: null,
        target: {
          value: null,
          width: null,
          units: '',
          type: '',
        },
        range: {
          value: null,
          long: null,
          units: '',
        },
        uses: {
          value: null,
          max: '',
          per: null,
          recovery: '',
        },
        consume: {
          type: '',
          target: null,
          amount: null,
        },
        ability: null,
        actionType: '',
        attackBonus: '',
        chatFlavor: '',
        critical: {
          threshold: null,
          damage: '',
        },
        damage: {
          parts: [],
          versatile: '',
        },
        formula: '',
        save: {
          ability: '',
          dc: null,
          scaling: 'spell',
        },
        type: {
          value: '',
          subtype: '',
        },
        requirements: '',
        recharge: {
          value: null,
          charged: false,
        },
      },
      effects: [],
      folder: null,
      sort: 0,
      ownership: {
        default: 0,
      },
      flags: {
        core: {
          sourceId: 'Compendium.dnd5e.monsterfeatures.EqoLg8T8EHvhJgKE',
        },
      },
      _stats: {
        systemId: null,
        systemVersion: null,
        coreVersion: null,
        createdTime: null,
        modifiedTime: null,
        lastModifiedBy: null,
      },
    },
    {
      _id: 'A6GBvah75Y7fGjc5',
      name: 'Bite',
      type: 'weapon',
      img: 'icons/creatures/abilities/mouth-teeth-long-red.webp',
      system: {
        description: {
          value:
            'Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 10 (2d6 + 3) piercing damage plus 7 (2d6) poison damage. If the target is a creature, it must succeed on a DC 14 Constitution saving throw or suffer one level of exhaustion and become infected with a disease. Until the disease is cured, at the end of each long rest, the creature must repeat the saving throw. On a failure, the creature suffers another level of exhaustion. The exhaustion lasts until the creature finishes a long rest after the disease is cured. A creature that succeeds on two saving throws recovers from the disease.',
          chat: '',
          unidentified: '',
        },
        source: 'SRD 5.1',
        quantity: 1,
        weight: 0,
        price: {
          value: 0,
          denomination: 'gp',
        },
        attunement: 0,
        equipped: true,
        rarity: '',
        identified: true,
        activation: {
          type: 'action',
          cost: 1,
          condition: '',
        },
        duration: {
          value: '',
          units: '',
        },
        cover: null,
        target: {
          value: null,
          width: null,
          units: '',
          type: '',
        },
        range: {
          value: 5,
          long: null,
          units: 'ft',
        },
        uses: {
          value: null,
          max: '',
          per: null,
          recovery: '',
        },
        consume: {
          type: '',
          target: null,
          amount: null,
        },
        ability: 'str',
        actionType: 'mwak',
        attackBonus: '',
        chatFlavor: '',
        critical: {
          threshold: null,
          damage: '',
        },
        damage: {
          parts: [['1d6+@mod', 'piercing']],
          versatile: '',
        },
        formula: '',
        save: {
          ability: '',
          dc: null,
          scaling: 'spell',
        },
        armor: {
          value: 10,
        },
        hp: {
          value: 0,
          max: 0,
          dt: null,
          conditions: '',
        },
        weaponType: 'natural',
        baseItem: '',
        properties: {
          amm: false,
          fin: false,
          fir: false,
          foc: false,
          hvy: false,
          lgt: false,
          lod: false,
          rch: false,
          rel: false,
          ret: false,
          spc: false,
          thr: false,
          two: false,
          ver: false,
        },
        proficient: true,
      },
      effects: [],
      folder: null,
      sort: 0,
      ownership: {
        default: 0,
      },
      flags: {
        core: {
          sourceId: 'Compendium.dnd5e.monsterfeatures.WdpSeGqhZpptz37y',
        },
      },
      _stats: {
        systemId: null,
        systemVersion: null,
        coreVersion: null,
        createdTime: null,
        modifiedTime: null,
        lastModifiedBy: null,
      },
    },
    {
      name: 'Call Rats (1/Day)',
      type: 'weapon',
      img: '',
      system: {
        description: {
          value:
            'The rat king magically calls 2d4 rats, 1d4 giant rats, or 1 swarm of rats. The rates arrive in 1d4 rounds, acting as allies of the rat king and obeying its spoken commands. The rats remain for 1 hour, until the rat king dies, or until the rat king dismisses them as a bonus action.',
          chat: '',
          unidentified: '',
        },
        source: 'Warf Monster Importer',
        activation: {
          type: 'action',
          cost: 1,
          condition: '',
        },
        duration: {
          value: '',
          units: '',
        },
        cover: null,
        target: {
          value: null,
          width: null,
          units: '',
          type: '',
        },
        range: {
          value: 5,
          long: null,
          units: 'ft',
        },
        uses: {
          value: null,
          max: '',
          per: null,
          recovery: '',
        },
        consume: {
          type: '',
          target: null,
          amount: null,
        },
        ability: 'str',
        actionType: 'mwak',
        attackBonus: '',
        chatFlavor: '',
        critical: {
          threshold: null,
          damage: '',
        },
        damage: {
          parts: [],
          versatile: '',
        },
        formula: '',
        save: {
          ability: '',
          dc: null,
          scaling: 'spell',
        },
      },
    },
  ],
  system: {
    abilities: {
      str: {
        value: 6,
        proficient: -2,
        bonuses: {
          check: '',
          save: '',
        },
      },
      dex: {
        value: 16,
        proficient: 3,
        bonuses: {
          check: '',
          save: '',
        },
      },
      con: {
        value: 18,
        proficient: 4,
        bonuses: {
          check: '',
          save: '',
        },
      },
      int: {
        value: 11,
        proficient: 0,
        bonuses: {
          check: '',
          save: '',
        },
      },
      wis: {
        value: 15,
        proficient: 2,
        bonuses: {
          check: '',
          save: '',
        },
      },
      cha: {
        value: 16,
        proficient: 3,
        bonuses: {
          check: '',
          save: '',
        },
      },
    },
    attributes: {
      ac: {
        flat: 14,
        calc: 'natural',
        formula: '',
      },
      hp: {
        value: 76,
        max: 76,
        formula: '9d8 + 36',
      },
      init: {
        ability: 'dex',
        bonus: '',
      },
      movement: {
        walk: 30,
        fly: 0,
        swim: 0,
        burrow: 20,
        climb: 0,
        hover: false,
        units: 'ft',
      },
      attunement: {
        max: 0,
      },
      senses: {
        darkvision: 60,
        blindsight: 0,
        tremorsense: 0,
        truesight: 0,
        units: 'ft',
        special: '',
      },
      spellcasting: '',
    },
    details: {
      alignment: 'Chaotic Evil',
      type: {
        value: 'monstrosity',
        subtype: '',
        swarm: '',
        custom: '',
      },
      cr: 5,
      source: 'Warf Monster Importer',
      biography: {
        value:
          'A great knot of scabrous rats scrabbles together as a mass, with skulls, bones, and flesh entangled in the whole. Teeth, eyes, and fur all flow as a single disturbing rat swarm walking on two legs. Fused at the Tail. A rat king forms when dozens of rats twist their tails together in a thick knot of bone and lumpy cartilage—and offer praise to the rat demon Chittr’k’k. Its numbers and powers grow quickly. Rule Sewers and Slums. The rat king is a cunning creature that stalks city sewers, boneyards, and slums. Some even command entire thieves’ guilds or hordes of beggars that give it obeisance. They grow larger and more powerful over time until discovered. Plague and Dark Magic. The rat king is the result of plague infused with twisted magic, and a malignant ceremony that creates one is called “Enthroning the Rat King.” Rats afflicted with virulent leavings of dark magic rites or twisted experiments become bound to one another. As more rats add to the mass, the creature’s intelligence and force of will grow.',
        public:
          'A great knot of scabrous rats scrabbles together as a mass, with skulls, bones, and flesh entangled in the whole. Teeth, eyes, and fur all flow as a single disturbing rat swarm walking on two legs. Fused at the Tail. A rat king forms when dozens of rats twist their tails together in a thick knot of bone and lumpy cartilage—and offer praise to the rat demon Chittr’k’k. Its numbers and powers grow quickly. Rule Sewers and Slums. The rat king is a cunning creature that stalks city sewers, boneyards, and slums. Some even command entire thieves’ guilds or hordes of beggars that give it obeisance. They grow larger and more powerful over time until discovered. Plague and Dark Magic. The rat king is the result of plague infused with twisted magic, and a malignant ceremony that creates one is called “Enthroning the Rat King.” Rats afflicted with virulent leavings of dark magic rites or twisted experiments become bound to one another. As more rats add to the mass, the creature’s intelligence and force of will grow.',
      },
      race: '',
      environment: 'Urban',
      spellLevel: 0,
    },
    traits: {
      di: {
        value: ['poison'],
        bypasses: [],
        custom: '',
      },
      dr: {
        value: ['bludgeoning', 'piercing', 'slashing'],
        bypasses: [],
        custom: '',
      },
      dv: {
        value: [],
        bypasses: [],
        custom: '',
      },
      ci: {
        value: ['charmed', 'frightened', 'paralyzed', 'petrified', 'poisoned', 'prone', 'stunned'],
        custom: '',
      },
      languages: {
        value: ['Common', 'Thieves’ Cant'],
        custom: '',
      },
    },
    currency: {
      cp: 0,
      sp: 0,
      ep: 0,
      gp: 0,
      pp: 0,
    },
    skills: {
      ste: {
        value: 6,
        ability: 'dex',
        bonuses: {
          check: '',
          passive: '',
        },
      },
    },
    spells: {
      spell1: {
        value: 0,
        override: null,
      },
      spell2: {
        value: 0,
        override: null,
      },
      spell3: {
        value: 0,
        override: null,
      },
      spell4: {
        value: 0,
        override: null,
      },
      spell5: {
        value: 0,
        override: null,
      },
      spell6: {
        value: 0,
        override: null,
      },
      spell7: {
        value: 0,
        override: null,
      },
      spell8: {
        value: 0,
        override: null,
      },
      spell9: {
        value: 0,
        override: null,
      },
      pact: {
        value: 0,
        override: null,
      },
      spell0: {
        value: 0,
        override: null,
      },
    },
    bonuses: {
      mwak: {
        attack: '',
        damage: '',
      },
      rwak: {
        attack: '',
        damage: '',
      },
      msak: {
        attack: '',
        damage: '',
      },
      rsak: {
        attack: '',
        damage: '',
      },
      abilities: {
        check: '',
        save: '',
        skill: '',
      },
      spell: {
        dc: '',
      },
    },
    resources: {
      legact: {
        value: 0,
        max: 0,
      },
      legres: {
        value: 0,
        max: 0,
      },
      lair: {
        value: false,
        initiative: null,
      },
    },
  },
  type: 'npc',
  img: '',
  effects: [],
  folder: null,
  sort: 0,
  ownership: {
    default: 0,
  },
  flags: {},
  _id: '',
};
export default ratKing;
