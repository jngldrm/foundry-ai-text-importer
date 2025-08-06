/* eslint-disable jest/no-export, jest/expect-expect */
import { genFoundry5eItemFromTextBlock } from '../genFoundryItemFromTextBlock';
import foundryItemCompendia from '../monster-parser/foundry-compendia/FoundryItemCompendia';
import { Parsed5eItem } from '../monster-parser/schemas/parsed-input-data/item/Parsed5eItem';

const registerItemImportTests = (context) => {
  const { describe, it, assert } = context;

  describe('Item Import Pipeline Tests', function () {
    it('Can parse a simple weapon from text', async function () {
      const weaponText = `
        Flaming Longsword
        Melee Weapon Attack: +7 to hit, reach 5 ft., one target. 
        Hit: 1d8 + 3 slashing damage plus 1d6 fire damage.
      `;
      
      const item = await genFoundry5eItemFromTextBlock(weaponText);
      assert.ok(item.name.includes('Flaming') || item.name.includes('Longsword'));
      assert.ok(item.type === 'weapon' || item.type === 'feat');
      assert.ok(item.system.damage?.parts?.length > 0);
    });

    it('Can parse a magic item from text', async function () {
      const itemText = `
        Ring of Protection
        This ring grants a +1 bonus to AC and saving throws while worn.
        Requires attunement.
      `;
      
      const item = await genFoundry5eItemFromTextBlock(itemText);
      assert.ok(item.name.includes('Ring') || item.name.includes('Protection'));
      assert.ok(item.system.description.value.length > 0);
    });

    it('Can parse an armor item from text', async function () {
      const armorText = `
        Studded Leather Armor
        AC 12 + Dex modifier (max 2)
        Light armor
      `;
      
      const item = await genFoundry5eItemFromTextBlock(armorText);
      assert.ok(item.name.includes('Studded') || item.name.includes('Leather'));
      assert.ok(item.system.description.value.length > 0);
    });
  });

  describe('Item Compendium Management Tests', function () {
    it('Can get all item compendia', async function () {
      const compendia = await foundryItemCompendia.getAllItemCompendia();
      assert.ok(Array.isArray(compendia));
      assert.ok(compendia.length >= 0);
    });

    it('Can ensure default item compendium exists', async function () {
      await foundryItemCompendia.ensureDefaultItemCompendiumExists();
      const compendia = await foundryItemCompendia.getAllItemCompendia();
      const hasDefaultCompendium = compendia.some(c => c.metadata.name === 'ai-importer-items');
      assert.ok(hasDefaultCompendium);
    });

    it('Can validate and reset selected item compendium', async function () {
      await foundryItemCompendia.validateAndMaybeResetSelectedItemCompendium();
      // Test passes if no errors are thrown
      assert.ok(true);
    });
  });

  describe('Item Schema Validation Tests', function () {
    it('Direct parsing creates valid item structure', async function () {
      const simpleItemText = `
        Magic Sword
        A simple magic weapon that glows with inner light.
        +1 to attack and damage rolls.
      `;
      
      const item = await genFoundry5eItemFromTextBlock(simpleItemText, 'DIRECT_PARSING');
      
      // Validate basic structure
      assert.ok(typeof item.name === 'string');
      assert.ok(item.name.length > 0);
      assert.ok(typeof item.type === 'string');
      assert.ok(item.system);
      assert.ok(item.system.description);
      assert.ok(typeof item.system.description.value === 'string');
    });

    it('Basic item extraction creates valid item structure', async function () {
      const itemText = `
        Healing Potion
        When you drink this potion, you regain 2d4 + 2 hit points.
      `;
      
      const item = await genFoundry5eItemFromTextBlock(itemText, 'BASIC_ITEM_EXTRACTION');
      
      // Validate basic structure
      assert.ok(typeof item.name === 'string');
      assert.ok(item.name.length > 0);
      assert.ok(typeof item.type === 'string');
      assert.ok(item.system);
      assert.ok(item.system.description);
      assert.ok(typeof item.system.description.value === 'string');
    });
  });
};

export default registerItemImportTests;