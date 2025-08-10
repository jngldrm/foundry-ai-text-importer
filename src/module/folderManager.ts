/**
 * Manages the "AI Monster Importer" folder for organizing all items created by the module
 */

const AI_MONSTER_IMPORTER_FOLDER_NAME = 'AI Monster Importer';

// Cache for the folder creation promise to prevent race conditions
let folderCreationPromise: Promise<string> | null = null;

/**
 * Ensures the "AI Monster Importer" folder exists and returns its ID
 * Creates the folder if it doesn't exist
 * Thread-safe implementation prevents multiple folders from being created concurrently
 */
export const ensureAIImporterFolderExists = async (): Promise<string> => {
  // Check if folder already exists in the collection
  const existingFolder = (game as any).folders.find((folder) => 
    folder.name === AI_MONSTER_IMPORTER_FOLDER_NAME && folder.type === 'Item'
  );

  if (existingFolder) {
    return existingFolder.id;
  }

  // If we're already in the process of creating a folder, return that promise
  if (folderCreationPromise) {
    console.log('Folder creation already in progress, waiting for existing promise');
    return folderCreationPromise;
  }

  // Create the folder creation promise and cache it
  console.log('Starting new folder creation');
  folderCreationPromise = createAIImporterFolder();
  
  try {
    const folderId = await folderCreationPromise;
    console.log(`Folder creation completed with ID: ${folderId}`);
    // Don't clear the cache immediately - keep it for a short time to handle rapid concurrent calls
    setTimeout(() => {
      folderCreationPromise = null;
    }, 1000);
    return folderId;
  } catch (error) {
    // Clear the cache on error so we can retry
    console.error('Folder creation failed:', error);
    folderCreationPromise = null;
    throw error;
  }
};

/**
 * Internal function to create the AI Monster Importer folder
 */
const createAIImporterFolder = async (): Promise<string> => {
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