var express = require("express");
var parse = require("url-parse");
var app = express();
var bodyParser = require("body-parser");
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
const requests = require("request");

// Blockchain class
const Blockchain = require("./simpleChain");
const Block = require("./block");

let blockchain = new Blockchain();

app.get("/block/:height", async function get(req, res) {
  try {
    const response = await chain.getBlock(req.params.height);
    res.status(200).json(response);
  } catch (err) {
    res.status(404).json({
      status: 404,
      message: "Block not found"
    });
  }
});

app.get("/height", async function height(req, res) {
  const response = await blockchain.getBlockHeight();
  res.status(200).json(response);
});

app.post("/block", async function put(req, res) {
  if (req.body.body === "" || req.body.body === undefined) {
    res.status(400).json({
      status: 400,
      message: "Invalid Input: Fill the body parameter"
    });
  }
  await blockchain.addBlock(new Block(req.body.body));
  const height = await blockchain.getBlockHeight();
  const response = await blockchain.getBlock(height);

  res.status(200).json(response);
});

app.listen(8000);
