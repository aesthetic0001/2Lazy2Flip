const axios = require("axios")
const config = require("./config.json")
const discord = require('discord.js')
const {Worker} = require("worker_threads")
const {asyncInterval} = require("./src/utils/asyncUtils")
const notifier = require("node-notifier")
const clipboard = require('copy-paste');
let webhook
let threadsToUse = config.nec["threadsToUse/speed"]
let itemDatas = {}
let lastUpdated = 0
let doneWorkers = 0
let startingTime
const workers = []
const currencyFormat = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'})

const cachedBzData = {
    "RECOMBOBULATOR_3000": 0,
    "HOT_POTATO_BOOK": 0,
    "FUMING_POTATO_BOOK": 0
}

async function initialize() {
    if (config.webhook.useWebhook) {
        webhook = new discord.WebhookClient(config.webhook.discordWebhookID, config.webhook.discordWebhookToken);
    }
    if (config.notifications.startAlert) {
        notifier.notify({
            title: '2Lazy2Flip',
            message: "I'm alive!",
            icon: './src/imgs/nec.jpeg'
        })
    }

    await getBzData()
    await getMoulberry()
    await getLBINs()

    // create the worker threads
    for (let j = 0; j < threadsToUse; j++) {
        workers[j] = new Worker("./necWorker.js", {
            workerData: {
                itemDatas: itemDatas,
                bazaarData: cachedBzData,
                workerNumber: j
            }
        })

        workers[j].on("message", (result) => {
            if (result.itemData !== undefined) {
                if (config.webhook.useWebhook) {
                    webhook.send(`/viewauction ${result.auctionData.auctionID}`, {
                        username: config.webhook.webhookName,
                        avatarURL: config.webhook.webhookPFP,
                        embeds: [new discord.MessageEmbed()
                            .setTitle(`I found a flip!`)
                            .setDescription(`${result.itemData.name} was found for ${currencyFormat.format(result.auctionData.price)}`)
                            .setColor("#f65575")
                            .setThumbnail(`https://sky.shiiyu.moe/item/${result.itemData.id}`)
                            .addField("Auction", `/viewauction ${result.auctionData.auctionID}`, true)
                            .addField("Item LBIN", `${currencyFormat.format(result.auctionData.lbin)}`, true)
                            .addField("Expected profit", `${currencyFormat.format(result.auctionData.profit)}`)
                            .setTimestamp()]
                    });
                }
                if (config.notifications.alertFlips) {
                    notifier.notify({
                        title: '2Lazy2Flip',
                        message: `${result.itemData.name} was found for ${currencyFormat.format(result.auctionData.profit)} profit!`,
                        icon: './src/imgs/nec.jpeg',
                        actions: ['Copy', 'Ignore']
                    })
                    notifier.once('timeout', () => {
                        notifier.removeAllListeners()
                    });
                    notifier.once('dismissed', () => {
                        notifier.removeAllListeners()
                    });
                    notifier.once('copy', () => {
                        notifier.removeAllListeners()
                        clipboard.copy(`/viewauction ${result.auctionData.auctionID}`);
                    });
                    notifier.once('ignore', () => {
                        notifier.removeAllListeners()
                    });
                }
            } else if (result === "finished") {
                doneWorkers++
                if (doneWorkers === threadsToUse) {
                    doneWorkers = 0
                    console.log(`[Main thread]: All done ${(Date.now() - startingTime) / 1000} seconds`)
                    startingTime = 0
                    workers[0].emit("done")
                }
            }
        });
    }

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
                startingTime = Date.now()
                console.log("Requested for new flips...")
                workers.forEach((worker) => {
                    worker.postMessage(totalPages)
                })
                workers[0].once("done", () => {
                    resolve()
                })
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