const axios = require("axios")
const config = require("./config.json")
const discord = require('discord.js')
const webhook = new discord.WebhookClient(config.webhook.discordWebhookID, config.webhook.discordWebhookToken);
const {splitNumber} = require("./src/utils/splitNumber")
const {Worker} = require("worker_threads")
const {asyncInterval} = require("./src/utils/asyncUtils")
const os = require("os")
const totalThreads = os.cpus().length
let threadsToUse = config.nec["threadsToUse/speed"]
let itemDatas = {}
let lastUpdated = 0
let receivedMsgs = 0
const workers = []
const ignoredAuctionIDs = []
const currencyFormat = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'})

const cachedBzData = {
    "RECOMBOBULATOR_3000": 0,
    "HOT_POTATO_BOOK": 0,
    "FUMING_POTATO_BOOK": 0
}

async function initialize() {
    if (threadsToUse > totalThreads) {
        return console.log("[ERR] Too many threads specified! You don't have this many available!")
    } else if (threadsToUse > Math.round(totalThreads / 2)) {
        console.log("[WARN] You're allocating more than 1/2 of your threads to this process... This is not recommended.")
    }
    await getBzData()
    await getMoulberry()
    await getLBINs()
    await webhook.send(`[NEC] Flipper On`, {
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
                            ignored: ignoredAuctionIDs,
                            bazaarData: cachedBzData
                        }
                    })
                    workers[j].on("message", result => {
                        if (result[0] === "prof") {
                            result.splice(0, 1)
                            if (result[0]) {
                                result.forEach((flip) => {
                                    console.log(flip, "FLIP")
                                    if (typeof flip === "string") return
                                    webhook.send(`${flip.itemData.name ? flip.itemData.name : flip.itemData.id} going for ${currencyFormat.format(flip.auctionData.price)} when LBIN is ${currencyFormat.format(flip.auctionData.lbin)}\n\`${flip.auctionData.sales} sales per day\`\n\`Estimated profit: ${currencyFormat.format(flip.auctionData.profit)}\`\n\`/viewauction ${flip.auctionData.auctionID}\``, {
                                        username: config.webhook.webhookName,
                                        avatarURL: config.webhook.webhookPFP
                                    });
                                })
                            }
                            console.log("No flips")
                            receivedMsgs++
                            if (receivedMsgs === threadsToUse) {
                                receivedMsgs = 0
                                resolve()
                            }
                        } else {
                            console.log(ignoredAuctionIDs)
                            ignoredAuctionIDs.push(...result)
                        }
                    });
                }
            }
        })
    }, "check", 0)
}

async function getLBINs() {
    const lbins = await axios.get("https://moulberry.codes/lowestbin.json")
    const lbinData = lbins.data
    for (const item of Object.keys(lbinData)) {
        if (!itemDatas[item]) itemDatas[item] = {}
        itemDatas[item].lbin = lbinData[item]
    }
}

async function getMoulberry() {
    const moulberryAvgs = await axios.get("https://moulberry.codes/auction_averages/3day.json")
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
}

async function getBzData() {
    const bzData = await axios.get("https://api.hypixel.net/skyblock/bazaar")
    cachedBzData["RECOMBOBULATOR_3000"] = bzData.data.products.RECOMBOBULATOR_3000.quick_status.buyPrice
    cachedBzData["HOT_POTATO_BOOK"] = bzData.data.products.HOT_POTATO_BOOK.quick_status.buyPrice
    cachedBzData["FUMING_POTATO_BOOK"] = bzData.data.products.FUMING_POTATO_BOOK.quick_status.buyPrice
}


initialize()