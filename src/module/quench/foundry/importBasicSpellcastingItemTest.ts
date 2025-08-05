import Foundry5eItemParser from '../../monster-parser/foundry-parsing/Foundry5eItemParser';
import { Foundry5eItem } from '../../monster-parser/schemas/foundry/item/Foundry5eItem';
import { Parsed5eSpellcastingItem } from '../../monster-parser/schemas/parsed-input-data/spellcasting/Parsed5eSpellcastingItem';

/* eslint-disable jest/expect-expect, jest/no-export */
const registerImportParsed5eSpellcastingItemTest = (context) => {
  const { describe, it, assert } = context;

  describe(`Testing the local parsing of a basic spellcasting item to foundry`, function () {
    it('Parses a basic spellcasting item and gets the names of the spells right', async function () {
      const inputSpellcastingItem: Parsed5eSpellcastingItem = {
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

      const foundryItems: Foundry5eItem[] = await Foundry5eItemParser.fromParsedSpellcastingItem(inputSpellcastingItem);
      console.log('foundryItems: ', foundryItems);

      assert.ok(!!foundryItems.find((item) => item.name === 'Ray of Frost'));
      assert.ok(!!foundryItems.find((item) => item.name === 'Infestation'));
      assert.ok(!!foundryItems.find((item) => item.name === 'Frostbite'));
      assert.ok(!!foundryItems.find((item) => item.name === 'Witch Bolt'));

      // TODO - call method to import the spellcasting item to foundry
      // importParsed5eSpellcastingItemToFoundryMonster(monster, inputSpellcastingItem);

      // TODO - test spellcasting ability and spell attack bonus getting added
    });
  });
};

export default registerImportParsed5eSpellcastingItemTest;
