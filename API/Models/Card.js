import User from "./User.js";

import { DataTypes } from 'sequelize';
import bdd from '../db.js';
//import sequelize from "../db.js";
//await sequelize.sync({ alter: true });

const Card = bdd.define('Card', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    rarity: {
        type: DataTypes.STRING
    }
});

export default Card;