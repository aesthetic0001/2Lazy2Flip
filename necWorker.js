const axios = require("axios");
const {getParsed} = require("./src/utils/parseB64");
const {parentPort, workerData} = require("worker_threads");
const config = require("./config.json")
const {getRawCraft} = require("./src/utils/getRawCraft");
let minProfit = config.nec.minCoinProfit
let minPercentProfit = config.nec["min%Profit"]
const ignoreTalismans = true
const ignoreNoSales = config.nec.ignoreIfNoSales
const {Item} = require("./src/constructors/Item")

let profits = ["prof"]

async function doTask() {
    let ignoredCopy = workerData.ignored.slice()
    for (let i = workerData.pageToStartOn; i < workerData.pagesToProcess + 1; i++) {
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
            const prettyItem = new Item(item.i[0].tag.display.Name, uuid, auction.starting_bid, auction.tier, extraAtt.enchantments,
                extraAtt.hot_potato_count > 10 ? 10 : extraAtt.hot_potato_count, extraAtt.hot_potato_count > 10 ?
                    extraAtt.hot_potato_count - 10 : 0, extraAtt.rarity_upgrades === 1,
                extraAtt.art_of_war_count === 1, extraAtt.dungeon_item_level,
                extraAtt.gems, itemID, auction.category, profitItem.profit, profitItem.percentProfit, lbin, sales)
            // is the percentage difference in average cleanprice and current lbin greater than X%?
            const unstableOrMarketManipulated = (lbin - itemData.cleanPrice) / lbin > config.nec.maxAvgLbinDiff

            if (ignoredCopy.includes(uuid) || config.nec.ignoreCategories[auction.category] || unstableOrMarketManipulated || sales === 0 && ignoreNoSales) continue

            if (config.nec.nameFilter.find((name) => itemID.includes(name)) === undefined) {
                if (lbin - auction.starting_bid > minProfit) {
                    // TODO: Fix percent profit for craft cost (too lazy rn lmfao)
                    if (config.nec.includeCraftCost) {
                        const rawCraftAddition = getRawCraft(prettyItem, workerData.bazaarData, workerData.itemDatas)
                        profitItem.profit += rawCraftAddition
                        console.log(rawCraftAddition)
                    }
                    if (startingBid >= 1000000) {
                        profitItem.profit += (lbin - startingBid)
                            - (lbin * 0.02);
                        profitItem.percentProfit = (((lbin - startingBid)
                            - (lbin * 0.02)) / startingBid) * 100;
                    } else {
                        profitItem.profit += (lbin - startingBid)
                            - (lbin * 0.01);
                        profitItem.percentProfit = (((lbin - startingBid)
                            - (lbin * 0.01)) / startingBid) * 100;
                    }
                    if (profitItem.profit > minProfit && profitItem.percentProfit > minPercentProfit) {
                        prettyItem.auctionData.profit = profitItem.profit
                        profits.push(prettyItem)
                        ignoredCopy.push(uuid)
                    }
                }
            }
        }
    }
    parentPort.postMessage(ignoredCopy)
    parentPort.postMessage(profits)
}

doTask()
