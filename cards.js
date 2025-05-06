import fs from 'fs';
import path from 'path';

const cardsPath = path.resolve('data/cards.json');
const usersPath = path.resolve('data/users.json');

const rarityChances = {
    Common: 80,
    Rare: 15,
    Legendary: 5
};

function getRandomCardByRarity(cards) {
    const rand = Math.random() * 100;
    let cumulative = 0;

    for (const [rarity, chance] of Object.entries(rarityChances)) {
        cumulative += chance;
        if (rand < cumulative) {
            const filtrer = cards.filter(card => card.rarity === rarity);
            if (filtrer.length > 0) {
                return filtrer[Math.floor(Math.random() * filtrer.length)];
            }
        }
    }

    return cards[Math.floor(Math.random() * cards.length)];
}

function OpenBooster(req, res) {
    const token = req.body.token;

    fs.readFile(usersPath, 'utf8', (err, userData) => {
        let users;
        users = JSON.parse(userData);

        const userIndex = users.findIndex(u => u.token === token);

        const now = Date.now();
        const lastBooster = users[userIndex].lastBooster || 0;
        const delay = 5 * 60 * 1000;  //5 minutes entre chaque booster possible

        if (now - lastBooster < delay) {
            const tempRestant = Math.ceil((delay - (now - lastBooster)) / 1000);
            return res.status(429).json({ message: ` ${tempRestant} avant l'ouverture d'un nouveau booster` });
        }

        fs.readFile(cardsPath, 'utf8', (err, cardData) => {
            let cards;
            cards = JSON.parse(cardData);

            const booster = [];
            for (let i = 0; i < 5; i++) {
                const card = getRandomCardByRarity(cards);
                booster.push(card);
                users[userIndex].collection.push(card);
            }

            users[userIndex].lastBooster = now;

            fs.writeFile(usersPath, JSON.stringify(users, null, 2), 'utf8', (err) => {
                if (err) {
                    return res.status(500).json({ message: "Erreur enregistrement collection" });
                }

                res.status(200).json({
                    message: "Booster ouvert avec succès",
                    booster
                });
            });
        });
    });
}

export { OpenBooster };
