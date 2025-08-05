# FoundryVTT AI Monster Text Importer

Import any monster stat block right into FoundryVTT using GPT!

*DnD5e and GPT-4 support only for now, more systems and LLMs to come!*

## Video Demo
Here is a [short video demo](https://www.youtube.com/watch?v=FTbdSSAQR28&ab_channel=WillGregoire) importing a Couatling by copy-pasting text from D&D Beyond (but you can import from any stat block you want!)

[![AI Monster Importer Demo](https://i9.ytimg.com/vi_webp/FTbdSSAQR28/mq1.webp?sqp=CPz9r64G-oaymwEmCMACELQB8quKqQMa8AEB-AH-CYACzgWKAgwIABABGH8gEygVMA8=&rs=AOn4CLCp8JNbSRw9av1rLrRlEpwBGxpPzw)](https://www.youtube.com/watch?v=FTbdSSAQR28&ab_channel=WillGregoire)

## Prerequisites

**Subscribe to an OpenAI plan with GPT-4 access (Required)**
Sign up for a plan on the [OpenAI Website](https://platform.openai.com/signup)

*This module currently uses gpt-4-turbo-preview to power its text content parsing. Models that are available through the free plan (i.e. gpt-3.5-turbo) after testing do not provide accurate results. Support for other LLM providers, including Ollama, is in development.*


**Import the DnD 5e SRD (Recommended but not necessary)**
The importer uses your existing compendium monsters/items for spells, item examples and some assets.
- Option 1 - If you're using a late enough version, do this through FoundryVTT's provided D&D content
- Option 2 - Use [D&D Beyond Importer for Foundry VTT](https://github.com/MrPrimate/ddb-importer) to import all the free SRD content on D&D Beyond

## Usage
- Download and install this module via the [FoundryVTT Add-on Module Marketplace](https://foundryvtt.com/packages/modules "FoundryVTT Modules")
- Open the AI Monster Importer with the button at the top of the Actors tab
- (Do this once) You will be prompted for your OpenAI API key, enter it and click "Save and Validate"
- Copy-paste a monster text block into the box and click "Submit"

**That's it!**

- After parsing your monster, the actor sheet will pop up and display the goods.
- You can select a compendium to send your monsters to - a default one will be created if you don't!
- While parsing, you'll see a breakdown of the different processes as they start and end.
- Click "Import Another" and keep going!

## The Future
There is a lot to be done here in the way of optimization and extending functionality, we're just getting started!

- Leverage more advanced LLMs as they come
- Prompt optimization
- Support other Systems
...and more

## Contact
If you're interested in getting involved or talking about the project, let me know! Find me on the [FoundryVTT Discord](https://discord.com/invite/foundryvtt) at wickerplane.
