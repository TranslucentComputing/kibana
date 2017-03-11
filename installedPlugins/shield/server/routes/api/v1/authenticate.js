const Boom = require('boom');
const Joi = require('joi');
const root = require('requirefrom')('');
const http = require('http');
const {assign} = require('lodash');
const basicAuth = root('server/lib/basic_auth');
var Wreck = require('wreck');

module.exports = (server) => {
  const config = server.config();

  const authURL = config.get("shield.url");
  const userURL = config.get("shield.userUrl");
  const clientId = config.get("shield.clientId");
  const clientSecret = config.get("shield.clientSecret");

  const calculateExpires = root('server/lib/get_calculate_expires')(server);
  const success = {statusCode: 200, payload: 'success'};

  server.route({
    method: 'POST',
    path: '/api/shield/v1/login',
    handler: function (request, reply) {

      const {username,password} = request.payload;

      var data = "username=" + username + "&password=" +
        encodeURIComponent(password) + "&grant_type=password&scope=read%20write&" +
        "client_secret=" + clientSecret + "&client_id=" + clientId;

      const wreckAuth = Wreck.defaults({
        headers: basicAuth.getHeader(clientId, clientSecret) //create Authorization header
      });

      //check auth login and pull user data
      const authCallback = (err, res) => {

        if (err) {
          request.auth.session.clear();
          var error = new Error(err);
          reply(Boom.wrap(error));
        }
        else {
          Wreck.read(res, {json: true}, (err, payload) => {

            if (err) {
              request.auth.session.clear();
              var error = new Error(err);
              reply(Boom.wrap(error));
            }
            //Check for specific errors
            else if (res.statusCode == 400) {
              request.auth.session.clear();
              return reply(Boom.badRequest("Invalid"));
            }
            else if (res.statusCode == 401) {
              request.auth.session.clear();
              return reply(Boom.unauthorized("Invalid Credentials."));
            }
            else if (res.statusCode > 401) {
              request.auth.session.clear();
              var error = new Error('Error');
              return reply(Boom.wrap(error, res.statusCode));
            }
            else {
              //Add token to header
              const wreckUser = Wreck.defaults({
                headers: {
                  'Authorization': 'Bearer ' + payload.access_token,
                  "Accept": "application/json"
                }
              });

              //create session with required data
              const userCallback = (err, res) => {

                if (err) {
                  request.auth.session.clear();
                  var error = new Error(err);
                  reply(Boom.wrap(error));
                }
                else {
                  Wreck.read(res, {json: true}, (err, user) => {

                    if (err) {
                      request.auth.session.clear();
                      var error = new Error(err);
                      reply(Boom.wrap(error));
                    }
                    else {
                      // Initialize the session
                      request.auth.session.set({
                        user: user,
                        token: payload,
                        expires: calculateExpires()
                      });

                      reply(success);
                    }
                  });
                }
              };

              //GET user data
              wreckUser.request("GET", userURL, {timeout: 15000}, userCallback);
            }
          });
        }
      };

      //POST to token endpoint
      wreckAuth.request("POST", authURL, {payload: data, timeout: 15000}, authCallback);
    },
    config: {
      auth: false,
      validate: {
        payload: {
          username: Joi.string().required(),
          password: Joi.string().required()
        }
      }
    }
  });

  server.route({
    method: 'POST',
    path: '/api/shield/v1/logout',
    handler(request, reply) {
      request.auth.session.clear();
      return reply(success);
    },
    config: {
      auth: false
    }
  });
};
