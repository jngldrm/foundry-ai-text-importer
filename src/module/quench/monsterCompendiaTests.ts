/* eslint-disable @typescript-eslint/ban-ts-comment, jest/expect-expect, jest/no-export */
import foundryMonsterCompendia, {
  DEFAULT_MONSTER_COMPENDIUM_NAME,
} from '../monster-parser/foundry-compendia/FoundryMonsterCompendia';
import { createTestMonster } from './testUtils';

const EXISTING_TEST_COMPENDIUM_LABEL = 'Test Custom Monster Compendium';
const EXISTING_TEST_COMPENDIUM_NAME = 'test-custom-monster-compendium';

const NONEXISTING_TEST_COMPENDIUM_LABEL = 'Temp Test Monster Compendium';
const NONEXISTING_TEST_COMPENDIUM_NAME = 'temp-test-monster-compendium';

// Adds a monster to an existing compendium
// Adds a monster to a nonexisting compendium by creating it
// Adds a monster to the default compendium if not specified (AI Imported Monsters)

const registerMonsterCompendiaTests = (context) => {
  const { describe, it, assert } = context;

  const assertMonsterInCompendium = async (monster, compendiumName) => {
    const compendium = await foundryMonsterCompendia.getCompendiumByName(compendiumName);
    const index = await compendium?.index;
    // @ts-ignore (Type for entry is incorrect in foundry-vtt-types - Pick)
    assert.ok(index?.some((entry) => entry.name === monster.name));
  };

  describe('Testing the monster compendia export methods', function () {
    // TODO - when you come back - existing compendium is not being found
    it('Adds a monster to an existing compendium', async function () {
      const monster = await createTestMonster();
      await foundryMonsterCompendia.saveAIImportedMonsterToCompendium(
        monster,
        EXISTING_TEST_COMPENDIUM_NAME,
        EXISTING_TEST_COMPENDIUM_LABEL,
      );
      // get the compendium by name and check if the monster is there
      await assertMonsterInCompendium(monster, EXISTING_TEST_COMPENDIUM_NAME);
    });
    it('Adds a monster to the default compendium when no compendium specified', async function () {
      const monster = await createTestMonster();
      await foundryMonsterCompendia.saveAIImportedMonsterToCompendium(monster);
      await assertMonsterInCompendium(monster, DEFAULT_MONSTER_COMPENDIUM_NAME);
    });
    it("If compendium doesn't exist, creates a new one with the name and adds the monster", async function () {
      const compendium = await foundryMonsterCompendia.getCompendiumByName(NONEXISTING_TEST_COMPENDIUM_NAME);
      if (compendium) {
        await compendium.deleteCompendium();
      }
      const monster = await createTestMonster();
      await foundryMonsterCompendia.saveAIImportedMonsterToCompendium(
        monster,
        NONEXISTING_TEST_COMPENDIUM_NAME,
        NONEXISTING_TEST_COMPENDIUM_LABEL,
      );
      assertMonsterInCompendium(monster, NONEXISTING_TEST_COMPENDIUM_NAME);
    });
    it('After adding to compendium, items should still be present', async function () {
      const monster = await createTestMonster();
      const item = await Item.create({ name: 'Test Item', type: 'weapon' });
      monster.items.set(item?.id as string, item as Item, { modifySource: true });
      await foundryMonsterCompendia.saveAIImportedMonsterToCompendium(
        monster,
        EXISTING_TEST_COMPENDIUM_NAME,
        EXISTING_TEST_COMPENDIUM_LABEL,
      );
      const compendium = await foundryMonsterCompendia.getCompendiumByName(EXISTING_TEST_COMPENDIUM_NAME);
      const index = await compendium?.index;
      // @ts-ignore (Type for entry is incorrect in foundry-vtt-types - Pick)
      const entry = index?.find((entry) => entry.name === monster.name);
      // @ts-ignore (Type for entry is incorrect in foundry-vtt-types - Pick)
      const monsterFromCompendium = (await compendium?.getDocument(entry?._id)) as Actor;
      assert.ok(monsterFromCompendium?.items.some((item) => item.name === 'Test Item'));
    });
  });
};

export default registerMonsterCompendiaTests;
