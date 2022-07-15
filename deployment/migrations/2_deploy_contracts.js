
const Token1 = artifacts.require("Token");
const Token2 = artifacts.require("Token");
const Reserve1 = artifacts.require("Reserve");
const Reserve2 = artifacts.require("Reserve");
const Reserve3 = artifacts.require("Reserve");
const Exchange = artifacts.require("Exchange");
const StringUtils = artifacts.require("StringUtils");

module.exports = function(deployer, network, accounts, web3) {
    
    deployer.deploy(StringUtils, {from: accounts[0], gas: 3000000});
    deployer.link(StringUtils, [Reserve1, Reserve2, Reserve3, Exchange]);

	deployer.deploy(Token1, "Token 1", "TOK1", 18, {from: accounts[0], gas: 3000000})
    .then(
        function(){
            return deployer.deploy(Token2, "Token 2", "TOK2", 18, {from: accounts[0], gas: 3000000});
        }
    )
    .then(
        function(){
            return deployer.deploy(Reserve1, Token1.address, true, "1", {from: accounts[0], gas: 3000000});
        }
    )
    .then(
        function(){
            return deployer.deploy(Reserve2, Token2.address, true, "1", {from: accounts[0], gas: 3000000});
        }
    )
    .then(
        function(){
            return deployer.deploy(Reserve3, "0x0000000000000000000000000000000000000000", true, "1", {from: accounts[0], gas: 3000000});
        }
    )
    .then(
        function(){
            return deployer.deploy(Exchange, true, {from: accounts[0], gas: 6000000});
        }
    );
};