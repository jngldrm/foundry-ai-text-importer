export const createTestMonster = async (): Promise<Actor> => {
  const timestampString = new Date().getTime().toString();
  return (await Actor.create({ name: `Test Mon ${timestampString}`, type: 'npc' })) as Actor;
};
