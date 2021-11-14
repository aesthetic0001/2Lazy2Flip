const axios = require("axios");
const {getParsed} = require("./src/utils/parseB64");
const {parentPort, workerData} = require("worker_threads");
const config = require("./config.json")
let minProfit = config.nec.minCoinProfit
let minPercentProfit = config.nec["min%Profit"]
const ignoreTalismans = true
const ignoreNoSales = config.nec.ignoreIfNoSales

function ProfitItem(ahID, profit, sales, percentProfit, auctioneer, itemID) {
    this.auctionID = ahID
    this.profit = profit
    this.sales = sales
    this.percentProfit = percentProfit
    this.auctioneer = auctioneer
    this.itemID = itemID
}

let profits = []

async function doTask() {
    console.log("Starting work on " + workerData.pageToStartOn)
    let ignoredCopy = workerData.ignored.slice()
    for (let i = workerData.pageToStartOn; i < workerData.pagesToProcess + 1; i++) {
        const auctionPage = await axios.get(`https://api.hypixel.net/skyblock/auctions?page=${i}`)
        for (const auction of auctionPage.data.auctions) {
            if (!auction.bin) continue
            const auctioneer = auction.auctioneer
            const uuid = auction.uuid
            const item = await getParsed(auction.item_bytes)
            const itemID = item["i"][0].tag.ExtraAttributes.id
            let startingBid = auction.starting_bid
            let profitItem = new ProfitItem()
            const itemData = workerData.itemDatas[itemID]
            if (!itemData) continue
            const lbin = itemData.lbin
            const sales = itemData.sales
            // is the percentage difference in average cleanprice and current lbin greater than 50%?
            const unstableOrMarketManipulated = (lbin - itemData.cleanPrice) / lbin > config.nec["maxAvg/LbinDiff"]

            if (ignoredCopy.includes(uuid)) {
                console.log("In ignored list")
                continue
            }

            if (!config.nec.ignoreCategories[auction.category] || unstableOrMarketManipulated || item.sales === 0 && ignoreNoSales) continue

            if (!nameFilter.find((name) => itemID.includes(name))) {
                if (lbin - auction.starting_bid > minProfit) {
                    if (startingBid >= 1000000) {
                        profitItem.profit = (lbin - startingBid)
                            - (lbin * 0.02);
                        profitItem.percentProfit = (((lbin - startingBid)
                            - (lbin * 0.02)) / startingBid) * 100;
                    } else {
                        profitItem.profit = (lbin - startingBid)
                            - (lbin * 0.01);
                        profitItem.percentProfit = (((lbin - startingBid)
                            - (lbin * 0.01)) / startingBid) * 100;
                    }
                    if (profitItem.profit > minProfit && profitItem.percentProfit > minPercentProfit) {
                        profitItem.auctioneer = auctioneer
                        profitItem.currentPrice = auction.starting_bid
                        profitItem.lbin = itemData.lbin
                        profitItem.sales = sales
                        profitItem.auctionID = uuid
                        profitItem.itemID = itemID
                        profits.push(profitItem)
                        ignoredCopy.push(uuid)
                    }
                }
            }
        }
    }
    console.log("Done work on " + workerData.pageToStartOn)
    parentPort.postMessage(ignoredCopy)
    parentPort.postMessage(profits)
}

doTask()
