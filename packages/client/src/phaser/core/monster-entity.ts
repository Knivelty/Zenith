

export class MonsterEntity {
  id: number;
  owner: boolean;
  hp: number;
  life: number;
  x: number;
  y: number;


  constructor(id: number, owner: boolean, hp: number, x: number, y: number) {
      this.id = id;
      this.owner = owner;
      this.hp = hp;
      this.x = x;
      this.y = y;
      this.life = hp;
  }

  
  update(hp: number, x: number, y: number) {
      this.hp = hp;
      this.x = x;
      this.y = y;
  }
}