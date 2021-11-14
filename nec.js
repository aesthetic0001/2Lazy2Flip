const axios = require("axios")
const config = require("./config.json")
const discord = require('discord.js')
const webhook = new discord.WebhookClient(config.webhook.discordWebhookID, config.webhook.discordWebhookToken);
const {splitNumber} = require("./src/utils/splitNumber")
const {Worker} = require("worker_threads")
const {asyncInterval} = require("./src/utils/asyncUtils")
const {Item} = require("./src/constructors/Item")
let threadsToUse = config.threadsToUse
let itemDatas = {}
let lastUpdated = 0
let receivedMsgs = 0
const workers = []
const ignoredAuctionIDs = []
const currencyFormat = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'})

async function initialize() {
    await getMoulberry()
    await getLBINs()
    await webhook.send(`Hewwo. I am alive now!`, {
        username: config.webhook.webhookName,
        avatarURL: config.webhook.webhookPFP
    });
    // refresh LBINS and avgs every 1 mins
    asyncInterval(async () => {
        await getMoulberry()
        await getLBINs()
    }, "moulberry", 60000)

    asyncInterval(async () => {
        return new Promise(async (resolve) => {
            const ahFirstPage = await axios.get("https://api.hypixel.net/skyblock/auctions?page=0")
            const totalPages = ahFirstPage.data.totalPages
            if (ahFirstPage.data.lastUpdated === lastUpdated) {
                resolve()
            } else {
                lastUpdated = ahFirstPage.data.lastUpdated
                const pagePerThread = splitNumber(totalPages, threadsToUse)

                for (let j = 0; j < threadsToUse; j++) {
                    let startingPage = 0

                    if (j !== 0 && startingPage === 0) {
                        const clonedStarting = pagePerThread.slice()
                        clonedStarting.splice(j, 9999);
                        clonedStarting.forEach((pagePer) => {
                            startingPage += pagePer
                        })
                    }

                    workers[j] = new Worker("./necWorker.js", {
                        workerData: {
                            pagesToProcess: pagePerThread[j],
                            pageToStartOn: startingPage,
                            itemDatas: itemDatas,
                            ignored: ignoredAuctionIDs
                        }
                    })
                    workers[j].on("message", result => {
                        if (result[0]) {
                            if (typeof result[0] === "object") {
                                result.forEach((flip) => {
                                    webhook.send(`${flip.itemID} going for ${currencyFormat.format(flip.currentPrice)} when LBIN is ${currencyFormat.format(flip.lbin)}\n\`${flip.sales} sales per day\`\n\`Estimated profit: ${currencyFormat.format(flip.profit)}\`\n\`/viewauction ${flip.auctionID}\``, {
                                        username: config.webhook.webhookName,
                                        avatarURL: config.webhook.webhookPFP
                                    });
                                })
                                receivedMsgs++
                                if (receivedMsgs === threadsToUse) {
                                    receivedMsgs = 0
                                    resolve()
                                }
                            } else if (result[0]) {
                                ignoredAuctionIDs.push(...result)
                            }

                        }
                    });
                }
            }
        })
    }, "check", 0)
}

async function getLBINs() {
    console.log("GETTING LBIN")
    const lbins = await axios.get("https://moulberry.codes/lowestbin.json")
    const lbinData = lbins.data
    for (const item of Object.keys(lbinData)) {
        if (!itemDatas[item]) itemDatas[item] = {}
        itemDatas[item].lbin = lbinData[item]
    }
    console.log("Got LBINs")
}

async function getMoulberry() {
    console.log("GETTING AVGS")
    const moulberryAvgs = await axios.get("https://moulberry.codes/auction_averages/2day.json")
    const avgData = moulberryAvgs.data
    for (const item of Object.keys(avgData)) {
        itemDatas[item] = {}
        const itemInfo = avgData[item]
        if (itemInfo.sales !== undefined) {
            itemDatas[item].sales = itemInfo.sales
        } else {
            itemDatas[item].sales = 0
        }
        if (itemInfo.clean_price) {
            itemDatas[item].cleanPrice = itemInfo.clean_price
        } else {
            itemDatas[item].cleanPrice = itemInfo.price
        }
    }
    console.log("Got avgs")
}

initialize()