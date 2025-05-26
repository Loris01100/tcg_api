import { DataTypes } from 'sequelize';
import bdd from '../db.js';

const Collection = bdd.define('Collection', {
    nb: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    }
}, {
    timestamps: true
});

export default Collection;
