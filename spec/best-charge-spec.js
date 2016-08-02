let {formatInputs, buildItems, calculateItemsCharge, chooseBestPromotions, calculateCharge, buildReceipt, buildReceiptString, bestCharge} = require('../src/best-charge');
let loadAllItems = require("../src/items");
let loadPromotions = require("../src/promotions");
describe('Take out food', function () {

  it('#1.formatInputs', () => {
    let inputs = ["ITEM0001 x 1", "ITEM0013 x 2", "ITEM0022 x 1"];
    let formattedInputs = formatInputs(inputs);
    let expected = [
      {id: 'ITEM0001', count: 1},
      {id: 'ITEM0013', count: 2},
      {id: 'ITEM0022', count: 1}
    ];
    expect(formattedInputs).toEqual(expected);
  });

  it('#2.buildItems', () => {
    let formattedInputs = [
      {id: 'ITEM0001', count: 1},
      {id: 'ITEM0013', count: 2},
      {id: 'ITEM0022', count: 1}
    ];
    let allItems = loadAllItems;
    let items = buildItems(formattedInputs, allItems);

    let expected = [
      {id: 'ITEM0001', name: '黄焖鸡', price: 18.00, count: 1},
      {id: 'ITEM0013', name: '肉夹馍', price: 6.00, count: 2},
      {id: 'ITEM0022', name: '凉皮', price: 8.00, count: 1}
    ];
    expect(items).toEqual(expected);
  });

  it('#3.calculateItemsCharge', () => {
    let items = [
      {id: 'ITEM0001', name: '黄焖鸡', price: 18.00, count: 1},
      {id: 'ITEM0013', name: '肉夹馍', price: 6.00, count: 2},
      {id: 'ITEM0022', name: '凉皮', price: 8.00, count: 1}
    ];
    let itemsWithCharge = calculateItemsCharge(items);

    let expected = [
      {id: 'ITEM0001', name: '黄焖鸡', price: 18.00, count: 1, itemCharge: 18},
      {id: 'ITEM0013', name: '肉夹馍', price: 6.00, count: 2, itemCharge: 12},
      {id: 'ITEM0022', name: '凉皮', price: 8.00, count: 1, itemCharge: 8}
    ];
    expect(itemsWithCharge).toEqual(expected);
  });

  it('#4.chooseBestPromotions', () => {
    let itemsWithCharge = [
      {id: 'ITEM0001', name: '黄焖鸡', price: 18.00, count: 1, itemCharge: 18},
      {id: 'ITEM0013', name: '肉夹馍', price: 6.00, count: 2, itemCharge: 12},
      {id: 'ITEM0022', name: '凉皮', price: 8.00, count: 1, itemCharge: 8}
    ];
    let promotions = loadPromotions;
    let bestPromotion = chooseBestPromotions(itemsWithCharge, promotions);
    let expected = {
      promotionType: '指定菜品半价',
      promotedItemName: ['黄焖鸡', '凉皮'],
      saved: 13
    };
    expect(bestPromotion).toEqual(expected);
  });


  it('#5.calculateCharge', () => {
    let itemsWithCharge = [
      {id: 'ITEM0001', name: '黄焖鸡', price: 18.00, count: 1, itemCharge: 18},
      {id: 'ITEM0013', name: '肉夹馍', price: 6.00, count: 2, itemCharge: 12},
      {id: 'ITEM0022', name: '凉皮', price: 8.00, count: 1, itemCharge: 8}
    ];

    let bestPromotion = {
      type: '指定菜品半价',
      promotedItemName: ['黄焖鸡', '凉皮'],
      saved: 13
    };

    let charge = calculateCharge(itemsWithCharge, bestPromotion);

    let expected = 25;
    expect(charge).toEqual(expected);

  });

  it('#6.buildReceipt', () => {
    let itemsWithCharge = [
      {id: 'ITEM0001', name: '黄焖鸡', price: 18.00, count: 1, itemCharge: 18},
      {id: 'ITEM0013', name: '肉夹馍', price: 6.00, count: 2, itemCharge: 12},
      {id: 'ITEM0022', name: '凉皮', price: 8.00, count: 1, itemCharge: 8}
    ];
    let bestPromotion = {
      type: '指定菜品半价',
      promotedItemName: ['黄焖鸡', '凉皮'],
      saved: 13
    };
    let charge = 25;

    let receipt = buildReceipt(itemsWithCharge, bestPromotion, charge);

    let expected = {
      items: [
        {name: '黄焖鸡', count: 1, itemCharge: 18},
        {name: '肉夹馍', count: 2, itemCharge: 12},
        {name: '凉皮', count: 1, itemCharge: 8}
      ],
      bestPromotion: {
        type: '指定菜品半价',
        promotedItemName: ['黄焖鸡', '凉皮'],
        saved: 13
      },
      charge: 25
    };

    expect(receipt).toEqual(expected);

  });


  it('should generate best charge when best is 指定菜品半价', function () {
    let inputs = ["ITEM0001 x 1", "ITEM0013 x 2", "ITEM0022 x 1"];
    let summary = bestCharge(inputs).trim();
    let expected = `
============= 订餐明细 =============
黄焖鸡 x 1 = 18元
肉夹馍 x 2 = 12元
凉皮 x 1 = 8元
-----------------------------------
使用优惠:
指定菜品半价(黄焖鸡，凉皮)，省13元
-----------------------------------
总计：25元
===================================`.trim()
    expect(summary).toEqual(expected)
  });

  it('should generate best charge when best is 满30减6元', function () {
    let inputs = ["ITEM0013 x 4", "ITEM0022 x 1"];
    let summary = bestCharge(inputs).trim();
    let expected = `
============= 订餐明细 =============
肉夹馍 x 4 = 24元
凉皮 x 1 = 8元
-----------------------------------
使用优惠:
满30减6元，省6元
-----------------------------------
总计：26元
===================================`.trim()
    expect(summary).toEqual(expected)
  });

  it('should generate best charge when no promotion can be used', function () {
    let inputs = ["ITEM0013 x 4"];
    let summary = bestCharge(inputs).trim();
    let expected = `
============= 订餐明细 =============
肉夹馍 x 4 = 24元
-----------------------------------
总计：24元
===================================`.trim()
    expect(summary).toEqual(expected)
  });

});
