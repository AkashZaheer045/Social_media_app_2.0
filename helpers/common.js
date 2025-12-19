const axios = require('axios');
const nodemailer = require('nodemailer');
const { parse } = require('csv-parse');
const fs = require('fs');
const { detectLanguage, getLanguageDirection } = require('./language');

const internalRequest = async function (url, data, headers) {
  try {
    const response = await axios.post(url, data, { headers: headers });
    if (!response.data.data) {
      throw new Error('Not found');
    }
    return response.data.data;
  } catch (error) {
    return error;
  }
};

// trigger event to do some update
const webhook = function (url, data, headers) {
  try {
    console.log(url);
    axios.post(url, data, { headers: headers }).then((result) => {
      console.log('got response');
    });
  } catch (error) {
    console.log(error);
  }
};

const languageSet = (req, res, next) => {
  try {
    const lang = detectLanguage(req);
    req.language = lang;
    req.languageDirection = getLanguageDirection(lang);
    next();
  } catch (err) {
    next(err);
  }
};

const sendEmailNodeMailer = function (body) {
  try {
    const { email, subject, body } = body;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'youremail@gmail.com',
        pass: 'yourpassword',
      },
    });

    const mailOptions = {
      from: 'youremail@gmail.com',
      to: email,
      subject: subject,
      text: body,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  } catch (error) {
    throw error;
  }
};

const mapStatus = function (req, data) {
  if (req.user.role == 'user') {
    data.map((order) => {
      order.status = ['Draft', 'Submitted', 'Received', 'Completed'].includes(order.status)
        ? { name: order.status, code: order.status.toLowerCase() }
        : order.status == 'Post-Grading Processing'
          ? { name: 'Post-Grading Processing', code: 'processing' }
          : order.status == "Shipped/On it's way back"
            ? { name: "Shipped/On it's way back", code: 'shipped' }
            : ['Collected', 'Examination', 'Grading'].includes(order.status)
              ? { name: 'Received', code: 'received' }
              : ['Service Packing', 'Quality Assurance'].includes(order.status)
                ? { name: 'Post-Grading Processing', code: 'processing' }
                : order.status == 'Shipped'
                  ? { name: "Shipped/On it's way back", code: 'shipped' }
                  : { name: order.status, code: order.status.toLowerCase() };
    });
  } else {
    // role admin
    data.map((order) => {
      order.status = [
        'Draft',
        'Submitted',
        'Collected',
        'Examination',
        'Grading',
        'Services Packing',
        'Quality Asurance',
        'Shipped',
        'Completed',
      ].includes(order.status)
        ? { name: order.status, code: order.status.toLowerCase() }
        : order.status == 'Received'
          ? { name: 'Cellected', code: 'collected' }
          : { name: null, code: null };
    });
  }
};

const mapGrade = function (grading) {
  const grade = {
    grade1: grading.grade == 1 ? 1 : 0,
    grade1pt5: grading.grade == 1.5 ? 1 : 0,
    grade2: grading.grade == 2 ? 1 : 0,
    grade2pt5: grading.grade == 2.5 ? 1 : 0,
    grade3: grading.grade == 3 ? 1 : 0,
    grade3pt5: grading.grade == 3.5 ? 1 : 0,
    grade4: grading.grade == 4 ? 1 : 0,
    grade4pt5: grading.grade == 4.5 ? 1 : 0,
    grade5: grading.grade == 5 ? 1 : 0,
    grade5pt5: grading.grade == 5.5 ? 1 : 0,
    grade6: grading.grade == 6 ? 1 : 0,
    grade6pt5: grading.grade == 6.5 ? 1 : 0,
    grade7: grading.grade == 7 ? 1 : 0,
    grade7pt5: grading.grade == 7.5 ? 1 : 0,
    grade8: grading.grade == 8 ? 1 : 0,
    grade8pt5: grading.grade == 8.5 ? 1 : 0,
    grade9: grading.grade == 9 ? 1 : 0,
    grade9pt5: grading.grade == 9.5 ? 1 : 0,
    grade10: grading.grade == 10 ? 1 : 0,
    grade10P: grading.grade == '10 GM' ? 1 : 0,
    gradeA: grading.grade == '10 PRI' ? 1 : 0,
  };
  return grade;
};
const setOrderFee = function (order) {
  order = JSON.parse(JSON.stringify(order));
  order.fee = {
    base: 15,
    upgrade: 0,
    promo: 0,
    shipping: 0,
    discountShipping: 0,
    total: 15,
  };
  console.log(order.items.length);
  const noOfItmes = order.items.length || 1;
  if (order.servicePlan?.turnaround == 10) {
    order.fee.base = parseFloat(order.servicePlan.fee) * noOfItmes;
    order.fee.upgrade = 0;
    order.fee.total = parseFloat(order.fee.base);
  } else if (order.servicePlan?.turnaround == 2) {
    order.fee.upgrade = parseFloat(order.servicePlan.fee) * noOfItmes;
    order.fee.base = 0;
    order.fee.total = parseFloat(order.fee.upgrade);
  }

  // // add shipping fee
  // if (order.shippingMethod) {
  //     order.fee.shipping = parseFloat(order.shippingMethod.fee)
  //     order.fee.total = parseFloat(order.fee.shipping) + parseFloat(order.fee.total)
  // }
  return order;
};

const setOrderTurnaround = function (order) {
  order = JSON.parse(JSON.stringify(order));
  order.turnaround = {
    base: 0,
    upgrade: 0,
    total: 0,
  };
  if (order.servicePlan?.turnaround == 10) {
    // set turnaround
    order.turnaround.base = parseFloat(order.servicePlan.turnaround);
    order.turnaround.upgrade = 0;
    order.turnaround.total = parseFloat(order.servicePlan.turnaround);
  } else if (order.servicePlan?.turnaround == 2) {
    // set turnaround
    order.turnaround.upgrade = parseFloat(order.servicePlan.turnaround);
    order.turnaround.base = 0;
    order.turnaround.total = parseFloat(order.servicePlan.turnaround);
  }

  // add shipping fee
  if (order.shippingMethod) {
    order.fee.shipping = parseFloat(order.shippingMethod.fee);
    order.fee.total = parseFloat(order.fee.shipping) + parseFloat(order.fee.total);
  }

  return order;
};

const setOrderDetails = async function (req, order, sequelize) {
  order = JSON.parse(JSON.stringify(order));
  // get order type
  if (order.orderTypeId) {
    const orderTypeInstance = new sequelize.db(sequelize.models.order_types);
    const [orderType, err] = await orderTypeInstance.findOne({ where: { id: order.orderTypeId } });
    if (err) return new TypeError([null, err]);
    order.type = orderType;
  } else {
    order.type = null;
  }

  // get order service_plans : standard/ immediate
  if (order.servicePlanId) {
    const servicePlanInstance = new sequelize.db(sequelize.models.service_plans);
    const [servicePlan, err] = await servicePlanInstance.findOne({
      where: { id: order.servicePlanId },
    });
    if (err) return new TypeError([null, err]);
    order.servicePlan = servicePlan;
  } else {
    order.servicePlan = null;
  }

  // set promo currently not using but just for map structure
  order.promo = order.promoId ? order.promoId : { code: null };
  delete order.promoId;

  // structure order status
  if (order.status) {
    mapStatus(req, [order]);
  }

  if (order.shippingMethodId) {
    // get shipping method and attach with this object
    const shippingMethodInstance = new sequelize.db(sequelize.models.shipping_methods);
    const [shippingMethod, err] = await shippingMethodInstance.findOne({
      where: { id: order.shippingMethodId },
      include: [
        {
          attributes: ['name', 'code'],
          model: sequelize.models.shipping_method_carriers,
          required: false,
          as: 'carrier',
        },
      ],
    });
    if (err) return new TypeError([null, err]);
    order.shippingMethod = shippingMethod;
  } else {
    order.shippingMethod = null;
  }

  // get order shipping address
  if (order.shippingAddressId) {
    // get shipping address and attach with this object
    const addressInstance = new sequelize.db(sequelize.models.addresses);
    const [address, err] = await addressInstance.findOne({
      where: { id: order.shippingAddressId },
      include: [
        {
          attributes: ['id', 'name', 'code', [sequelize.sequelize.literal('NULL'), 'country']],
          model: sequelize.models.states,
          required: false,
        },
        {
          attributes: ['id', 'name', 'code'],
          model: sequelize.models.countries,
          required: false,
        },
      ],
    });
    if (err) return new TypeError([null, err]);
    order.shippingAddress = address;
  } else {
    order.shippingAddress = null;
  }

  // get items against this order
  const itemInstance = new sequelize.db(sequelize.models.items);
  const [items, err] = await itemInstance.findAll({
    where: { orderId: order.id },
    include: [
      {
        model: sequelize.models.items_info,
        required: false,
        as: 'item',
        include: [
          {
            attributes: ['name', 'grade', 'value'],
            model: sequelize.models.gradings,
            required: false,
            as: 'grade',
          },
          {
            model: sequelize.models.cards,
            required: false,
            as: 'card',
            include: [
              {
                attributes: ['name', ['sportId', 'sport']],
                model: sequelize.models.subjects,
                required: false,
                as: 'subjects',
              },
              {
                model: sequelize.models.card_sets,
                required: false,
                as: 'set',
                include: [
                  {
                    model: sequelize.models.sports,
                    required: false,
                    as: 'sport',
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        model: sequelize.models.item_datas,
        required: false,
        as: 'data',
      },
      {
        model: sequelize.models.item_settings,
        required: false,
        as: 'settings',
      },
    ],
  });
  if (err) return new TypeError([null, err]);

  order.items = items ?? [];
  order.items.map((item) => {
    item.status = {
      name: item.status,
      code: item.status.toLowerCase(),
    };
    // calculate totalFee
  });
  // get customer/user
  if (order.customerId) {
    const customerInstance = new sequelize.db(sequelize.models.customers);
    const [customer, err] = await customerInstance.findOne({ where: { id: order.customerId } });
    if (err) return new TypeError([null, err]);
    order.customer = customer;
  }

  // get order settings
  const orderSettingInstance = new sequelize.db(sequelize.models.order_settings);
  const [orderSetting, err2] = await orderSettingInstance.findOne({
    attributes: ['encapsulationRequested', 'fedexAccount', 'useFedexAccount'],
    where: { orderId: order.id },
  });
  if (err2) return new TypeError([null, err2]);
  order.settings = orderSetting
    ? orderSetting
    : { encapsulationRequested: false, fedexAccount: null, useFedexAccount: false };

  order = setOrderFee(order);
  order = setOrderTurnaround(order);
  delete order.shippingAddressId;
  delete order.shippingMethodId;
  return [order, null];
};

const consutructItemObject = async function (item, sequelize) {
  if (item.cardId) {
    // get card from db
    const cardInstance = new sequelize.db(sequelize.models.cards);
    const [card, err] = await cardInstance.findOne({
      where: { id: item.cardId },
      include: [
        {
          attributes: ['name', ['sportId', 'sport']],
          model: sequelize.models.subjects,
          required: false,
          as: 'subjects',
        },
        {
          model: sequelize.models.card_sets,
          required: false,
          as: 'set',
          include: [
            {
              model: sequelize.models.sports,
              required: false,
              as: 'sport',
            },
          ],
        },
      ],
    });
    if (err) return new TypeError([null, err]);
    item.card = card;
  } else {
    item.card = null;
  }
  if (item.gradeId) {
    // get card from db
    // tempItem.card = null
  }
  return [item, null];
};

const insertAdminNotification = async function (data, sequelize) {
  try {
    const customerInstance = new sequelize.db(sequelize.models.customers);
    const [customer, _err2] = await customerInstance.findOne({ where: { id: data.customerId } });
    data.message = data.message + customer.name;
    const notificationInstance = new sequelize.db(sequelize.models.admin_notifications);
    const [_notification, _err] = await notificationInstance.create(data);
  } catch (error) {
    return error;
  }
};

const updateTotalDeclaredValue = async function (orderId, sequelize) {
  try {
    const item2Instance = new sequelize.db(sequelize.models.items);
    const [totalDeclaredValue, err8] = await item2Instance.findOne({
      attributes: [[sequelize.sequelize.literal('SUM(declaredValue)'), 'totalDeclaredValue']],
      include: [
        {
          model: sequelize.models.item_settings,
          as: 'settings', // Adjust the alias based on your association
          attributes: [], // Exclude all attributes from the included model
        },
      ],
      where: {
        orderId: orderId,
      },
      raw: true, // Set raw to true to get plain JSON result
    });
    if (err8) throw err8;
    if (totalDeclaredValue) {
      const [_orderUpdated, err3] = await sequelize.models.orders.update(totalDeclaredValue, {
        where: { id: orderId },
      });
      if (err3) throw err3;
    }
  } catch (error) {
    return error;
  }
};

const readFile = async function (filename) {
  const data = [];

  return new Promise((resolve, reject) => {
    const filePath = 'utils/uploads/' + filename;
    fs.createReadStream(filePath)
      .pipe(
        parse({
          delimiter: ',',
          columns: true,
          ltrim: true,
        })
      )
      .on('data', (row) => {
        // This will push the object row into the array
        data.push(row);
      })
      .on('error', (error) => {
        console.log(error.message);
        reject(error.message);
      })
      .on('end', async () => {
        resolve(data);
      });
  });
};

module.exports = {
  internalRequest,
  webhook,
  languageSet,
  sendEmailNodeMailer,
  mapStatus,
  mapGrade,
  setOrderFee,
  setOrderTurnaround,
  setOrderDetails,
  consutructItemObject,
  insertAdminNotification,
  updateTotalDeclaredValue,
  readFile,
};
