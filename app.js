import express from 'express';
import { RegisterUser, Login } from './users.js';


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.json({
        message: "Bienvenue sur l'API TCG",
        data: {}
    });
});

app.post('/register', RegisterUser);

app.post('/login', Login);

app.listen(3000, () => {
    console.log("Serveur démarré sur http://localhost:3000");
});
