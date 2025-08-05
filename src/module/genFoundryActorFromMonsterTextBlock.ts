import foundryMonsterCompendia from './monster-parser/foundry-compendia/FoundryMonsterCompendia';
import { genFoundry5eMonsterFromTextBlock } from './monster-parser/genFoundry5eMonsterFromTextBlock';
import { createFoundryActor } from './createFoundryActor';

const genFoundry5eMonsterActorFromTextBlock = async (textBlock): Promise<Actor> => {
  // Generate foundry monster from text block (goes through all intermediate steps)
  const monster = await genFoundry5eMonsterFromTextBlock(textBlock);
  // From the Foundry actor json, generate an actual foundry actor
  const actor = await createFoundryActor(monster);
  // import the actor to the default compendium (will allow user to select compendium in the future)
  await foundryMonsterCompendia.saveAIImportedMonsterToCompendium(actor);
  // show the character sheet after importing
  actor.sheet?.render(true);
  return actor;
};

export default genFoundry5eMonsterActorFromTextBlock;
