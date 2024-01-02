const transformCoordinate=(x: number, y: number) =>{
  if (y === 0) {
    return [28 * 24 + 96 * x, 808]
  } else {
    return [28 * 24 + 96 * x, 760 - 96 * y]
  }
}


export default class BoardManager {
  monsters: Map<string, monster>; 
  scene: GameScene; 

  constructor(scene: GameScene) {
      this.monsters = new Map<string, monster>();
      this.scene = scene;
      this.renderBoard();
  }

  addMonsterSprite(monster: Imonster): monster {
      if (this.monsters.has(monster.id)) {
          return this.monsters.get(monster.id)!;
      }

      const coordinates = transformCoordinate(monster.positionX, monster.positionY);
      const monsterSprite = new Monster(
          this.scene,
          coordinates[0],
          coordinates[1],
          monster
      );

      this.monsters.set(monsterSprite.id, monsterSprite);
      return monsterSprite;
  }

  
  changeMonster(monster: Imonster, field: string, value: any) {
      const monsterUI = this.monsters.get(monster.id);
      let coordinates: number[];
      if (monsterUI) {
        switch (field) {
          case "positionX":
            monsterUI.positionX = value
            monsterUI.positionY = monster.positionY
            coordinates = transformCoordinate(
              monster.positionX,
              monster.positionY
            )
            monsterUI.x = coordinates[0]
            monsterUI.y = coordinates[1]
            break
  
          case "positionY":
            monsterUI.positionY = value
            monsterUI.positionX = monster.positionX
            coordinates = transformCoordinate(
              monster.positionX,
              monster.positionY
            )
            monsterUI.x = coordinates[0]
            monsterUI.y = coordinates[1]
            if (monsterUI.positionY != 0 && this.mode == "battle") {
              monsterUI.destroy()
              this.monsters.delete(monsterUI.id)
            }
            break
  
          case "action":
            this.animationManager.animatemonster(monsterUI, value, false)
            break
  
          default:
            monsterUI[field] = value
            break
        }
      }
  }

  renderBoard() {
      
  }
}
