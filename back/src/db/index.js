import DataStore from 'nedb';
import util from 'util';
import Redis from 'ioredis';

import { DB_DIR_PATH } from '../constants';

const promisify = (db) => {
  db.persistence.setAutocompactionInterval(5 * 60 * 1000);
  db.pfindOne = util.promisify(db.findOne);
  db.pfind = util.promisify(db.find);
  db.pinsert = util.promisify(db.insert);
  db.pupdate = util.promisify(db.update);
  db.premove = util.promisify(db.remove); 
  return db;
};

export const Games = promisify(new DataStore({ filename: `${DB_DIR_PATH}/games.db`, autoload: true }));
export const Heroes = promisify(new DataStore({ filename: `${DB_DIR_PATH}/heroes.db`, autoload: true }));
export const Quests = promisify(new DataStore({ filename: `${DB_DIR_PATH}/quests.db`, autoload: true }));
export const Players = promisify(new DataStore({ filename: `${DB_DIR_PATH}/players.db`, autoload: true }));
export const Weapons = promisify(new DataStore({ filename: `${DB_DIR_PATH}/weapons.db`, autoload: true }));
