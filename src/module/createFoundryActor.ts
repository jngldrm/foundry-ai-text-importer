import { Foundry5eMonster } from './monster-parser/schemas/foundry/monster/Foundry5eMonster';

/**
 * This will import an already-formatted monster object into foundry
 *
 * It attempts to add every field in the monster object to the foundry actor, so filtering must
 * be done before calling this
 *
 * @param monster the fully formatted Foundry5eMonster
 *
 * @return the created actor
 */
export const createFoundryActor = async (monster: Foundry5eMonster): Promise<Actor> => {
  console.log('creating foundry actor...');

  const monsterActor = await Actor.create({
    name: monster.name,
    type: 'npc',
  });

  await addAllNonEmbeddedActorFields(monsterActor, monster);

  if (!monsterActor) {
    throw new Error('Could not create monster');
  }

  const foundryItems = await createFoundryItems(monster.items);

  for (const item of foundryItems) {
    if (item?.id == null) {
      console.error('item id not present: ', item);
    } else {
      monsterActor.items.set(item.id, item, { modifySource: true });
    }
  }

  return monsterActor;
};

const createFoundryItems = async (items): Promise<Item[]> => {
  return await Promise.all(
    items.map(async (itemData) => {
      const item = await Item.create(itemData);
      return item;
    }),
  );
};

const addAllNonEmbeddedActorFields = async (monsterActor, monster) => {
  // keeping name and type here so as not to double add them
  const embeddedFields = ['items', 'name', 'type'];
  for (const key in monster) {
    if (!embeddedFields.includes(key)) {
      try {
        await monsterActor.update({
          [key]: monster[key],
        });
      } catch (e) {
        console.error(`error updating monster ${monster.name} field ${key}: `, e);
      }
    }
  }
};

const createFoundryItem = async (itemOutput): Promise<Item> => {
  // try {
  const item = await Item.create({
    name: itemOutput.name,
    type: itemOutput.type,
  });
  if (!item) {
    throw new Error('Could not create item');
  }
  if (!item.id) {
    throw new Error('item.id not present??');
  }
  for (const key in itemOutput.system) {
    // Add system fields one-by-one
    try {
      await item.update({
        // hopefully this doesn't update the whole system object each time, make sure!
        system: {
          [key]: itemOutput.system[key],
        },
      });
    } catch (e) {
      console.error(`error updating item ${item.name} field ${key}: `, e);
    }
  }
  return item;
};
