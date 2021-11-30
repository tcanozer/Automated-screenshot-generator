var screenshotmachine = require('screenshotmachine');
var fs = require('fs');
var { google } = require('googleapis');
var path = require('path');

main();

function main() {

  var urlArray = [
    'https://ifunded.de/en',
    'https://www.propertypartner.co',
    'https://propertymoose.co.uk',
    'https://www.homegrown.co.uk'];

  let drive = connectToDrive();
  urlArray.forEach(element => {
    takeAndUploadScreenshot(drive, element);
  });
}

function takeAndUploadScreenshot(drive, element) {

  var customerKey = '04ffdc';
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
  const CLIENT_ID = '1088594808167-t66748n8cglk0su64hgsldicn849j8je.apps.googleusercontent.com';
  const CLIENT_SECRET = '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';
  const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
  const REFRESH_TOKEN = '1//04wVt_aYd3gqnCgYIARAAGAQSNwF-L9Irn3eJp0sjuZJC1wUHXezcmvPGyWzjLU7Ch-72dzxSEzxhflWXU3VzKlN1yIegaXmsnyY';

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