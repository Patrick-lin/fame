import fakerStatic from 'faker';
import { oneOf } from '../util';

const titles = [
  'Save the princess',
  'Kill the dragon',
  'Avenge the soldiers',
  'Find the unicorn',
  'Kill the unicorn',
  'Hmm ?',
  'I need a servant',
  '...',
  'Retrieve the cat',
  'I hate ninja',
  'He is too loud',
  'Dood',
  'Marine Lepen',
  'Slaughter the orcs',
  'Something\'s stuck...',
  'Kill the king',
  'Aye aye',
  'Give him a lesson',
  'Make a potion',
  'Kill 5 goblins',
  'Kill 20 slimes',
  'Find 2 dragon tooth',
  'Destroy the goblins camp',
  'Find herbs',
  'Clean the toilet',
  'Bring me some food',
  'Clean my house',
  'Need a dogsitter',
  'Need a babysitter',
  'Do my homework',
  'Looking for panties',
  'Watch guard',
  'Explore a dungeon',
  'I think my wife is cheating on me',
  'Rebuild the destroyed houses',
  'Find the Restless Puzzle Book',
];

export const randomQuestTitle = () => {
  if (Math.random() < 0.2) {
    return fakerStatic.lorem.sentence(4);
  }
  return oneOf(titles);  
};