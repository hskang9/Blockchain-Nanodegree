/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/

const level = require("level");

class Storage {
  constructor(chainDB) {
    this.db = level(chainDB, { valueEncoding: "json" });
  }

  // Put data to levelDB with key/value pair
  putLevelDBData(key, value) {
    return new Promise((resolve, reject) => {
      this.db.open();
      this.db.put(key, value, function(err) {
        if (err) {
          console.log("Block " + key + " submission failed", err);
          reject(err);
        }
      });
      this.db.close();
      resolve(`Put Data to #${key}`);
    });
  }

  // Get data from levelDB with key
  getLevelDBData(key) {
    return new Promise((resolve, reject) => {
      this.db.open();
      this.db.get(key, function(err, value) {
        if (err) {
          console.log("Not found!", err);
          reject(err);
        }
        console.log("Value = " + JSON.stringify(value, null, 4));
        resolve(value);
      });
      this.db.close();
    });
  }

  // Get Height of the blockchain
  getBlockHeight() {
    return new Promise((resolve, reject) => {
      let height = 0; // -1 for genesis block
      this.db
        .createReadStream()
        .on("data", function(data) {
          height++;
        })
        .on("error", function(err) {
          console.log("Unable to read data stream!", err);
          reject(err);
        })
        .on("close", function() {
          resolve(height);
        });
      this.db.close();
    });
  }

  getBlocksByAddress(address) {
    let blocks = [];

    return new Promise((resolve, reject) => {
      this.db
        .createReadStream()
        .on("data", function(data) {
          if (data.key > 0) {
            block = data.value;
            if (block.body.address === address) {
              blocks.push(block);
            }
          }
        })
        .on("error", err => {
          return reject(err);
        })
        .on("close", () => {
          return resolve(blocks);
        });
      this.db.close();
    });
  }

  getBlockByHash(hash) {
    return new Promise((resolve, reject) => {
      this.db
        .createReadStream()
        .on("data", function(data) {
          if (data.key > 0) {
            block = data.value;
            if (block.body.story === hash) {
              return resolve(block);
            }
          }
        })
        .on("error", err => {
          return reject(err);
        })
        .on("close", () => {
          return "Block not found";
        });
      this.db.close();
    });
  }
}

module.exports = Storage;
