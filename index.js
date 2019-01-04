
const https = require("https");
const process = require("process");
const nodeHtmlParser = require("node-html-parser");

const rp = require('request-promise');


function getAdjectives(letter){
    const next = String.fromCharCode(letter.charCodeAt(0)+1)
    const url = `https://conjf.cactus2000.de/adject.fr.php?begin=${letter}&end=${next}`;
    console.log(url);
    return rp(url)
    .then((htmlString) =>  {
        const root = nodeHtmlParser.parse(htmlString);
        const adjectives = root.querySelectorAll('a')
            .map(a => {
                const match =  a.rawAttrs.match(/(show_adj\.fr\.php\?adj=)(.*)/);
                return match && match[2];
            }).filter(e => e);
        return adjectives;
    })
    .catch( (err) =>  {
        // Crawling failed...
        console.log(err)
    });
}

function getCheeses(letter){
    return rp('https://www.fromages.com/fr/encyclopedie')
    .then((htmlString) =>  {
        const root = nodeHtmlParser.parse(htmlString);
        const reg = new RegExp("lettre_"+letter.toUpperCase());
        const container = root.querySelectorAll('.lettre_unit')
            .find(div => {
                const child = div.querySelector("div");
                return child && child.rawAttrs.match(reg);
            })
        return container.querySelectorAll("li")
        .map(li => li.rawText.trim())
        .filter(cheese => cheese.length > 2)
    })
    .catch( (err) =>  {
        // Crawling failed...
        console.log(err)
    });
}

function pickRandom(values, number = 10){
    return new Array(number)
    .fill(0)
        .map(zero=> values[Math.floor(Math.random() * values.length)]);
}

const argument = process.argv[2];
if(argument){
    const letter = argument[0];
    Promise.all([
    getCheeses(letter),
    getAdjectives(letter),
]).then(([cheeses, adjectives]) => {
    const smallCheese = pickRandom(cheeses);
    const smallAdjectives = pickRandom(adjectives);
    console.log(smallCheese.map((cheese, i) => cheese + " "+ smallAdjectives[i]))
})
}else{
    console.log("please pass a letter in argument")
}

// getAdjectives("c").then(adjectives => console.log(adjectives));
