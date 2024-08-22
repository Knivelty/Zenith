import fs from "fs";
import csv from "csv-parser";
const { execSync } = require("child_process");
import _ from "lodash";

const args = process.argv.slice(2);
const profile = args[0];

const homeJson = fs.readFileSync(
  `./manifests/${profile}/manifest.json`
) as unknown as string;

const homeJsonData = JSON.parse(homeJson);

const address = homeJsonData["contracts"][0]["address"];

function initializeCreatureProfile() {
  let callData: string[] = [];
  fs.createReadStream("../data/heroes.csv")
    .pipe(csv())
    .on("data", (row) => {
      const creature_index = numberToHexString(Number(row["ID"]), 4);
      const level = numberToHexString(Number(row["Level"]), 2);
      const rarity = numberToHexString(Number(row["Rarity"]), 2);
      const health = numberToHexString(Number(row["Health"]), 4);
      const maxMana = numberToHexString(Number(row["Mana"]), 4);
      const attack = numberToHexString(Number(row["ATK"]), 4);
      const armor = numberToHexString(Number(row["Armor"]), 4);
      const range = numberToHexString(Number(row["Range"]), 2);
      const speed = numberToHexString(Number(row["Speed"]), 2);
      const initiative = numberToHexString(Number(row["Initiative"]), 2);
      const order = utf8StringToHexString(row["Order"]);
      const origins = utf8StringToHexString(row["Origins"]);
      const ability = utf8StringToHexString(row["Ability"]);

      const callDataStr = [
        creature_index,
        level,
        rarity,
        health,
        maxMana,
        attack,
        armor,
        range,
        speed,
        initiative,
        order,
        origins,
        ability,
      ].join(",");
      callData.push(callDataStr);
    })
    .on("end", () => {
      // execute in batch to avoid gas limit
      const chunks = _.chunk(callData, 40);

      for (const c of chunks) {
        const count = c.length;
        const subCallData = c.join(",");
        const cmd = `sozo --profile ${profile} execute ${address} "setCreatureProfile" --calldata ${numberToHexString(count, 2)},${subCallData}`;
        execSync("sleep 1");
        execSync(cmd);
      }

      console.log("Initialize creature profile successfully");
    });
}

function initializeSynergyProfile() {
  let callData: string[] = [];
  fs.createReadStream("../data/synergy.csv")
    .pipe(csv())
    .on("data", (row) => {
      const name = utf8StringToHexString(row["Name"]);
      const requiredPieces = numberToHexString(
        Number(row["RequiredPieces"]),
        2
      );
      const metadata = numberToHexString(Number(row["Metadata"]), 2);

      const callDataStr = [name, requiredPieces, metadata].join(",");
      callData.push(callDataStr);
    })
    .on("end", () => {
      // execute in batch to avoid gas limit
      const chunks = _.chunk(callData, 60);

      for (const c of chunks) {
        const count = c.length;
        const subCallData = c.join(",");
        const cmd = `sozo --profile ${profile} execute ${address} "setSynergyProfile" --calldata ${numberToHexString(count, 2)},${subCallData}`;
        execSync("sleep 1");
        execSync(cmd);
      }

      console.log("Initialize synergy profile successfully");
    });
}

function initializeChoiceProfile() {
  let callData: string[] = [];
  fs.createReadStream("../data/choice.csv")
    .pipe(csv())
    .on("data", (row) => {
      const type = numberToHexString(Number(row["type"]), 2);
      const vars = numberToHexString(Number(row["var"]), 2);
      const coinDec = numberToHexString(Number(row["coinDec"]), 2);
      const coinInc = numberToHexString(Number(row["coinInc"]), 2);
      const healthDec = numberToHexString(Number(row["healthDec"]), 2);
      const healthInc = numberToHexString(Number(row["healthInc"]), 2);
      const curseDec = numberToHexString(Number(row["curseDec"]), 2);
      const curseInc = numberToHexString(Number(row["curseInc"]), 2);
      const dangerDec = numberToHexString(Number(row["dangerDec"]), 2);
      const dangerInc = numberToHexString(Number(row["dangerInc"]), 2);

      const callDataStr = [
        type,
        vars,
        coinDec,
        coinInc,
        healthDec,
        healthInc,
        curseDec,
        curseInc,
        dangerDec,
        dangerInc,
      ].join(",");

      callData.push(callDataStr);
    })
    .on("end", () => {
      // execute in batch to avoid gas limit
      const chunks = _.chunk(callData, 60);

      for (const c of chunks) {
        const count = c.length;
        const subCallData = c.join(",");
        const cmd = `sozo --profile ${profile} execute ${address} "setChoiceProfile" --calldata ${numberToHexString(count, 2)},${subCallData}`;
        execSync("sleep 1");
        execSync(cmd);
      }

      console.log("Initialize choice profile successfully");
    });
}

function initializeLevelConfig() {
  let callData: string[] = [];
  fs.createReadStream("../data/levelConfig.csv")
    .pipe(csv())
    .on("data", (row) => {
      const current = numberToHexString(Number(row["current"]), 2);
      const expForNext = numberToHexString(Number(row["expForNext"]), 2);

      const callDataStr = [current, expForNext].join(",");

      callData.push(callDataStr);
    })
    .on("end", () => {
      // execute in batch to avoid gas limit
      const chunks = _.chunk(callData, 60);

      for (const c of chunks) {
        const count = c.length;
        const subCallData = c.join(",");
        const cmd = `sozo --profile ${profile} execute ${address} "setLevelConfig" --calldata ${numberToHexString(count, 2)},${subCallData}`;
        execSync("sleep 1");
        execSync(cmd);
      }

      console.log("Initialize level config successfully");
    });
}

function initializeSetLevelRarityProb() {
  let callData: string[] = [];
  fs.createReadStream("../data/levelRarityProb.csv")
    .pipe(csv())
    .on("data", (row) => {
      const level = numberToHexString(Number(row["level"]), 2);
      const r1 = numberToHexString(Number(row["r1"]), 2);
      const r2 = numberToHexString(Number(row["r2"]), 2);
      const r3 = numberToHexString(Number(row["r3"]), 2);

      const callDataStr = [level, r1, r2, r3].join(",");

      callData.push(callDataStr);
    })
    .on("end", () => {
      // execute in batch to avoid gas limit
      const chunks = _.chunk(callData, 60);

      for (const c of chunks) {
        const count = c.length;
        const subCallData = c.join(",");
        const cmd = `sozo --profile ${profile} execute ${address} "setLevelRarityProb" --calldata ${numberToHexString(count, 2)},${subCallData}`;
        execSync("sleep 1");
        execSync(cmd);
      }

      console.log("Initialize set level rarity prob successfully");
    });
}

function initializeSellPriceConfig() {
  let callData: string[] = [];
  fs.createReadStream("../data/sellPriceConfig.csv")
    .pipe(csv())
    .on("data", (row) => {
      const rarity = numberToHexString(Number(row["rarity"]), 2);
      const level = numberToHexString(Number(row["level"]), 2);
      const price = numberToHexString(Number(row["price"]), 2);

      const callDataStr = [rarity, level, price].join(",");

      callData.push(callDataStr);
    })
    .on("end", () => {
      // execute in batch to avoid gas limit
      const chunks = _.chunk(callData, 60);

      for (const c of chunks) {
        const count = c.length;
        const subCallData = c.join(",");
        const cmd = `sozo --profile ${profile} execute ${address} "setSellPriceConfig" --calldata ${numberToHexString(count, 2)},${subCallData}`;
        execSync("sleep 1");
        execSync(cmd);
      }

      console.log("Initialize set sell price successfully");
    });
}

function initializeStage() {
  let stageCallData: string[] = [];
  let stagePieceCallData: string[] = [];

  fs.createReadStream("../data/stages.csv")
    .pipe(csv())
    .on("data", (row) => {
      const stage = Number(row["Stage"]);
      const enemy1 = row["Enemy1"];
      const enemy2 = row["Enemy2"];
      const enemy3 = row["Enemy3"];
      const enemy4 = row["Enemy4"];
      const enemy5 = row["Enemy5"];
      const enemy6 = row["Enemy6"];
      const enemy7 = row["Enemy7"];
      const enemy8 = row["Enemy8"];
      const enemy9 = row["Enemy9"];
      const enemy10 = row["Enemy10"];
      const enemy11 = row["Enemy11"];

      const allEnemies = [
        enemy1,
        enemy2,
        enemy3,
        enemy4,
        enemy5,
        enemy6,
        enemy7,
        enemy8,
        enemy9,
        enemy10,
        enemy11,
      ];

      const pieceCount = getPieceCount(allEnemies);

      const stageProfileStr = `${numberToHexString(stage, 2)},${numberToHexString(pieceCount, 2)}`;
      stageCallData.push(stageProfileStr);
      const pieceProfileElements = getPieceProfileElement(stage, allEnemies);
      pieceProfileElements.forEach((e) => {
        stagePieceCallData.push(e);
      });
    })
    .on("end", () => {
      // set stage profile
      const chunks = _.chunk(stageCallData, 50);
      for (const c of chunks) {
        const count = c.length;
        const subCallData = c.join(",");
        const cmd = `sozo --profile ${profile}  execute ${address} "setStageProfile" --calldata ${numberToHexString(count, 2)},${subCallData},0x00`;
        execSync("sleep 1");
        execSync(cmd);
      }

      // set stage profile piece
      const pieceChunk = _.chunk(stagePieceCallData, 50);
      for (const c of pieceChunk) {
        const count = c.length;
        const subCallData = c.join(",");
        const cmd = `sozo --profile ${profile}  execute ${address} "setStageProfile" --calldata 0x00,${numberToHexString(count, 2)},${subCallData}`;
        execSync("sleep 1");
        execSync(cmd);
      }

      console.log("Initialize stage profile successfully");
    });
}

function getPieceCount(pieces: string[]): number {
  return pieces.reduce((a, v) => {
    if (v) {
      return a + 1;
    } else {
      return a;
    }
  }, 0);
}

function getPieceProfileElement(stage: number, allEnemies: string[]): string[] {
  const count = getPieceCount(allEnemies);

  let arr: string[] = [];

  for (let i = 0; i < count; i++) {
    const p = allEnemies[i];
    const s = numberToHexString(stage, 2);
    const index = numberToHexString(i + 1, 2);
    const decoded = p.split("-");
    // here switch x and y
    const x = numberToHexString(Number(decoded[1]), 2);
    const y = numberToHexString(Number(decoded[0]), 2);
    const creature_index = numberToHexString(Number(decoded[2]), 4);
    const level = numberToHexString(Number(decoded[3]), 2);

    arr.push([s, index, x, y, creature_index, level].join(","));
  }
  return arr;
}

function numberToHexString(n: number, length: number) {
  if (typeof n !== "number") {
    throw new Error("Invalid Number Input");
  }

  return "0x" + n.toString(16).padStart(length, "0");
}

function utf8StringToHexString(utf8String: string) {
  return "0x" + Buffer.from(utf8String, "utf8").toString("hex");
}

function main() {
  initializeCreatureProfile();
  initializeStage();
  initializeSynergyProfile();
  initializeChoiceProfile();
  initializeLevelConfig();
  initializeSetLevelRarityProb();
  initializeSellPriceConfig();
}

main();
