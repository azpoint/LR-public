const chars = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"]
const specials = ['!','$','%','*','(',')','_','-','+','=','/','|','?',"[","]","{","}","@","#",":",";","<",">","^","&"]
const numbers = ["0","1","2","3","4","5","6","7","8","9"]

const lists = [chars, specials, numbers]

function keygen(length) {
    let keyString = []

    for(let i=0; i < length; i++){
        let selList = lists[Math.floor(Math.random() * lists.length)]

        let char = selList[Math.floor(Math.random() * selList.length)]

        keyString.push(char)
    }

    keyString.sort()
    keyString = keyString.join('')
    return keyString
}

module.exports = keygen