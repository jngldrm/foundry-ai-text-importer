// import fs from 'fs';
// import path from 'path';
import { Foundry5eItem, Foundry5eItemSchema } from '../schemas/foundry/item/Foundry5eItem';

// TODO - using as a placeholder since fs is breaking the build silently
export const searchMonsterDBForItemWithName = async (name: string): Promise<Foundry5eItem | null> => {
  return null;
};

// TODO - this version uses fs.readFile, but we should use the foundry db instead

// export const searchMonsterDBForItemWithName = async (name: string): Promise<Foundry5eItem | null> => {
//   return new Promise((resolve, reject) => {
//     // Path to the monsters.db file
//     // const filePath = path.join(__dirname, 'src/monster-parser/srd/monsters.db');
//     const filePath = '/Users/will/autodm_foundry/dnd5e/packs/monsters.db';

//     // Read the file
//     fs.readFile(filePath, 'utf8', (err, data) => {
//       if (err) {
//         reject(err);
//         return;
//       }

//       // Split the file content by newlines
//       const lines = data.split('\n');

//       // Search each JSON object
//       for (const line of lines) {
//         try {
//           const monster = JSON.parse(line);
//           // iterate through the items
//           for (const item of monster.items) {
//             if (item.name === name) {
//               console.log('matching item found!');
//               resolve(item as Foundry5eItem);
//               return;
//             }
//           }
//         } catch (error) {
//           // Error in parsing a line (might not be a valid JSON)
//           continue;
//         }
//       }

//       // If the monster is not found
//       resolve(null);
//     });
//   });
// };

// // assumes monsters.db is a bunch of json objects separated by newlines
