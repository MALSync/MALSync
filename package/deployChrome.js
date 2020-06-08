const fs = require('fs');

const zipName = 'dist/webextension.zip';

// credentials and IDs from gitlab-ci.yml file (your appropriate config file)
const REFRESH_TOKEN = process.env.REFRESH_TOKEN || $REFRESH_TOKEN;
const EXTENSION_ID = process.env.EXTENSION_ID || $EXTENSION_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET || $CLIENT_SECRET;
const CLIENT_ID = process.env.CLIENT_ID || $CLIENT_ID;

const webStore = require('chrome-webstore-upload')({
  extensionId: EXTENSION_ID,
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  refreshToken: REFRESH_TOKEN,
});

uploadZip();

function uploadZip() {
  // creating file stream to upload
  const extensionSource = fs.createReadStream(`./${zipName}`);

  // upload the zip to webstore
  webStore
    .uploadExisting(extensionSource)
    .then(res => {
      console.log('Successfully uploaded the ZIP');

      // publish the uploaded zip
      webStore
        .publish()
        .then(res => {
          console.log('Successfully published the newer version');
        })
        .catch(error => {
          console.log(`Error while publishing uploaded extension: ${error}`);
          process.exit(1);
        });
    })
    .catch(error => {
      console.log(`Error while uploading ZIP: ${error}`);
      process.exit(1);
    });
}
