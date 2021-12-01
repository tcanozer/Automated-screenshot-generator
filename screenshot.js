var screenshotmachine = require('screenshotmachine');
var fs = require('fs');
var { google } = require('googleapis');
var path = require('path');
const config = require('./config.json');



main();


function main() {

  var urlArray = [
    'https://ifunded.de/en',
    'https://www.propertypartner.co',
    'https://propertymoose.co.uk',
    'https://www.homegrown.co.uk',
    'https://www.realtymogul.com'
  ];

  let drive = connectToDrive();
  urlArray.forEach(element => {
    takeAndUploadScreenshot(drive, element);
  });
}

function takeAndUploadScreenshot(drive, element) {

  var customerKey = config.customerkey;
  secretPhrase = '';
  options = {
    url: element,
    dimension: '1920x1080',
    device: 'desktop',
    format: 'png',
    cacheLimit: '0',
    delay: '200',
    zoom: '100'
  }

  var apiUrl = screenshotmachine.generateScreenshotApiUrl(customerKey, secretPhrase, options);

  var url_name = element.replace(/.+\/\/|www.|\..+/g, "");
  var imageName = url_name + '.png';
  screenshotmachine.readScreenshot(apiUrl).pipe(fs.createWriteStream(imageName).on('close', function () {
    console.log('- Screenshot saved as ' + imageName + '\nLink: ' + apiUrl);
    uploadScreenShotToDrive(drive, imageName)
  }));
}

function connectToDrive() {
  const CLIENT_ID = config.CLIENT_ID;
  const CLIENT_SECRET = config.CLIENT_SECRET;
  const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
  const REFRESH_TOKEN = config.REFRESH_TOKEN;

  const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  );

  oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

  const drive = google.drive({
    version: 'v3',
    auth: oauth2Client,
  });
  return drive;
}

async function uploadScreenShotToDrive(drive, imageName) {
  try {
    const filePath = path.join(__dirname, imageName);
    const response = drive.files.create({
      requestBody: {
        name: imageName,
        mimeType: 'image/png',
      },
      media: {
        mimeType: 'image/png',
        body: fs.createReadStream(filePath),
      },
    });
  } catch (error) {
    console.log(error.message);
  }
}