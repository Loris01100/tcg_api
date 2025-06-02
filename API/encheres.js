import { User, Card, Collection, Enchere } from './Models/Association.js';
import {Op} from "sequelize";

//création d'enchère pour pouvoir vendre une carte
export async function CreateEnchere(req, res) {
    let { token, cardId } = req.body;

    try {
        //vérification du token
        let user = await User.findOne({ where: { token } });
        if (!user) return res.status(401).json({ message: "Token invalide" });

        //vérification de l'existence de la carte
        let card = await Card.findByPk(cardId);
        if (!card) return res.status(404).json({ message: "Carte introuvable" });

        //vérification de la possession de la carte
        let entry = await Collection.findOne({ where: { UserId: user.id, CardId: cardId } });
        if (!entry || entry.nb < 1)
            return res.status(400).json({ message: "la carte n'est pas en votre possession" });

        //pour retirer la carte de la collection de l'utilisateur
        entry.nb -= 1;
        await entry.save();

        //durée de l'enchère
        let endDate = new Date(Date.now() + 5 * 60 * 1000);

        let enchere = await Enchere.create({
            CardId: cardId,
            sellerId: user.id,
            end_date: endDate
        });

        res.status(201).json({ message: "Enchère créée", enchere });
    } catch (e) {
        console.error("Erreur lors de la création de l' enchère :", e);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

//permet de placer une enchère sur une carte
export async function PlaceBid(req, res) {
    let { token, enchereId, bid } = req.body;

    try {
        //vérifie l'utilisateur et récupère l'enchère
        let user = await User.findOne({ where: { token } });
        let enchere = await Enchere.findByPk(enchereId, { include: ['seller', 'bidder', Card] });

        //vérification | Gestion d'erreur
        if (!user || !enchere) return res.status(404).json({ message: "Utilisateur ou enchère introuvable" });
        if (enchere.sellerId === user.id) return res.status(403).json({ message: "Vous ne pouvez pas enchérir sur votre propre enchère" });
        if (enchere.end_date < new Date()) return res.status(410).json({ message: "Enchère expirée" });
        if (bid <= enchere.bid) return res.status(400).json({ message: "Montant trop faible" });
        if (user.currency < bid) return res.status(402).json({ message: "Fonds insuffisants" });

        //pour rembourser l' ancien enchérisseur
        if (enchere.bidderId) {
            let prev = await User.findByPk(enchere.bidderId);
            prev.currency += enchere.bid;
            await prev.save();
        }

        //on enlève l'argent à l'enchérisseur le plus élevé
        user.currency -= bid;
        await user.save();

        //mise à jour de l'enchère
        enchere.bid = bid;
        enchere.bidderId = user.id;
        await enchere.save();

        res.status(200).json({ message: "Enchère placée" });
    } catch (e) {
        console.error("Erreur enchère :", e);
        res.status(500).json({ message: "Erreur côté serveur" });
    }
}

//récupère toutes les enchères
export async function GetEncheres(req, res) {
    try {
        const now = new Date();

        // Récupère et clôture toutes les enchères expirées                         Opérateur less than
        //                                                                          si la date est inférieure alors
        //on cloture toutes les enchères expirés
        const expired = await Enchere.findAll({ where: { end_date: { [Op.lt]: now } } });
        for (let enchere of expired) {
            await CloseEnchere({ body: { token: null, enchereId: enchere.id } }, { status: () => ({ json: () => {} }) });
        }

        // Récupère les enchères valides
        //on récupère toutes les enchères en cours
        const encheres = await Enchere.findAll({
                                //opérateur greater than
                                //si la date est supérieure alors
            where: { end_date: { [Op.gt]: now } },
            include: [Card]
        });

        res.status(200).json({ message: "Liste des enchères", encheres });
    } catch (e) {
        console.error("Erreur get enchères :", e);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

//clôture les enchère dès que le délai expire
export async function CloseEnchere(req, res) {
    let { token, enchereId } = req.body;

    try {
        let user = await User.findOne({ where: { token } });
        let enchere = await Enchere.findByPk(enchereId);

        //vérification | Gestion des erreurs
        if (!user || !enchere) return res.status(404).json({ message: "Introuvable" });
        if (enchere.end_date > new Date()) return res.status(400).json({ message: "Enchère non terminée" });
        if (user.id !== enchere.sellerId && user.id !== enchere.bidderId)
            return res.status(403).json({ message: "Vous n'êtes pas autorisé à clôturer cette enchère" });

        //pour ajouter la carte obtenu au meilleur enchérisseur
        if (enchere.bidderId) {
            let entry = await Collection.findOrCreate({
                where: { UserId: enchere.bidderId, CardId: enchere.CardId },
                defaults: { nb: 1 }
            });
            if (!entry[1]) {
                entry[0].nb += 1;
                await entry[0].save();
            }

            //donner l'argent au vendeur
            let seller = await User.findByPk(enchere.sellerId);
            seller.currency += enchere.bid;
            await seller.save();
        } else {
            //si personne n'enrichit alors la carte est revient de nouveau à celui qui à placer l'enchère
            let entry = await Collection.findOrCreate({
                where: { UserId: enchere.sellerId, CardId: enchere.CardId },
                defaults: { nb: 1 }
            });
            if (!entry[1]) {
                entry[0].nb += 1;
                await entry[0].save();
            }
        }

        //supprime l'enchère en base de données une fois terminé
        await enchere.destroy();
        res.status(200).json({ message: "Enchère clôturée" });
    } catch (e) {
        console.error("Erreur clôture :", e);
        res.status(500).json({ message: "Erreur serveur" });
    }
}