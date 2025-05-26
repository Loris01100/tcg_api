import User from './User.js';
import Card from './Card.js';
import Collection from './Collection.js';
import Enchere from './Enchere.js';

//relation collection
User.belongsToMany(Card, { through: Collection });
Card.belongsToMany(User, { through: Collection });

//relation enchère
Enchere.belongsTo(User, { as: 'seller' });
Enchere.belongsTo(User, { as: 'bidder' });
Enchere.belongsTo(Card);

export { User, Card, Collection, Enchere  };
