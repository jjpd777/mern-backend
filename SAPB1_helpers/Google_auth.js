

const {google} = require('googleapis');

const SAP_JSON_KEY={
    "type":"service_account","project_id":"justo-sap-mx","private_key_id":"3c20d2ce7d015ae135d03e8e66eb78126d1d3a3a",
    "private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDX8GcbBd2bEw2d\nMzbukwxIXa0jiqZyDB/tRjUa1dDVnl4BDgUbd4JHm7n1exV6NIZ7Z/TPfiz9pzHr\ndMPPoGDixs9aZM/XPHaRj7GePqgvjDc3po7p4EVxZ0vJn1LSHaUL5+W7hAgAiMA+\nq+c766yuRSIkQHHlYcYmRqqjuSjNG9qf7UbhXrRvqDq+YE9ekuFqvB0iM1XrBD1K\nsSt2GDr2EQNIuvaPn2Nmq/98vkRleJfvq7PuREZaxBmkpLr9aBZkm1pxpDsM3h4T\nO961/QAZvb1T22UFJ07aEKnEtUo9YMqMIH/P1LByGK3pkkAwIlDNLROXSI2AzPi1\nVCp5pygJAgMBAAECggEAEULhjw6vOfnyLOZ+5d/By9gXIr/u0a+H7tDdpl1Aog7U\nf1uWS22Ib75yRT33R8tCk8NJ1btFj+opSqPNEkAE9qPDR/vGhHNMHBMjNN3X1mMs\nN8nb4zSfAHNsIrwWY/7kJlk9azmg5SAJVAksRQUwCscydTjkkdw4uW8NLWS77vc9\nJcba271D8Nvi//fYDP3Opg4ERqCCXGkgFLtf5cRR5teeSeocbYOy+Z4ZhNA18j04\nilkZa6VcHcymhNMvIEyQTdRClcFdwgNeWplz2EFVq+w+vYIelL7Rgb2OBxwMY4lq\nUY4Xnd3dpKg70w3R3y3fbPquiAHrz32RtcfwJF/cIQKBgQD3T29/CapbZwSMzUAB\npnQ04LbYJk2bC1byXm977zSvRWjb2KRA0vLFcakhNF8cmBtYOy4hQx7AesimDqwj\nUBkAYb+NnT/t3kj0NhWL9yJrBlMuU/nRm432a7AQcX8zopdhX/DzRlQC+Ww80Qwy\nLaMiu4a2FLYnPlP0eaNmWAw1UQKBgQDfhsgyqRFFZUACu4oTEBlQ9ScOih843jYr\nIUEtrm+NcPuQHun3z44Wjn9i0C9srqGWXdr7BgAXLArUNWN0Nn4glXSPtX+OY11a\nJUlKPqr9ZLv/wlQKoRRqeOezt5qhpoMZTTMSOdnVk9l2B4w0DW5T/AVpC6hDkZTZ\nNqNFPvx5OQKBgFtxG6C1SjARnzUQjyINEdqbW///6aHyR2vGTyJcB/bmiyb+q3zs\ngqdOp2KHosNH2pR9DUlvL+erfpUnx64m55ekjNcn1YN2NTNW7BCciDVaWVc/5ZcD\nFTKQDsGFtaq5648tkkHhNx8CamryQLgs96zX+a9JaTCJczFp6GjnFVyBAoGBAMwb\nI8V2sgme+cNFAkCD68oMATz6jKX96pKZjA2tgbky2NLyF4ysHr+kINfW5+ci0vQe\nAa5D/WMrWTwLACSG+cbBEi2DetVHEGAXOgQskzBMgop5JQqLqbvLaS+m0PEYvg8l\neiQDZVDr758iJzkEpqDTuREBjwUb80Ig7Rd2+02pAoGBANr0oiWM00lbMBmpgmJN\nbfDdw7AJyl96bTY6z+G7kA6OA9R1+c98pyyBEbd2phIq3s3Cj0o3oDfSYfm2/l7Y\njTqT9kqr/kYOrbay4+XjrRDiL6zXFJEtMci1qiqO1ZnaMaih0bfGepmqtIrqipsB\nl9B6cTxXyUNwP5entNrsAGlB\n-----END PRIVATE KEY-----\n","client_email":"justo-python-backend@justo-sap-mx.iam.gserviceaccount.com",
    "client_id":"106096434546309938871","auth_uri":"https://accounts.google.com/o/oauth2/auth",
    "token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/justo-python-backend%40justo-sap-mx.iam.gserviceaccount.com"
}

/**
 * To use OAuth2 authentication, we need access to a CLIENT_ID, CLIENT_SECRET, AND REDIRECT_URI
 * from the client_secret.json file. To get these credentials for your application, visit
 * https://console.cloud.google.com/apis/credentials.
 */
const oauth2Client = new google.auth.OAuth2(
  YOUR_CLIENT_ID,
  YOUR_CLIENT_SECRET,
  YOUR_REDIRECT_URL
);

// Access scopes for read-only Drive activity.
const scopes = [
  'https://www.googleapis.com/auth/drive.metadata.readonly'
];

// Generate a url that asks permissions for the Drive activity scope
const authorizationUrl = oauth2Client.generateAuthUrl({
  // 'online' (default) or 'offline' (gets refresh_token)
  access_type: 'offline',
  /** Pass in the scopes array defined above.
    * Alternatively, if only one scope is needed, you can pass a scope URL as a string */
  scope: scopes,
  // Enable incremental authorization. Recommended as a best practice.
  include_granted_scopes: true
});