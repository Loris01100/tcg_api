import app from "express/lib/application";
import * as express from "express";

app.get("/", (req, res) => {
    res.json(
        {
            message : "Bienvenue sur l'API TCG",
            data : {}
        }
    );
});

app.use(express.urlencoded({ extended: true }));
