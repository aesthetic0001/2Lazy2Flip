const axios = require("axios");
const {getParsed} = require("./src/utils/parseB64");
const {parentPort, workerData} = require("worker_threads");
const config = require("./config.json")
const {strRemoveColorCodes} = require("./src/utils/removeColorCodes");
const {splitNumber} = require("./src/utils/splitNumber");
const {getRawCraft} = require("./src/utils/getRawCraft");
let minProfit = config.nec.minCoinProfit
let minPercentProfit = config.nec["min%Profit"]
const ignoreTalismans = true
const ignoreNoSales = config.nec.ignoreIfNoSales
let ignoredAuctions = []
const {Item} = require("./src/constructors/Item")
const threadsToUse = require("./config.json").nec["threadsToUse/speed"]
const promises = []

parentPort.on("message", async (totalPages) => {
    await doTask(totalPages)
})

async function parsePage(i) {
    const auctionPage = await axios.get(`https://api.hypixel.net/skyblock/auctions?page=${i}`)
    for (const auction of auctionPage.data.auctions) {
        if (!auction.bin) continue
        const uuid = auction.uuid
        const item = await getParsed(auction.item_bytes)
        const extraAtt = item["i"][0].tag.ExtraAttributes
        const itemID = extraAtt.id
        let startingBid = auction.starting_bid
        let profitItem = {
            "profit": 0,
            "percentProfit": 0
        }
        const itemData = workerData.itemDatas[itemID]
        if (!itemData) continue
        const lbin = itemData.lbin
        const sales = itemData.sales
        const prettyItem = new Item(strRemoveColorCodes(item.i[0].tag.display.Name), uuid, auction.starting_bid, auction.tier, extraAtt.enchantments,
            extraAtt.hot_potato_count > 10 ? 10 : extraAtt.hot_potato_count, extraAtt.hot_potato_count > 10 ?
                extraAtt.hot_potato_count - 10 : 0, extraAtt.rarity_upgrades === 1,
            extraAtt.art_of_war_count === 1, extraAtt.dungeon_item_level,
            extraAtt.gems, itemID, auction.category, profitItem.profit, profitItem.percentProfit, lbin, sales)
        // is the percentage difference in average cleanprice and current lbin greater than X%?
        const unstableOrMarketManipulated = Math.abs((lbin - itemData.cleanPrice) / lbin) > config.nec.maxAvgLbinDiff

        if (ignoredAuctions.includes(uuid) || config.nec.ignoreCategories[auction.category] || unstableOrMarketManipulated || sales <= 1 && ignoreNoSales || !sales) continue

        const rcCost = config.nec.includeCraftCost ? getRawCraft(prettyItem, workerData.bazaarData, workerData.itemDatas) : 0
        // TODO: make a percentage diff check to make sure that rawcraft isn't that big of a player in terms of price

        if (config.filters.nameFilter.find((name) => itemID.includes(name)) === undefined) {
            if ((lbin + rcCost) - auction.starting_bid > minProfit) {
                if (startingBid >= 1000000) {
                    profitItem.profit += ((lbin + rcCost) - startingBid)
                        - ((lbin + rcCost) * 0.02);
                    profitItem.percentProfit = (((lbin + rcCost - startingBid)
                        - ((lbin + rcCost) * 0.02)) / startingBid) * 100;
                } else {
                    profitItem.profit += ((lbin + rcCost) - startingBid)
                        - ((lbin + rcCost) * 0.01);
                    profitItem.percentProfit = ((((lbin + rcCost) - startingBid)
                        - ((lbin + rcCost) * 0.01)) / startingBid) * 100;
                }
                if (profitItem.profit > minProfit && profitItem.percentProfit > minPercentProfit) {
                    prettyItem.auctionData.profit = profitItem.profit
                    parentPort.postMessage(prettyItem)
                    ignoredAuctions.push(uuid)
                }
            }
        }
    }
}

async function doTask(totalPages) {
    let startingPage = 0
    const pagePerThread = splitNumber(totalPages, threadsToUse)

    if (workerData.workerNumber !== 0 && startingPage === 0) {
        const clonedStarting = pagePerThread.slice()
        clonedStarting.splice(workerData.workerNumber, 9999);
        clonedStarting.forEach((pagePer) => {
            startingPage += pagePer
        })
    }

    let pageToStop = parseInt(startingPage) + parseInt(pagePerThread[workerData.workerNumber])

    if (pageToStop !== totalPages) {
        pageToStop -= 1
    }

    for (let i = startingPage; i < pageToStop; i++) {
        promises.push(parsePage(i))
    }
    await Promise.all(promises)
    parentPort.postMessage("finished")
}