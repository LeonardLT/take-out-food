let _ = require('lodash');
let loadAllItems = require("../src/items");
let loadPromotions = require("../src/promotions");

function formatInputs(inputs) {
  return _.map(inputs, (input) => {
    let [id,count] = input.split("x");
    return {id: id.trim(), count: parseFloat(count.trim())};
  });
}


function _getExistentElementById(array, id) {
  return _.find(array, (element) =>element.id === id);
}


function buildItems(formattedItems, allItems) {
  return _.map(formattedItems, ({id, count}) => {
    let {name, price} = _getExistentElementById(allItems, id);
    return {id, name, price, count};
  });
}


function calculateItemsCharge(items) {
  return _.map(items, (item) => {
    let itemCharge = item.price * item.count;
    return _.assign({}, item, {itemCharge: itemCharge});
  });
}

//#4
function chooseBestPromotions(itemsWithCharge, promotions) {
  let promotionOne = _.find(promotions, promotion => promotion.type === '满30减6元');
  let promotionTwo = _.find(promotions, promotion => promotion.type === '指定菜品半价');
  //promotionOne
  let totalPrice = _.sumBy(itemsWithCharge, 'itemCharge');
  let promotionOneItemsSaved = (totalPrice > 30) ? parseInt((totalPrice / 30) * 6) : 0;

  //promotionTwo
  let promotedItemName = [];
  let promotionTwoItemsSaved = _.sumBy(itemsWithCharge, (item) => {
    let hasPromoted = promotionTwo.items.includes(item.id);
    if (hasPromoted) {
      promotedItemName.push(item.name);
      return item.itemCharge / 2;
    }
  });

  //choose the best promotion
  if (promotionTwoItemsSaved > promotionOneItemsSaved) {
    return {promotionType: promotionTwo.type, promotedItemName, saved: promotionTwoItemsSaved}
  } else {
    return {promotionType: promotionOne.type, saved: promotionOneItemsSaved};
  }
}

//#5
function calculateCharge(itemsWithCharge, bestPromotion) {
  return _.sumBy(itemsWithCharge, 'itemCharge') - bestPromotion.saved;
}

//#6
function buildReceipt(itemsWithCharge, bestPromotion, charge) {
  return {
    items: _.map(itemsWithCharge, ({name, count, itemCharge}) => {
      return {name, count, itemCharge};
    }),
    bestPromotion,
    charge
  };
}

function buildReceiptString(receipt) {
  let lines = ['============= 订餐明细 ============='];

  let itemLines = _.map(receipt.items, ({name, count, itemCharge}) => {
    return `${name} x ${count} = ${itemCharge}元`;
  });
  lines = lines.concat(itemLines);
  let hasPromoted = receipt.bestPromotion.saved > 0;
  if (hasPromoted) {
    lines.push(`-----------------------------------`);
    lines.push(`使用优惠:`);
    if (receipt.bestPromotion.promotionType === '满30减6元') {
      lines.push(`${receipt.bestPromotion.promotionType}，省${receipt.bestPromotion.saved}元`);
    }
    else {
      let name = receipt.bestPromotion.promotedItemName.join('，');
      lines.push(`${receipt.bestPromotion.promotionType}(${name})，省${receipt.bestPromotion.saved}元`);
    }
  }

  lines.push(`-----------------------------------`);
  lines.push(`总计：${receipt.charge}元`);
  lines.push(`===================================`);

  return lines.join("\n");
}

function bestCharge(inputs) {
  let allItems = loadAllItems;
  let promotions = loadPromotions;
  let formattedInputs = formatInputs(inputs);
  let items = buildItems(formattedInputs, allItems);
  let itemsWithCharge = calculateItemsCharge(items);
  let bestPromotion = chooseBestPromotions(itemsWithCharge, promotions);
  let charge = calculateCharge(itemsWithCharge, bestPromotion);
  let receipt = buildReceipt(itemsWithCharge, bestPromotion, charge);
  return buildReceiptString(receipt);
}
module.exports = {
  formatInputs,
  buildItems,
  calculateItemsCharge,
  chooseBestPromotions,
  calculateCharge,
  buildReceipt,
  buildReceiptString,
  bestCharge
};
