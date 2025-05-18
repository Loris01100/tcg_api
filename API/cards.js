import fs from 'fs';
import path from 'path';

let cardsPath = path.resolve('data/cards.json');
let usersPath = path.resolve('data/users.json');

function getRandomCardByRarity(cards) {
    let rand = Math.random() * 151;

    let rarity;
    if (rand < 5) {
        rarity = 'legendary';
    } else if (rand < 15) {
        rarity = 'rare';
    } else {
        rarity = 'common';
    }

    let filtreCarte = cards.filter(card => card.rarity === rarity);
    if (filtreCarte.length === 0) return null;

    let randomIndex = Math.floor(Math.random() * filtreCarte.length);
    return filtreCarte[randomIndex];
}


function OpenBooster(req, res) {
    let token = req.body.token;

    fs.readFile(usersPath, 'utf8', (err, userData) => {
        let users;
        users = JSON.parse(userData);

        let userIndex = users.findIndex(u => u.token === token);
        let now = Date.now();
        let lastBooster = users[userIndex].lastBooster || 0;
        let delay = 5 * 60 * 1000;  //5 minutes entre chaque booster possible

        if (now - lastBooster < delay) {
            const tempRestant = Math.ceil((delay - (now - lastBooster)) / 1000);
            return res.status(429).json({ message: ` ${tempRestant} secondes avant l'ouverture d'un nouveau booster` });
        }

        fs.readFile(cardsPath, 'utf8', (err, cardData) => {
            let cards;
            cards = JSON.parse(cardData);

            let booster = [];
            for (let i = 0; i < 5; i++) {
                const card = getRandomCardByRarity(cards);
                booster.push(card);
                users[userIndex].collection.push(card);
            }

            users[userIndex].lastBooster = now;

            fs.writeFile(usersPath, JSON.stringify(users, null, 2), 'utf8', (err) => {
                    res.status(200).json({
                    message: "Booster ouvert avec succès",
                    booster
                });
            });
        });
    });
}
function GetAllCards(req, res) {
    let token = req.query.token;

    fs.readFile(cardsPath, 'utf8', (err, data) => {

        let cards = JSON.parse(data || '[]');

        res.status(200).json({
            message: "Cartes disponibles",
            data: cards
        });
    });
}




export { OpenBooster, GetAllCards };
