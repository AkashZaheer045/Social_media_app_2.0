const { config, sequelize, connection } = require('./connection');
//--//
const models = {
  users: require('../schemas/schUsers')(connection, sequelize),
  authorizations: require('../schemas/schAuthorizations')(connection, sequelize),
  posts: require('../schemas/schPosts')(connection, sequelize),
  //voices: (require("../schemas/schVoices"))(connection, sequelize),
  //art_styles: (require("../schemas/schArt_styles"))(connection, sequelize),
  //languages: (require("../schemas/schLanguages"))(connection, sequelize),
  //topics: (require("../schemas/schTopics"))(connection, sequelize),
  temp_tokens: require('../schemas/schTemppass')(connection, sequelize), // <-- Add this line
  file: require('../schemas/file')(connection, sequelize),
  comments: require('../schemas/schComments')(connection, sequelize),
  likes: require('../schemas/schLikes')(connection, sequelize),
  roles: require('../schemas/schRoles')(connection, sequelize),
};

//--//
require('./hooks')(models);
require('./scopes')(models);
require('./associations')(models);

//--//
const instance = require('./instance');
module.exports = {
  config,
  sequelize,
  connection,
  models,
  db: instance,
};
