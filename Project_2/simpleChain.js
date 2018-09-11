/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require("crypto-js/sha256");

const Storage = require("./storage");
const Block = require("./block");
const chainDB = "./chaindata";

let storage = new Storage(chainDB);

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain {
  constructor() {
    this.getBlockHeight().then(height => {
      if (height === 0) {
        this.addBlock(new Block("First block in the chain - Genesis block"));
      }
    });
  }

  // Add new block
  async addBlock(newBlock) {
    // Block height
    newBlock.height = (await this.getBlockHeight()) + 1;
    console.log("The block height now is " + newBlock.height);

    // UTC timestamp
    newBlock.timestamp = new Date()
      .getTime()
      .toString()
      .slice(0, -3);
    // previous block hash
    if (newBlock.height > 1) {
      console.log("------------------Previous Block----------------");
      let previousBlock = await this.getBlock(newBlock.height - 1);
      newBlock.previousBlockHash = previousBlock.hash;
    }
    // Block hash with SHA256 using newBlock and converting to a string
    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();

    // Add block to Block storage
    await storage.putLevelDBData(newBlock.height, newBlock);
    return;
  }

  // Get block height
  getBlockHeight() {
    return storage.getBlockHeight(height => {
      return height;
    });
  }

  // get block
  getBlock(blockHeight) {
    // return object as a single string
    return storage.getLevelDBData(blockHeight);
  }

  // validate block
  async validateBlock(blockHeight) {
    // get block object
    let block = await this.getBlock(blockHeight);
    // get block hash
    let blockHash = block.hash;
    // remove block hash to test block integrity
    block.hash = "";
    // generate block hash
    let validBlockHash = SHA256(JSON.stringify(block)).toString();
    // Compare
    if (blockHash === validBlockHash) {
      return true;
    } else {
      console.log(
        "Block #" +
          blockHeight +
          " invalid hash:\n" +
          blockHash +
          "<>" +
          validBlockHash
      );
      return false;
    }
  }

  // Validate blockchain
  async validateChain() {
    let errorLog = [];
    this.getBlockHeight(height => {
      for (var i = 1; i <= height; i++) {
        // get block
        this.getBlock(i).then(block => {
          // validate block
          if (!this.validateBlock(i)) errorLog.push(i);
          // compare blocks hash link
          let blockHash = block.hash;
          let previousHash = block.previousBlockHash;
          if (blockHash !== previousHash) {
            errorLog.push(i);
          }
        });
      }
    });
    if (errorLog.length > 0) {
      console.log("Block errors = " + errorLog.length);
      console.log("Blocks: " + errorLog);
    } else {
      console.log("No errors detected");
    }
  }
}

module.exports = Blockchain;
