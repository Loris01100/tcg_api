import fs from 'fs';
import crypto from 'crypto';

function RegisterUser(req, res) {
    if (!req.body) {
        res.status(400).json({ "message": "Erreur : Aucune données" });
        return;
    }

    const username = req.body.username;
    const password = req.body.password;

    const filePath = 'data/users.json';
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err && err.code !== 'ENOENT') {
            return res.status(500).json({ "message": "Erreur interne lors de la lecture du fichier" });
        }

        let users = [];
        if (data) {
            users = JSON.parse(data);
        }

        const newUser = {
            id: users.length > 0 ? users[users.length - 1].id + 1 : 1,
            username,
            password,
            collection: []
        };
        users.push(newUser);

        fs.writeFile(filePath, JSON.stringify(users, null, 2), 'utf8', (err) => {
            if (err) {
                return res.status(500).json({ "message": "Erreur lors de l'enregistrement du nouvel utilisateur" });
            }

            res.status(201).json({
                "message": "Utilisateur enregistré avec succès",
                "user": newUser
            });
        });
    });
}

function Login(req, res) {
    if (!req.body || !req.body.username || !req.body.password) {
        return res.status(400).json({ message: "Erreur : données manquantes" });
    }

    const username = req.body.username;
    const password = req.body.password;
    const filePath = 'data/users.json';

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: "Erreur lors de la lecture du fichier utilisateurs" });
        }

        let users = [];
        if (data) {
            try {
                users = JSON.parse(data);
            } catch (e) {
                return res.status(500).json({ message: "Fichier JSON invalide" });
            }
        }

        const userIndex = users.findIndex(u => u.username === username && u.password === password);

        if (userIndex === -1) {
            return res.status(401).json({ message: "Identifiants invalides" });
        }

        const token = crypto.randomBytes(16).toString('hex');

        users[userIndex].token = token;

        fs.writeFile(filePath, JSON.stringify(users, null, 2), 'utf8', (err) => {
            if (err) {
                return res.status(500).json({ message: "Erreur lors de l'enregistrement du token" });
            }

            return res.status(200).json({
                message: "Authentification réussie",
                data: {
                    token: token
                }
            });
        });
    });
}


export { RegisterUser, Login };
