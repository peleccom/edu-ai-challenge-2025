// Ship class to encapsulate ship behavior
class Ship {
  constructor(locations) {
    this.locations = locations;
    this.hits = new Array(locations.length).fill('');
  }
  
  isHit(location) {
    return this.locations.includes(location);
  }
  
  hit(location) {
    const index = this.locations.indexOf(location);
    if (index >= 0) {
      this.hits[index] = 'hit';
      return true;
    }
    return false;
  }
  
  isSunk() {
    return this.hits.every(hit => hit === 'hit');
  }
  
  isAlreadyHit(location) {
    const index = this.locations.indexOf(location);
    return index >= 0 && this.hits[index] === 'hit';
  }
}

module.exports = Ship; 