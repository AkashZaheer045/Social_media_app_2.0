// let handle = require("./../utils/promise_handler");
const handle = require('eb-butler-utils').promise_handler;
const omitAsNull = function (value, options) {
  return options && options.omitNull === true && value === null;
};
module.exports = function (model) {
  this.model = model;
  this.find = async function (id) {
    return await handle(this.model.findByPk(id));
  };
  this.findOne = async function (query) {
    return await handle(this.model.findOne(query));
  };
  this.findAll = async function (query) {
    return await handle(this.model.findAll(query));
  };
  this.findByPk = async function (query) {
    return await handle(this.model.findByPk(query));
  };
  this.fetchOne = async function (where) {
    return await handle(this.model.findOne({ where: where }));
  };
  this.fetchAll = async function (where) {
    return await handle(this.model.findAll({ where: where }));
  };
  this.query = async function (query, options) {
    return await handle(this.model.query(query, options || {}));
  };
  this.build = function (values, options) {
    return this.model.build(values, options);
  };
  this.count = async function (query) {
    return await handle(this.model.count(query));
  };
  this.sum = async function (query) {
    return await handle(this.model.sum(query));
  };
  this.save = async function (options) {
    return await handle(this.model.save(options));
  };
  this.destroy = async function (options) {
    return await handle(this.model.destroy(options));
  };
  this.validate = async function (options) {
    return await handle(this.model.validate(options));
  };
  this.create = async function (values, options) {
    return await handle(this.model.create(values, options));
  };
  this.update = async function (values, options) {
    const changed = [];
    const new_values = {};
    options = options || { omitNull: true };
    const dataValues = this.model.toJSON();
    if (values && Object.keys(values).length > 0) {
      const attributes = this.model._options.attributes || [];
      for (const key in values) {
        if (
          attributes.includes(key) &&
          String(values[key]) !== String(dataValues[key]) &&
          !omitAsNull(values[key], options)
        ) {
          changed.push(key);
          new_values[key] = values[key];
        }
      }
    }
    const [instance, err] = await handle(this.model.update(new_values, options));
    if (instance && changed.length > 0) {
      instance._changed = changed;
      instance._previousDataValues = dataValues;
    }
    return [instance, err];
  };
  this.findAndCountAll = async function (query, options) {
    return await handle(this.model.findAndCountAll(query, options));
  };
  this.findOrCreate = async function (where, values, options) {
    const [instance, err] = await this.fetchOne(where);
    if (err) {
      return [undefined, err];
    }
    if (instance) {
      return [instance, err];
    } else {
      return await handle(this.create(values, options));
    }
  };
  this.createOrUpdate = async function (where, values, options) {
    const model = this.model;
    const [instance, err] = await this.fetchOne(where);
    if (err) {
      return [undefined, err];
    }
    if (!instance) {
      return await handle(model.create(values, options));
    } else {
      return await handle(instance.update(values, options));
    }
  };
};
