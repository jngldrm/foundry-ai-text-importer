/* eslint-disable jest/expect-expect, jest/no-export */

import { LLM } from 'langchain/dist/llms/base';
import InnateSpellcastingParser from '../../monster-parser/text-parsing/Parsed5eSpellcastingItemParser';
import { Parsed5eSpellcastingItem } from '../../monster-parser/schemas/parsed-input-data/spellcasting/Parsed5eSpellcastingItem';
import Parsed5eSpellcastingItemParser from '../../monster-parser/text-parsing/Parsed5eSpellcastingItemParser';
const LLM_TIMEOUT = 100000;

const registerInnateSpellcastingBasicItemTest = (context) => {
  const { describe, it, assert } = context;
  describe(`Testing the LLM parsing of innate spellcasting items`, function () {
    it('Parses a basic innate spellcasting item and gets the names of the spells right', async function () {
      this.timeout(LLM_TIMEOUT);
      const text = `
          This Skeleton is 1st level spellcaster. Its spellcasting ability is Intelligence (spell save DC 12, +2 to hit with spell attacks). It has the following wizard spells prepared:

          Cantrips (at will): Ray of Frost, Infestation, Frostbite
          
          1st level (2 slots): Witch Bolt
          `;
      const Parsed5eSpellcastingItem = await Parsed5eSpellcastingItemParser.fromText(text);

      const expectedSpellcastingItem: Parsed5eSpellcastingItem = {
        spells: [
          { name: 'Ray of Frost', level: 'Cantrip', atWill: true },
          { name: 'Infestation', level: 'Cantrip', atWill: true },
          { name: 'Frostbite', level: 'Cantrip', atWill: true },
          { name: 'Witch Bolt', level: '1' },
        ],
        spellcastingAbility: 'Intelligence',
        spellAttackBonus: 2,
        slotsByLevel: [{ level: 1, count: 2 }],
      };

      assert.deepEqual(Parsed5eSpellcastingItem, expectedSpellcastingItem);
    });
  });
};

export default registerInnateSpellcastingBasicItemTest;

/**
 *           // const assertSpellIsPresent = (parsed, name, type, slots = undefined, perDay = undefined) => { };
          // const parsed = await InnateSpellcastingParser.parseSpellNamesFromBasicItem({
          //   name: 'Innate Spellcasting',
          //   text,
          //   type: 'specialTrait',
          // });
          // const expectedSpells = [
          //   { name: 'Detect magic', type: 'At will', slots: 0, perDay: 0, atWill: true },
          //   { name: 'Invisibility', type: 'At will', slots: 1, perDay: 1 },
          //   { name: 'Ray of Frost', type: '1st Level', slots: 1, perDay: 1 },
          //   { name: 'Infestation', type: '1st Level', slots: 1, perDay: 1 },
          //   { name: 'Frostbite', type: '1st Level', slots: 1, perDay: 1 },
          // ];
          // for (const spell of parsed) {
          //   const spell = parsed.find((s) => s.name === name);
          //   assert.ok(spell);
          //   assert.ok(spell.name === name);
          //   assert.ok(spell.type === type);
          //   slots && assert.ok(spell.slots === slots);
          //   perDay && assert.ok(spell.perDay === perDay);
          // }
 */
