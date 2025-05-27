import { User, Card, Collection } from './Models/Association.js';

function getRandomCardByRarity(cards, rarity) {
    let filtered = cards.filter(card => card.rarity === rarity);
    if (filtered.length === 0) return null;
    let index = Math.floor(Math.random() * filtered.length);
    return filtered[index];
}

function tirageAleatoireRarity() {
    let rand = Math.random() * 100;
    if (rand < 5) return 'legendary';
    else if (rand < 15) return 'rare';
    else return 'common';
}


export async function OpenBooster(req, res) {
    let { token } = req.body;

    try {
        let user = await User.findOne({ where: { token } });
        if (!user) return res.status(401).json({ message: "Token invalide" });

        let now = Date.now();
        let delay = 0; //à remodifier pour mettre 5 minutes
        if (now - user.lastBooster < delay) {
            let restant = Math.ceil((delay - (now - user.lastBooster)) / 1000);
            return res.status(429).json({ message: `Il reste encore ${restant}s` });
        }

        let allCards = await Card.findAll();
        let booster = [];

        for (let i = 0; i < 5; i++) {
            let rarity = tirageAleatoireRarity();
            let card = getRandomCardByRarity(allCards, rarity);
            if (card) booster.push(card);
        }

        for (let card of booster) {
            let [entry, created] = await Collection.findOrCreate({
                where: { UserId: user.id, CardId: card.id },
                defaults: { nb: 1 }
            });

            if (!created) {
                entry.nb += 1;
                await entry.save();
            }
        }

        user.lastBooster = now;
        await user.save();

        res.status(200).json({
            message: "Ouverture du booster valide",
            booster
        });

    } catch (err) {
        console.error("Erreur booster :", err);
        res.status(500).json({ message: "Erreur côté serveur" });
    }
}
export async function GetAllCards(req, res) {
    try {
        let cards = await Card.findAll();
        res.status(200).json({
            message: "Cartes disponibles",
            data: cards
        });
    } catch (err) {
        console.error("Erreur :", err);
        res.status(500).json({ message: "Erreur côté serveur" });
    }
}

export async function ConvertCards(req, res) {
    let { token, cardId } = req.body;

    try {
        let user = await User.findOne({ where: { token } });
        if (!user) return res.status(401).json({ message: "Token invalide" });

        let card = await Card.findByPk(cardId);
        if (!card) return res.status(404).json({ message: "Carte introuvable" });

        let entry = await Collection.findOne({
            where: { UserId: user.id, CardId: card.id }
        });

        if (!entry || entry.nb < 2) {
            return res.status(400).json({ message: "Cette carte ne peut pas être convertie" });
        }

        //le coût d'une carte en fonction de sa rareté
        const gain = {
            common: 5,
            rare: 25,
            legendary: 150
        };

        entry.nb -= 1;
        await entry.save();

        user.currency += gain[card.rarity] || 0;
        await user.save();

        res.status(200).json({
            message: "Carte convertie avec succès",
            currency: user.currency
        });

    } catch (err) {
        console.error("Erreur ConvertCards :", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

