import TowerType from './TowerType.js';

export default class TowerConfig {
  // TODO: Fetch from network
  static readonly towers = [
    new TowerType(0, 'Common', 'tower1.png', 'tower1_thumbnail.png', 25),
    new TowerType(1, 'Ranger', 'tower2.png', 'tower2_thumbnail.png', 50),
  ];
}
