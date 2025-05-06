import fs from 'fs';
import crypto from 'crypto';

// Chemin du fichier
const filePath = 'data/users.json';

/**
 * Enregistrement d'un utilisateur
 */
function RegisterUser(req, res) {
    if (!req.body) {
        return res.status(400).json({ message: "Erreur : Aucune donnée envoyée" });
    }

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Erreur : Nom d'utilisateur ou mot de passe manquant" });
    }

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err && err.code !== 'ENOENT') {
            return res.status(500).json({ message: "Erreur interne lors de la lecture du fichier" });
        }

        let users = [];
        if (data) {
            try {
                users = JSON.parse(data);
            } catch {
                return res.status(500).json({ message: "Erreur : Fichier utilisateur corrompu" });
            }
        }

        const existingUser = users.find(u => u.username === username);
        if (existingUser) {
            return res.status(409).json({ message: "Erreur : L'utilisateur existe déjà" });
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
                return res.status(500).json({ message: "Erreur lors de l'enregistrement du nouvel utilisateur" });
            }

            res.status(201).json({
                message: "Utilisateur enregistré avec succès",
                user: { id: newUser.id, username: newUser.username }
            });
        });
    });
}

/**
 * Connexion utilisateur
 */
function Login(req, res) {
    if (!req.body) {
        return res.status(400).json({ message: "Erreur : Aucune donnée envoyée" });
    }

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Erreur : Nom d'utilisateur ou mot de passe manquant" });
    }

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: "Erreur lors de la lecture du fichier utilisateurs" });
        }

        let users = [];
        try {
            users = JSON.parse(data || '[]');
        } catch {
            return res.status(500).json({ message: "Erreur : Fichier utilisateur corrompu" });
        }

        const userIndex = users.findIndex(u => u.username === username && u.password === password);

        if (userIndex === -1) {
            return res.status(401).json({ message: "Erreur : Identifiants invalides" });
        }

        const token = crypto.randomBytes(16).toString('hex');
        users[userIndex].token = token;

        fs.writeFile(filePath, JSON.stringify(users, null, 2), 'utf8', (err) => {
            if (err) {
                return res.status(500).json({ message: "Erreur lors de l'enregistrement du token" });
            }

            return res.status(200).json({
                message: "Authentification réussie",
                data: { token }
            });
        });
    });
}

function GetUser(req, res) {

    const token =
        req.headers['authorization'] ||
        req.query.token ||
        req.body?.token;

    if (!token) {
        return res.status(400).json({ message: "Erreur : Token manquant" });
    }
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: "Erreur lors de la lecture du fichier utilisateurs" });
        }

        let users = [];
        try {
            users = JSON.parse(data || '[]');
        } catch {
            return res.status(500).json({ message: "Erreur : Fichier utilisateur corrompu" });
        }

        let token; // déclaration anticipée
        token =
            req.headers['authorization'] ||
            req.query.token ||
            req.body?.token;

        if (!token) {
            return res.status(400).json({ message: "Erreur : Token manquant" });
        }

        const user = users.find(u => u.token === token);

        if (!user) {
            return res.status(401).json({ message: "Erreur : Token invalide" });
        }

        const { password, token: _, ...safeUser } = user; // évite conflit

        res.status(200).json({
            message: "Utilisateur trouvé",
            data: safeUser
        });
    });

}

/**
 * Déconnexion utilisateur (via token en body)
 */
function DisconnectUser(req, res) {
    const token = req.body.token;

    if (!token) {
        return res.status(400).json({ message: "Erreur : Token manquant (dans body.token)" });
    }

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: "Erreur lors de la lecture du fichier utilisateurs" });
        }

        let users = [];
        try {
            users = JSON.parse(data || '[]');
        } catch {
            return res.status(500).json({ message: "Erreur : Fichier utilisateur corrompu" });
        }

        const userIndex = users.findIndex(u => u.token === token);
        if (userIndex === -1) {
            return res.status(401).json({ message: "Erreur : Token invalide" });
        }

        delete users[userIndex].token;

        fs.writeFile(filePath, JSON.stringify(users, null, 2), 'utf8', (err) => {
            if (err) {
                return res.status(500).json({ message: "Erreur lors de la suppression du token" });
            }

            res.status(200).json({ message: "Déconnexion réussie" });
        });
    });
}

export { RegisterUser, Login, GetUser, DisconnectUser };
