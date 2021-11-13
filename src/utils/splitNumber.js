function splitNumber (num = 1, parts = 1) {
    let n = Math.floor(num / parts);
    const arr = [];
    for (let i = 0; i < parts; i++){
        arr.push(n)
    }
    if(arr.reduce((a, b)=> a + b,0) === num){
        return arr;
    }
    for(let i = 0; i < parts; i++){
        arr[i]++;
        if(arr.reduce((a, b) => a + b, 0) === num){
            return arr;
        }
    }
}
module.exports = {
    splitNumber
}