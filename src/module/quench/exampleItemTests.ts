/* eslint-disable jest/no-export, jest/expect-expect */
import foundryItemCompendia from '../monster-parser/foundry-compendia/FoundryItemCompendia';

const registerExampleItemTests = (context) => {
  const { describe, it, assert } = context;
  // TODO - these are the specific ids from my compendia, won't work on other people's systems. Test against name?
  describe('Testing the example item search method for timing', function () {
    it('Finds BattleAxe in compendium by name', async function () {
      const foundItem = await foundryItemCompendia.findItemWithName('Battleaxe');
      assert.ok(foundItem?._id === 'mCMaUBMHZ3SpHruA');
    });
    it('Finds Innate Spellcasting in compendium by name', async function () {
      const foundItem = await foundryItemCompendia.findItemWithName('Innate Spellcasting');
      assert.ok(foundItem?._id === 'hkmTEk6klT6QL4K4');
    });
    it('Finds Magic Missile in compendium by name', async function () {
      const foundItem = await foundryItemCompendia.findItemWithName('Magic Missile');
      assert.ok(foundItem?._id === 'Els7Q2et8nMYfctO');
    });
    it("Doesn't find (nonexistent) Buttered Toast in compendium by name", async function () {
      const foundItem = await foundryItemCompendia.findItemWithName('Buttered Toast');
      assert.ok(foundItem == null);
    });
    it('Finds Blink in compendium by name', async function () {
      const foundItem = await foundryItemCompendia.findItemWithName('Blink');
      assert.ok(foundItem == null);
    });
    it('Finds Lightning Breath in compendium by name', async function () {
      const foundItem = await foundryItemCompendia.findItemWithName('Lightning Breath');
      console.log('foundItem', foundItem);
      assert.ok(foundItem?.name === 'Lightning Breath');
    });
    it('Finds all spellcasting items in compendium', async function () {
      const innateSpellcasting = await foundryItemCompendia.findAllItemsWithName('Innate Spellcasting');
      const spellCasting = await foundryItemCompendia.findAllItemsWithName('Spellcasting');
      const items = [...innateSpellcasting, ...spellCasting];
      console.log('spellcasting items:', items);
      console.log(
        'spellcasting items descriptions: ',
        items.map((item) => item.system.description.value),
      );
      assert.ok(items.length > 0);
    });
  });
};

export default registerExampleItemTests;
