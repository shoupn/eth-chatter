var Election = artifacts.require("./Election.sol");
var EthChatter = artifacts.require("./EthChatter");
module.exports = function(deployer) {
  deployer.deploy(Election);
  deployer.deploy(EthChatter);
};