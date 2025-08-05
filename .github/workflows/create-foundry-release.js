

const fetch = require('node-fetch');

async function createAndPushFoundryRelease() {

  const packageAPIArgs = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${process.env.foundryPackageReleaseAuthToken}`, // Make sure to securely manage your token
    },
    method: "POST",
    body: JSON.stringify({
      "id": "llm-text-content-importer",
      "dry-run": false,
      "release": {
        "version": process.env.moduleVersion,
        "manifest": process.env.manifestUrl,
        "notes": process.env.notesUrl,
        "compatibility": {
          "minimum": process.env.minimumCompatibility,
          "verified": process.env.verifiedCompatibility,
          "maximum": process.env.maximumCompatibility
        }
      }
    })
  };
  console.log('packageAPIArgs', packageAPIArgs);
  const response = await fetch("https://api.foundryvtt.com/_api/packages/release_version/", packageAPIArgs);
  const responseData = await response.json();
  console.log(responseData);
}

createAndPushFoundryRelease().catch(console.error);