/**
 * Manages the "AI Monster Importer" folder for organizing all items created by the module
 */

const AI_MONSTER_IMPORTER_FOLDER_NAME = 'AI Monster Importer';

/**
 * Ensures the "AI Monster Importer" folder exists and returns its ID
 * Creates the folder if it doesn't exist
 */
export const ensureAIImporterFolderExists = async (): Promise<string> => {
  // Check if folder already exists
  const existingFolder = (game as any).folders.find((folder) => 
    folder.name === AI_MONSTER_IMPORTER_FOLDER_NAME && folder.type === 'Item'
  );

  if (existingFolder) {
    return existingFolder.id;
  }

  // Create the folder if it doesn't exist
  console.log(`Creating "${AI_MONSTER_IMPORTER_FOLDER_NAME}" folder for AI-created items`);
  const folder = await Folder.create({
    name: AI_MONSTER_IMPORTER_FOLDER_NAME,
    type: 'Item',
    color: '#4CAF50', // Green color to match the module theme
  });

  if (!folder) {
    throw new Error('Failed to create AI Monster Importer folder');
  }

  return folder.id;
};

/**
 * Creates an item with the AI Monster Importer folder as parent
 */
export const createItemInAIFolder = async (itemData: any): Promise<Item> => {
  const folderId = await ensureAIImporterFolderExists();
  
  const itemWithFolder = {
    ...itemData,
    folder: folderId
  };

  const item = await Item.create(itemWithFolder);
  if (!item) {
    throw new Error('Failed to create item in AI folder');
  }

  return item;
};

export { AI_MONSTER_IMPORTER_FOLDER_NAME };