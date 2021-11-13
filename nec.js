const axios = require("axios")
const config = require("./config.json")
const discord = require('discord.js')
const webhook = new discord.WebhookClient(config.discordWebhookID, config.discordWebhookToken);
const {splitNumber} = require("./src/utils/splitNumber")
const {Worker} = require("worker_threads")
const {asyncInterval} = require("./src/utils/asyncUtils")
let threadsToUse = config.threadsToUse
let itemDatas = {}
let lastUpdated = 0
let receivedMsgs = 0
const workers = []

async function initialize() {
    await getMoulberry()
    await getLBINs()
    await asyncInterval(async () => {
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
                            itemDatas: itemDatas
                        }
                    })
                    workers[j].once("message", result => {
                        console.log(result)
                        if (result[0]) {
                            result.forEach((flip) => {
                                webhook.send(`Flip?\n${flip.itemID} going for $${flip.currentPrice} when LBIN is $${flip.lbin}\n\`Estimated profit: $${flip.profit}\`\n\`/viewauction ${flip.auctioneer}\``, {
                                    username: "Flips",
                                    avatarURL: "https://cdn.pixabay.com/photo/2014/11/30/14/11/cat-551554__340.jpg"
                                });
                            })
                        }
                        receivedMsgs++
                        if (receivedMsgs === threadsToUse) {
                            receivedMsgs = 0
                            resolve()
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
}

async function getMoulberry() {
    console.log("GETTING AVGS")
    const moulberryAvgs = await axios.get("https://moulberry.codes/auction_averages/1day.json")
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

initialize()