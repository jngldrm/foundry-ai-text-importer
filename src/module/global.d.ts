import 'fvtt-types';

declare global {
  interface LenientGlobalVariableTypes {
    game: never; // the type doesn't matter
    dnd5e: never;
  }

  namespace ClientSettings {
    interface Values {
      'hero-creation-tool.displayBarsMode': foundry.CONST.TOKEN_DISPLAY_MODES;
      'hero-creation-tool.displayNameMode': foundry.CONST.TOKEN_DISPLAY_MODES;
    }
  }
}
export {};
