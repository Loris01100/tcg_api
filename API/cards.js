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
            let cards = JSON.parse(cardData);
            let booster = [];
            let collection = users[userIndex].collection || [];

            for (let i = 0; i < 5; i++) {
                const card = getRandomCardByRarity(cards);
                booster.push(card);

                let found = collection.find(c => c.id === card.id);
                if (found) {
                    found.nb += 1;
                } else {
                    collection.push({ id: card.id, nb: 1 });
                }
            }

            users[userIndex].collection = collection;
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

function ConvertCards(req, res) {
    const { token, cardId } = req.body;

    fs.readFile(usersPath, 'utf8', (err, userData) => {
        let users = JSON.parse(userData || '[]');
        let user = users.find(u => u.token === token);
        if (!user) return res.status(401).json({ message: "Token invalide" });

        let collection = user.collection || [];
        let cardEntry = collection.find(c => c.id === cardId);
        if (!cardEntry || cardEntry.nb < 2) {
            return res.status(400).json({ message: "Cette carte ne peut pas être convertie" });
        }

        fs.readFile(cardsPath, 'utf8', (err, cardData) => {
            let cards = JSON.parse(cardData || '[]');
            let card = cards.find(c => c.id === cardId);
            if (!card) return res.status(404).json({ message: "Carte introuvable" });

            const gain = {
                common: 5,
                rare: 25,
                legendary: 150
            };

            // Mise à jour
            cardEntry.nb -= 1;
            user.currency += gain[card.rarity] || 0;

            fs.writeFile(usersPath, JSON.stringify(users, null, 2), 'utf8', () => {
                res.status(200).json({
                    message: "Carte convertie avec succès",
                    currency: user.currency
                });
            });
        });
    });
}



export { OpenBooster, GetAllCards, ConvertCards };
