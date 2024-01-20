import TroopType from './TroopType.js';

export default class TroopConfig {
  static readonly troops: Array<TroopType> = [
    new TroopType(10, 2, 'punk'),
    new TroopType(20, 4, 'cyborg'),
    new TroopType(15, 6, 'drone'),
  ];
}
