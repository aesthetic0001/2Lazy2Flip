const axios = require("axios");

async function main() {
    const request = await axios.get(`https://sky.shiiyu.moe/api/v2/profile/soakd`)
    const data = request.data
    Object.keys(data).forEach((profileID) => {
        if (data[profileID].current) {

        }
    })
    console.log(data)
}

main()