let currentAsyncIntervals = {}

async function asyncInterval(asyncTask, intervalname, timeout) {
    currentAsyncIntervals[intervalname] = true
    setTimeout(async function () {
        if (!currentAsyncIntervals[intervalname]) return
        asyncTask().then(async function () {
            await asyncInterval(asyncTask, intervalname, timeout)
        })
    }, timeout)
}

function stopAsyncInterval(intervalname) {
    currentAsyncIntervals[intervalname] = false
}

function currentIntervals() {
    return currentAsyncIntervals
}

module.exports = {
    asyncInterval,
    stopAsyncInterval,
    currentIntervals
}