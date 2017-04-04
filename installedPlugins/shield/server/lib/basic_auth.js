module.exports = {
  getHeader: getAuthHeader,
  getKibanaUserAuthHeader: getKibanaUserAuthHeader,
  parseHeader: parseAuthHeader
};

function getAuthHeader(clientId, clientSecret) {

  const auth = new Buffer(`${clientId}:${clientSecret}`).toString('base64');

  return {
    "authorization": `Basic ${auth}`,
    "content-type": "application/x-www-form-urlencoded",
    "accept": "application/json"
  };
}

function getKibanaUserAuthHeader(username,password) {
  const authHeader = new Buffer(`${username}:${password}`).toString('base64');

  return {
    'authorization': `Basic ${authHeader}`
  };
}

function parseAuthHeader(authorization) {
  if (typeof authorization !== 'string') {
    throw new Error('Authorization should be a string');
  }

  const [ authType, token ] = authorization.split(' ');
  if (authType.toLowerCase() !== 'basic') {
    throw new Error('Authorization is not Basic');
  }

  // base64 decode auth header
  const tokenBuffer = new Buffer(token, 'base64');
  const tokenString = tokenBuffer.toString();

  // parse auth data
  let [ username, ...password ] = tokenString.split(/:/);
  password = password.join(':');

  return { username, password };
}
