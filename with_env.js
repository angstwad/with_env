#!/usr/bin/env node

const aws = require('aws-sdk');
const jsesc = require('jsesc');
const yargs = require('yargs');
const process = require('process');

const args = yargs
  .options({
    'region': {
      describe: 'AWS Region'
    },
    'profile': {
      describe: 'AWS Profile'
    },
    'bucket': {
      describe: 'S3 Bucket (cannot be used with --dev)'
    },
    'file': {
      describe: 'File (or path to file) in S3 (cannot be used with --dev)'
    },
    'dev': {
      boolean: true,
      describe: 'Set dev mode (does not load an environment)'
    }
  })
  .boolean('dev')
  .help()
  .argv;

if (args.dev) {
  process.exit(0);
} else if (!(args.file && args.bucket)) {
  console.log(args);
  yargs.showHelp();
  console.error('Error: bucket and file must be used together, or --dev specified');
  process.exit(1);
}

aws.config.setPromisesDependency(Promise);
aws.config.credentials = new aws.EC2MetadataCredentials({
  httpOptions: {
    timeout: 10000
  },
  maxRetries: 10,
  retryDelayOptions: {
    base: 200
  }
});
aws.config.region = args.region;
if (args.profile !== undefined) {
  aws.config.credentials = new aws.SharedIniFileCredentials({profile: args.profile});
}


const s3 = new aws.S3({
  maxRetries: 10,
  signatureVersion: "v4",
});


function handleError(err) {
  console.error('Error:', err);
  return process.exit(1);
}


function printToStdout(data) {
  return console.log(data.join(' '));
}


function processS3Object(data) {
  return new Promise((resolve, reject) => {
    const json = JSON.parse(data.Body.toString());
    let arr = [];
    for (let key in json) {
      if (json.hasOwnProperty(key)) {
        const escaped = jsesc(json[key]);
        arr.push(`export ${key}='${escaped}';`);
      }
    }
    return resolve(arr);
  })
}


function main() {
  const params = {
    Bucket: args.bucket,
    Key: args.file
  };
  s3.getObject(params).promise()
    .then(processS3Object, handleError)
    .then(printToStdout, handleError);
}

main();
