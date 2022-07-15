let Token = artifacts.require('Token');
let Reserve = artifacts.require('Reserve');
let Exchange = artifacts.require('Exchange');

contract('Exchange Test. Deployment No_1.', function(accounts) {
    // Reserve
        // Constructor
            it('TC1. Reserve. Constructor.', async () => {
                var token1 = await Token.new("Token 1", "TOK1", 18,
                                                {from: accounts[0]});
                var reserve1 = await Reserve.new(token1.address, true, "1",
                                                    {from: accounts[0]});
                
                var tokenOfReserve = await reserve1.tokenAddress();
                var rate = await reserve1.getRate();
                var owner = await reserve1.owner();
                var tradeEnable = await reserve1.tradeEnable();
                
                assert(token1.address != "");
                assert(reserve1.address != "");
                assert.equal(tokenOfReserve, token1.address, "FAIL");
                assert.equal(rate, 1000000000000000000, "FAIL");
                assert.equal(owner, accounts[0], "FAIL");
                assert.equal(tradeEnable, true, "FAIL");
            });

        // Getters
            it("TC2. Reserve. Function 'getRate'.", async () => {
                var token1 = await Token.new("Token 1", "TOK1", 18,
                                                {from: accounts[0]});
                var reserve1 = await Reserve.new(token1.address, true, "1",
                                                    {from: accounts[0]});
                var rate = await reserve1.getRate();
                assert.equal(rate, 1000000000000000000, "FAIL");        
            });

            it("TC3. Reserve. Function 'getReserveEthBalance'.", async () => {
                var token1 = await Token.new("Token 1", "TOK1", 18,
                                                {from: accounts[0]});
                var reserve1 = await Reserve.new(token1.address, true, "1",
                                                    {from: accounts[0]});
                var reserveEth = await Reserve.new("0x0000000000000000000000000000000000000000", true, "1",
                                                    {from: accounts[0]});
                var exchange = await Exchange.new(true, {from: accounts[0]});
                await exchange.addReserve(reserve1.address, "TOK1", "Token 1",
                                                {from: accounts[0]});
                await exchange.addReserve(reserveEth.address, "ETH", "Ethereum",
                                                {from: accounts[0]});
                await reserve1.setExchange(exchange.address,
                                            {from: accounts[0]})
                await reserveEth.setExchange(exchange.address,
                                                {from: accounts[0]})
                await exchange.registerSwapOrder("0x0000000000000000000000000000000000000000", token1.address, "1", 
                                            {from: accounts[0],
                                            value: web3.utils.toWei("1", 'ether')});
                var ethBalance = await reserveEth.getReserveEthBalance();
                assert.equal(ethBalance, 1000000000000000000, "FAIL");       
            });
        // Setters
            it("TC4. Reserve. Function 'setExchange'.", async () => {
                // Khởi tạo contracts
                var reserveEth = await Reserve.new("0x0000000000000000000000000000000000000000", true, "1",
                                                    {from: accounts[0]});
                var exchange = await Exchange.new(true,
                                                    {from: accounts[0]});
                // Khu vực gọi hàm cần test và theo dõi trạng thái contract
                    // Trước khi gọi function
                    var exchangeOfReserve1 = await reserveEth.exchange();
                    assert.equal(exchangeOfReserve1, "0x0000000000000000000000000000000000000000", "FAIL");
                    // Gọi function
                    await reserveEth.setExchange(exchange.address,
                                                    {from: accounts[0]})
                    // Sau khi gọi function
                    var exchangeOfReserve2 = await reserveEth.exchange();
                    assert.equal(exchangeOfReserve2, exchange.address, "FAIL");       
            });

            it("TC5. Reserve. Function 'setRate'.", async () => {
                // Khởi tạo contracts
                var reserveEth = await Reserve.new("0x0000000000000000000000000000000000000000", true, "1",
                                                    {from: accounts[0]});
                var exchange = await Exchange.new(true,
                                                    {from: accounts[0]});
                // Kết nối contracts
                await exchange.addReserve(reserveEth.address, "ETH", "Ethereum",
                                                {from: accounts[0]});
                await reserveEth.setExchange(exchange.address,
                                            {from: accounts[0]})
                // Khu vực gọi hàm cần test và theo dõi trạng thái contract
                    // Trước khi gọi function
                    var rate1 = await reserveEth.getRate();
                    assert.equal(rate1, 1000000000000000000, "FAIL");
                    // Gọi function
                    await exchange.setRate("0x0000000000000000000000000000000000000000", "2",
                                            {from: accounts[0]});
                    // Sau khi gọi function
                    var rate2 = await reserveEth.getRate();
                    assert.equal(rate2, 2000000000000000000, "FAIL");     
            });

            it("TC6. Reserve. Function 'setTradeEnable'.", async () => {
                // Khởi tạo contracts
                var reserveEth = await Reserve.new("0x0000000000000000000000000000000000000000", true, "1",
                                                    {from: accounts[0]});
                var exchange = await Exchange.new(true,
                                                    {from: accounts[0]});
                // Kết nối contracts
                await exchange.addReserve(reserveEth.address, "ETH", "Ethereum",
                                                {from: accounts[0]});
                await reserveEth.setExchange(exchange.address,
                                            {from: accounts[0]})
                // Khu vực gọi hàm cần test và theo dõi trạng thái contract
                    // Trước khi gọi function
                    var tradeEnable1 = await reserveEth.tradeEnable();
                    assert.equal(tradeEnable1, true, "FAIL");
                    // Gọi function
                    await exchange.setReserveTradeEnable("0x0000000000000000000000000000000000000000", false,
                                                            {from: accounts[0]});
                    // Sau khi gọi function
                    var tradeEnable2 = await reserveEth.tradeEnable();
                    assert.equal(tradeEnable2, false, "FAIL");     
            });

        // Other functions
            it("TC7. Reserve. Function 'updateBuyOrderBookAmount'.", async () => {
                // Khởi tạo contracts
                var token1 = await Token.new("Token 1", "TOK1", 18,
                                                {from: accounts[0]});
                var reserve1 = await Reserve.new(token1.address, true, "1",
                                                    {from: accounts[0]});
                var reserveEth = await Reserve.new("0x0000000000000000000000000000000000000000", true, "1",
                                                    {from: accounts[0]});
                var exchange = await Exchange.new(true,
                                                    {from: accounts[0]});
                // Kết nối contracts
                await exchange.addReserve(reserveEth.address, "ETH", "Ethereum",
                                                {from: accounts[0]});
                await exchange.addReserve(reserve1.address, "TOK1", "Token 1",
                                                {from: accounts[0]});
                await reserveEth.setExchange(exchange.address,
                                                {from: accounts[0]});
                await reserve1.setExchange(exchange.address,
                                                {from: accounts[0]});
                // Chuẩn bị
                exchange.registerSwapOrder("0x0000000000000000000000000000000000000000", token1.address, "1", 
                                                {from: accounts[0],
                                                value: web3.utils.toWei("1", 'ether')})
                exchange.registerSwapOrder("0x0000000000000000000000000000000000000000", token1.address, "2", 
                                                {from: accounts[0],
                                                value: web3.utils.toWei("2", 'ether')})
                // Khu vực gọi hàm cần test và theo dõi trạng thái contract
                    // Trước khi gọi function
                    var totalSellAmount1 = await reserveEth.totalSellAmount();
                    var totalBuyAmount1 = await reserve1.totalBuyAmount();
                    assert.equal(totalSellAmount1, web3.utils.toWei("3", 'ether'), "FAIL");
                    assert.equal(totalBuyAmount1, web3.utils.toWei("3", 'ether'), "FAIL");
                    // Gọi function
                    /* Function  'updateBuyOrderBookAmount' được gọi trong function 'setRate',
                        khi test function 'setRate' thì chú trọng vào sự thay đổi của rate.
                        Còn khi test function 'updateBuyOrderBookAmount' thì chú trong 
                        sự thay đổi về lượng Token mua và bán*/
                    await exchange.setRate(token1.address, "2",
                                            {from: accounts[0]});
                    // Sau khi gọi function
                    var totalSellAmount2 = await reserveEth.totalSellAmount();
                    var totalBuyAmount2 = await reserve1.totalBuyAmount();
                    assert.equal(totalSellAmount2, web3.utils.toWei("3", 'ether'), "FAIL");
                    assert.equal(totalBuyAmount2, web3.utils.toWei("6", 'ether'), "FAIL");     
            });

            it("TC8. Reserve. Functions 'processNewSellOrder' and 'processNewBuyOrder'.", async () => {
                // Khởi tạo contracts
                var token1 = await Token.new("Token 1", "TOK1", 18,
                                                {from: accounts[0]});
                var reserve1 = await Reserve.new(token1.address, true, "1",
                                                    {from: accounts[0]});
                var reserveEth = await Reserve.new("0x0000000000000000000000000000000000000000", true, "1",
                                                    {from: accounts[0]});
                var exchange = await Exchange.new(true,
                                                    {from: accounts[0]});
                // Kết nối contracts
                await exchange.addReserve(reserveEth.address, "ETH", "Ethereum",
                                                {from: accounts[0]});
                await exchange.addReserve(reserve1.address, "TOK1", "Token 1",
                                                {from: accounts[0]});
                await reserveEth.setExchange(exchange.address,
                                                {from: accounts[0]});
                await reserve1.setExchange(exchange.address,
                                                {from: accounts[0]});
                // Khu vực gọi hàm cần test và theo dõi trạng thái contract
                    // Trước khi gọi function
                    var totalSellAmount1 = await reserveEth.totalSellAmount();
                    var totalBuyAmount1 = await reserve1.totalBuyAmount();
                    assert.equal(totalSellAmount1, 0, "FAIL");
                    assert.equal(totalBuyAmount1, 0, "FAIL");
                    // Gọi function
                    exchange.registerSwapOrder("0x0000000000000000000000000000000000000000", token1.address, "1", 
                                                {from: accounts[0],
                                                value: web3.utils.toWei("1", 'ether')})
                    // Sau khi gọi function
                    var totalSellAmount2 = await reserveEth.totalSellAmount();
                    var totalBuyAmount2 = await reserve1.totalBuyAmount();
                    assert.equal(totalSellAmount2, web3.utils.toWei("1", 'ether'), "FAIL");
                    assert.equal(totalBuyAmount2, web3.utils.toWei("1", 'ether'), "FAIL");  
            });

    // Exchange
        // Constructor
            it('TC9. Exchange. Constructor.', async () => {
                var exchange = await Exchange.new(true);
                assert(exchange.address != "");
            });

        // Getters

            it("TC10. Exchange. Function 'getListOfSupportedTokens'.", async () => {
                // Khởi tạo contracts
                var token1 = await Token.new("Token 1", "TOK1", 18,
                                                {from: accounts[0]});
                var token2 = await Token.new("Token 2", "TOK2", 18,
                                                {from: accounts[0]});
                var reserve1 = await Reserve.new(token1.address, true, "1",
                                                    {from: accounts[0]});
                var reserve2 = await Reserve.new(token2.address, true, "1",
                                                    {from: accounts[0]});                                    
                var reserveEth = await Reserve.new("0x0000000000000000000000000000000000000000", true, "1",
                                                    {from: accounts[0]});
                var exchange = await Exchange.new(true,
                                                    {from: accounts[0]});
                // Kết nối contracts
                await exchange.addReserve(reserveEth.address, "ETH", "Ethereum",
                                                {from: accounts[0]});
                await exchange.addReserve(reserve1.address, "TOK1", "Token 1",
                                                {from: accounts[0]});
                await exchange.addReserve(reserve2.address, "TOK2", "Token 2",
                                                {from: accounts[0]});
                await reserveEth.setExchange(exchange.address,
                                                {from: accounts[0]});
                await reserve1.setExchange(exchange.address,
                                                {from: accounts[0]});
                await reserve2.setExchange(exchange.address,
                                                    {from: accounts[0]});
                
                var listSupportedTokens = await exchange.getListOfSupportedTokens();
                assert.equal(listSupportedTokens[0], "0x0000000000000000000000000000000000000000", "FAIL");
                assert.equal(listSupportedTokens[1], token1.address, "FAIL");
                assert.equal(listSupportedTokens[2], token2.address, "FAIL");
            });

            it("TC11. Exchange. Function 'computeReceivedSwapAmountPublic'.", async () => {
                // Khởi tạo contracts
                var token1 = await Token.new("Token 1", "TOK1", 18,
                                                {from: accounts[0]});
                var reserve1 = await Reserve.new(token1.address, true, "1",
                                                    {from: accounts[0]});
                var reserveEth = await Reserve.new("0x0000000000000000000000000000000000000000", true, "1",
                                                    {from: accounts[0]});
                var exchange = await Exchange.new(true,
                                                    {from: accounts[0]});
                // Kết nối contracts
                await exchange.addReserve(reserveEth.address, "ETH", "Ethereum",
                                                {from: accounts[0]});
                await exchange.addReserve(reserve1.address, "TOK1", "Token 1",
                                                {from: accounts[0]});
                await reserveEth.setExchange(exchange.address,
                                                {from: accounts[0]});
                await reserve1.setExchange(exchange.address,
                                                {from: accounts[0]});
                // Chuẩn bị
                await exchange.setRate(token1.address, "2",
                                        {from: accounts[0]})
                
                var receivedAmount = await exchange.computeReceivedSwapAmountPublic(
                                    "0x0000000000000000000000000000000000000000",
                                    token1.address, "1");
                assert.equal(receivedAmount, 2000000000000000000, "FAIL");
            });

            it("TC12. Exchange. Function 'getTokenAddressBySymbolOrName'.", async () => {
                // Khởi tạo contracts
                var token1 = await Token.new("Token 1", "TOK1", 18,
                                                {from: accounts[0]});
                var token2 = await Token.new("Token 2", "TOK2", 18,
                                                {from: accounts[0]});
                var reserve1 = await Reserve.new(token1.address, true, "1",
                                                    {from: accounts[0]});
                var reserve2 = await Reserve.new(token2.address, true, "1",
                                                    {from: accounts[0]});                                    
                var reserveEth = await Reserve.new("0x0000000000000000000000000000000000000000", true, "1",
                                                    {from: accounts[0]});
                var exchange = await Exchange.new(true,
                                                    {from: accounts[0]});
                // Kết nối contracts
                await exchange.addReserve(reserveEth.address, "ETH", "Ethereum",
                                                {from: accounts[0]});
                await exchange.addReserve(reserve1.address, "TOK1", "Token 1",
                                                {from: accounts[0]});
                await exchange.addReserve(reserve2.address, "TOK2", "Token 2",
                                                {from: accounts[0]});
                await reserveEth.setExchange(exchange.address,
                                                {from: accounts[0]});
                await reserve1.setExchange(exchange.address,
                                                {from: accounts[0]});
                await reserve2.setExchange(exchange.address,
                                                    {from: accounts[0]});
                
                var tokenAddress1 = await exchange.getTokenAddressBySymbolOrName("TOK1");
                var tokenAddress2 = await exchange.getTokenAddressBySymbolOrName("Ethereum");
                assert.equal(tokenAddress1, token1.address, "FAIL");
                assert.equal(tokenAddress2, "0x0000000000000000000000000000000000000000", "FAIL");
            });

            it("TC13. Exchange. Function 'getReserveByTokenAddress'.", async () => {
                // Khởi tạo contracts
                var token1 = await Token.new("Token 1", "TOK1", 18,
                                                {from: accounts[0]});
                var token2 = await Token.new("Token 2", "TOK2", 18,
                                                {from: accounts[0]});
                var reserve1 = await Reserve.new(token1.address, true, "1",
                                                    {from: accounts[0]});
                var reserve2 = await Reserve.new(token2.address, true, "1",
                                                    {from: accounts[0]});                                    
                var reserveEth = await Reserve.new("0x0000000000000000000000000000000000000000", true, "1",
                                                    {from: accounts[0]});
                var exchange = await Exchange.new(true,
                                                    {from: accounts[0]});
                // Kết nối contracts
                await exchange.addReserve(reserveEth.address, "ETH", "Ethereum",
                                                {from: accounts[0]});
                await exchange.addReserve(reserve1.address, "TOK1", "Token 1",
                                                {from: accounts[0]});
                await exchange.addReserve(reserve2.address, "TOK2", "Token 2",
                                                {from: accounts[0]});
                await reserveEth.setExchange(exchange.address,
                                                {from: accounts[0]});
                await reserve1.setExchange(exchange.address,
                                                {from: accounts[0]});
                await reserve2.setExchange(exchange.address,
                                                    {from: accounts[0]});
                
                var reserveAddress1 = await exchange.getReserveByTokenAddress(token1.address);
                var reserveAddress2 = await exchange.getReserveByTokenAddress("0x0000000000000000000000000000000000000000");
                assert.equal(reserveAddress1, reserve1.address, "FAIL");
                assert.equal(reserveAddress2, reserveEth.address, "FAIL");
            });
        
        // Setters

            it("TC14. Exchange. Function 'setExchangeTradeEnable'.", async () => {
                // Khởi tạo contracts
                var exchange = await Exchange.new(true,
                                                    {from: accounts[0]});
                // Khu vực gọi hàm cần test và theo dõi trạng thái contract
                    // Trước khi gọi function
                    var tradeEnable1 = await exchange.tradeEnable();
                    assert.equal(tradeEnable1, true, "FAIL");
                    // Gọi function
                    await exchange.setExchangeTradeEnable(false,
                                                    {from: accounts[0]})
                    // Sau khi gọi function
                    var tradeEnable1 = await exchange.tradeEnable();
                    assert.equal(tradeEnable1, false, "FAIL");
            });

        // Other functions 

            it("TC15. Exchange. Function 'setReserveTradeEnable'.", async () => {
                // Khởi tạo contracts
                var reserveEth = await Reserve.new("0x0000000000000000000000000000000000000000", true, "1",
                                                    {from: accounts[0]});
                var exchange = await Exchange.new(true,
                                                    {from: accounts[0]});
                // Kết nối contracts
                await exchange.addReserve(reserveEth.address, "ETH", "Ethereum",
                                                {from: accounts[0]});
                await reserveEth.setExchange(exchange.address,
                                            {from: accounts[0]})
                // Khu vực gọi hàm cần test và theo dõi trạng thái contract
                    // Trước khi gọi function
                    var tradeEnable1 = await reserveEth.tradeEnable();
                    assert.equal(tradeEnable1, true, "FAIL");
                    // Gọi function
                    await exchange.setReserveTradeEnable("0x0000000000000000000000000000000000000000", false,
                                                            {from: accounts[0]});
                    // Sau khi gọi function
                    var tradeEnable2 = await reserveEth.tradeEnable();
                    assert.equal(tradeEnable2, false, "FAIL");     
            });

            it("TC16. Exchange. Function 'addReserve'.", async () => {
                // Khởi tạo contracts
                var reserveEth = await Reserve.new("0x0000000000000000000000000000000000000000", true, "1",
                                                    {from: accounts[0]});
                var exchange = await Exchange.new(true,
                                                    {from: accounts[0]});
                // Khu vực gọi hàm cần test và theo dõi trạng thái contract
                    // Trước khi gọi function
                    var reserveAddress1 = await exchange.getReserveByTokenAddress("0x0000000000000000000000000000000000000000");
                    assert.equal(reserveAddress1, "0x0000000000000000000000000000000000000000", "FAIL");
                    // Gọi function
                    await exchange.addReserve(reserveEth.address, "ETH", "Ethereum",
                                                {from: accounts[0]});
                    // Sau khi gọi function
                    var reserveAddress2 = await exchange.getReserveByTokenAddress("0x0000000000000000000000000000000000000000");
                    assert.equal(reserveAddress2, reserveEth.address, "FAIL");  
            });

            it("TC17. Exchange. Function 'removeReserve'.", async () => {
                // Khởi tạo contracts
                var reserveEth = await Reserve.new("0x0000000000000000000000000000000000000000", true, "1",
                                                    {from: accounts[0]});
                var exchange = await Exchange.new(true,
                                                    {from: accounts[0]});
                // Kết nối contracts
                await exchange.addReserve(reserveEth.address, "ETH", "Ethereum",
                                                {from: accounts[0]});                 
                // Khu vực gọi hàm cần test và theo dõi trạng thái contract
                    // Trước khi gọi function
                    var reserveAddress1 = await exchange.getReserveByTokenAddress("0x0000000000000000000000000000000000000000");
                    assert.equal(reserveAddress1, reserveEth.address, "FAIL");
                    // Gọi function
                    await exchange.removeReserve("0x0000000000000000000000000000000000000000",
                                                {from: accounts[0]});
                    // Sau khi gọi function
                    var reserveAddress2 = await exchange.getReserveByTokenAddress("0x0000000000000000000000000000000000000000");
                    assert.equal(reserveAddress2, "0x0000000000000000000000000000000000000000", "FAIL");  
            });

            it("TC18. Exchange. Functions 'registerSwapOrder'.", async () => {
                // Khởi tạo contracts
                var token1 = await Token.new("Token 1", "TOK1", 18,
                                                {from: accounts[0]});
                var reserve1 = await Reserve.new(token1.address, true, "1",
                                                    {from: accounts[0]});
                var reserveEth = await Reserve.new("0x0000000000000000000000000000000000000000", true, "1",
                                                    {from: accounts[0]});
                var exchange = await Exchange.new(true,
                                                    {from: accounts[0]});
                // Kết nối contracts
                await exchange.addReserve(reserveEth.address, "ETH", "Ethereum",
                                                {from: accounts[0]});
                await exchange.addReserve(reserve1.address, "TOK1", "Token 1",
                                                {from: accounts[0]});
                await reserveEth.setExchange(exchange.address,
                                                {from: accounts[0]});
                await reserve1.setExchange(exchange.address,
                                                {from: accounts[0]});
                // Khu vực gọi hàm cần test và theo dõi trạng thái contract
                    // Trước khi gọi function
                    var totalSellAmount1 = await reserveEth.totalSellAmount();
                    var totalBuyAmount1 = await reserve1.totalBuyAmount();
                    assert.equal(totalSellAmount1, 0, "FAIL");
                    assert.equal(totalBuyAmount1, 0, "FAIL");
                    // Gọi function
                    exchange.registerSwapOrder("0x0000000000000000000000000000000000000000", token1.address, "1", 
                                                {from: accounts[0],
                                                value: web3.utils.toWei("1", 'ether')})
                    // Sau khi gọi function
                    var totalSellAmount2 = await reserveEth.totalSellAmount();
                    var totalBuyAmount2 = await reserve1.totalBuyAmount();
                    assert.equal(totalSellAmount2, web3.utils.toWei("1", 'ether'), "FAIL");
                    assert.equal(totalBuyAmount2, web3.utils.toWei("1", 'ether'), "FAIL");  
            });

            it("TC19. Exchange. Functions 'tranferToken'.", async () => {
                // Khởi tạo contracts
                var reserveEth = await Reserve.new("0x0000000000000000000000000000000000000000", true, "1",
                                                    {from: accounts[0]});
                var exchange = await Exchange.new(true,
                                                    {from: accounts[0]});
                // Kết nối contracts
                await exchange.addReserve(reserveEth.address, "ETH", "Ethereum",
                                                {from: accounts[0]});
                await reserveEth.setExchange(exchange.address,
                                                {from: accounts[0]});
                // Khu vực gọi hàm cần test và theo dõi trạng thái contract
                    // Trước khi gọi function
                    var balanceOfAcc5_1 = await web3.eth.getBalance(accounts[5]);
                    // Gọi function
                    await exchange.tranferToken("0x0000000000000000000000000000000000000000", accounts[5], "2",
                                                {from: accounts[0],
                                                value: web3.utils.toWei("2", 'ether')});
                    // Sau khi gọi function
                    var balanceOfAcc5_2 = await web3.eth.getBalance(accounts[5]);
                    assert.equal(balanceOfAcc5_2 - balanceOfAcc5_1, 2000000000000000000, "FAIL");
            });

            it("TC20. Exchange. Function 'setRate'.", async () => {
                // Khởi tạo contracts
                var token1 = await Token.new("Token 1", "TOK1", 18,
                                                {from: accounts[0]});
                var reserve1 = await Reserve.new(token1.address, true, "1",
                                                    {from: accounts[0]});
                var reserveEth = await Reserve.new("0x0000000000000000000000000000000000000000", true, "1",
                                                    {from: accounts[0]});
                var exchange = await Exchange.new(true,
                                                    {from: accounts[0]});
                // Kết nối contracts
                await exchange.addReserve(reserveEth.address, "ETH", "Ethereum",
                                                {from: accounts[0]});
                await exchange.addReserve(reserve1.address, "TOK1", "Token 1",
                                                {from: accounts[0]});
                await reserveEth.setExchange(exchange.address,
                                                {from: accounts[0]});
                await reserve1.setExchange(exchange.address,
                                                {from: accounts[0]});
                // Chuẩn bị
                exchange.registerSwapOrder("0x0000000000000000000000000000000000000000", token1.address, "1", 
                                                {from: accounts[0],
                                                value: web3.utils.toWei("1", 'ether')})
                exchange.registerSwapOrder("0x0000000000000000000000000000000000000000", token1.address, "2", 
                                                {from: accounts[0],
                                                value: web3.utils.toWei("2", 'ether')})
                // Khu vực gọi hàm cần test và theo dõi trạng thái contract
                    // Trước khi gọi function
                    var totalSellAmount1 = await reserveEth.totalSellAmount();
                    var totalBuyAmount1 = await reserve1.totalBuyAmount();
                    var rate1 = await reserve1.getRate();
                    assert.equal(rate1, 1000000000000000000, "FAIL");
                    assert.equal(totalSellAmount1, web3.utils.toWei("3", 'ether'), "FAIL");
                    assert.equal(totalBuyAmount1, web3.utils.toWei("3", 'ether'), "FAIL");
                    // Gọi function
                    /* Function  'updateBuyOrderBookAmount' được gọi trong function 'setRate',
                        khi test function 'setRate' thì chú trọng vào sự thay đổi của rate.
                        Còn khi test function 'updateBuyOrderBookAmount' thì chú trong 
                        sự thay đổi về lượng Token mua và bán*/
                    await exchange.setRate(token1.address, "2",
                                            {from: accounts[0]});
                    // Sau khi gọi function
                    var totalSellAmount2 = await reserveEth.totalSellAmount();
                    var totalBuyAmount2 = await reserve1.totalBuyAmount();
                    var rate2 = await reserve1.getRate();
                    assert.equal(rate2, 2000000000000000000, "FAIL"); 
                    assert.equal(totalSellAmount2, web3.utils.toWei("3", 'ether'), "FAIL");
                    assert.equal(totalBuyAmount2, web3.utils.toWei("6", 'ether'), "FAIL");
            });

    // Security
        it("TC21. Security (Reserve) Function 'setExchange'. POSITIVE.", async () => {
            // Khởi tạo contracts
            var reserveEth = await Reserve.new("0x0000000000000000000000000000000000000000", true, "1",
                                                {from: accounts[0]});
            var exchange = await Exchange.new(true,
                                                {from: accounts[0]});
            try {
                // Gọi function
                await reserveEth.setExchange(exchange.address,
                                            {from: accounts[0]})
                throw("Success");  
            }
            catch (e) {
                var a = e.toString();
                if(e === "Success") {
                    assert(true);
                } else {
                    assert(false);
                }
            }
        });

        it("TC22. Security (Reserve) Function 'setExchange'. NEGATIVE.", async () => {
            // Khởi tạo contracts
            var reserveEth = await Reserve.new("0x0000000000000000000000000000000000000000", true, "1",
                                                {from: accounts[0]});
            var exchange = await Exchange.new(true,
                                                {from: accounts[0]});
            try {
                // Gọi function
                await reserveEth.setExchange(exchange.address,
                                            {from: accounts[1]})
                throw("Success");  
            }
            catch (e) {
                var a = e.toString();
                if(e === "Success") {
                    assert(false);
                } else {
                    assert(true);
                }
            }
        });

        it("TC23. Security (Exchange) Function 'addReserve'. POSITIVE.", async () => {
            // Khởi tạo contracts
            var reserveEth = await Reserve.new("0x0000000000000000000000000000000000000000", true, "1",
                                                {from: accounts[0]});
            var exchange = await Exchange.new(true,
                                                {from: accounts[0]});
            try {
                // Gọi function
                await exchange.addReserve(reserveEth.address, "ETH", "Ethereum",
                                            {from: accounts[0]});
                throw("Success");  
            }
            catch (e) {
                var a = e.toString();
                if(e === "Success") {
                    assert(true);
                } else {
                    assert(false);
                }
            }
        });

        it("TC24. Security (Exchange) Function 'addReserve'. NEGATIVE.", async () => {
            // Khởi tạo contracts
            var reserveEth = await Reserve.new("0x0000000000000000000000000000000000000000", true, "1",
                                                {from: accounts[0]});
            var exchange = await Exchange.new(true,
                                                {from: accounts[0]});
            try {
                // Gọi function
                await exchange.addReserve(reserveEth.address, "ETH", "Ethereum",
                                            {from: accounts[1]});
                throw("Success");  
            }
            catch (e) {
                var a = e.toString();
                if(e === "Success") {
                    assert(false);
                } else {
                    assert(true);
                }
            }
        });

        it("TC25. Security (Exchange) Function 'removeReserve'. POSITIVE.", async () => {
            // Khởi tạo contracts
            var reserveEth = await Reserve.new("0x0000000000000000000000000000000000000000", true, "1",
                                                {from: accounts[0]});
            var exchange = await Exchange.new(true,
                                                {from: accounts[0]});
            // Kết nối contracts
            await exchange.addReserve(reserveEth.address, "ETH", "Ethereum",
                                        {from: accounts[0]});
            try {
                // Gọi function
                await exchange.removeReserve("0x0000000000000000000000000000000000000000",
                                            {from: accounts[0]});
                throw("Success");  
            }
            catch (e) {
                var a = e.toString();
                if(e === "Success") {
                    assert(true);
                } else {
                    assert(false);
                }
            }
        });

        it("TC26. Security (Exchange) Function 'removeReserve'. NEGATIVE.", async () => {
            // Khởi tạo contracts
            var reserveEth = await Reserve.new("0x0000000000000000000000000000000000000000", true, "1",
                                                {from: accounts[0]});
            var exchange = await Exchange.new(true,
                                                {from: accounts[0]});
            // Kết nối contracts
            await exchange.addReserve(reserveEth.address, "ETH", "Ethereum",
                                            {from: accounts[0]}); 
            try {
                // Gọi function
                await exchange.removeReserve("0x0000000000000000000000000000000000000000",
                                            {from: accounts[1]});
                throw("Success");  
            }
            catch (e) {
                var a = e.toString();
                if(e === "Success") {
                    assert(false);
                } else {
                    assert(true);
                }
            }
        });

        it("TC27. Security (Exchange) Function 'setExchangeTradeEnable'. POSITIVE.", async () => {
            // Khởi tạo contracts
            var exchange = await Exchange.new(true,
                                                {from: accounts[0]});
            try {
                // Gọi function
                await exchange.setExchangeTradeEnable(false,
                                                        {from: accounts[0]})
                throw("Success");  
            }
            catch (e) {
                var a = e.toString();
                if(e === "Success") {
                    assert(true);
                } else {
                    assert(false);
                }
            }
        });

        it("TC28. Security (Exchange) Function 'setExchangeTradeEnable'. NEGATIVE.", async () => {
            // Khởi tạo contracts
            var exchange = await Exchange.new(true,
                                                {from: accounts[0]});
            try {
                // Gọi function
                await exchange.setExchangeTradeEnable(false,
                                                        {from: accounts[1]})
                throw("Success");  
            }
            catch (e) {
                var a = e.toString();
                if(e === "Success") {
                    assert(false);
                } else {
                    assert(true);
                }
            }
        });

        it("TC29. Security (Exchange) Function 'setReserveTradeEnable'. POSITIVE.", async () => {
            // Khởi tạo contracts
            var reserveEth = await Reserve.new("0x0000000000000000000000000000000000000000", true, "1",
                                                {from: accounts[0]});
            var exchange = await Exchange.new(true,
                                                {from: accounts[0]});
            // Kết nối contracts
            await exchange.addReserve(reserveEth.address, "ETH", "Ethereum",
                                            {from: accounts[0]});
            await reserveEth.setExchange(exchange.address,
                                        {from: accounts[0]})
            try {
                // Gọi function
                await exchange.setReserveTradeEnable("0x0000000000000000000000000000000000000000", false,
                                                        {from: accounts[0]});
                throw("Success");  
            }
            catch (e) {
                var a = e.toString();
                if(e === "Success") {
                    assert(true);
                } else {
                    assert(false);
                }
            }
        });

        it("TC30. Security (Exchange) Function 'setReserveTradeEnable'. NEGATIVE.", async () => {
            // Khởi tạo contracts
            var reserveEth = await Reserve.new("0x0000000000000000000000000000000000000000", true, "1",
                                                {from: accounts[0]});
            var exchange = await Exchange.new(true,
                                                {from: accounts[0]});
            // Kết nối contracts
            await exchange.addReserve(reserveEth.address, "ETH", "Ethereum",
                                            {from: accounts[0]});
            await reserveEth.setExchange(exchange.address,
                                        {from: accounts[0]})
            try {
                // Gọi function
                await exchange.setReserveTradeEnable("0x0000000000000000000000000000000000000000", false,
                                                        {from: accounts[1]});
                throw("Success");  
            }
            catch (e) {
                var a = e.toString();
                if(e === "Success") {
                    assert(false);
                } else {
                    assert(true);
                }
            }
        });

        it("TC31. Security (Exchange) Function 'setRate'. POSITIVE.", async () => {
            // Khởi tạo contracts
            var reserveEth = await Reserve.new("0x0000000000000000000000000000000000000000", true, "1",
                                                {from: accounts[0]});
            var exchange = await Exchange.new(true,
                                                {from: accounts[0]});
            // Kết nối contracts
            await exchange.addReserve(reserveEth.address, "ETH", "Ethereum",
                                            {from: accounts[0]});
            await reserveEth.setExchange(exchange.address,
                                        {from: accounts[0]})
            try {
                // Gọi function
                await exchange.setRate("0x0000000000000000000000000000000000000000", "2",
                                        {from: accounts[0]});
                throw("Success");  
            }
            catch (e) {
                var a = e.toString();
                if(e === "Success") {
                    assert(true);
                } else {
                    assert(false);
                }
            }
        });

        it("TC32. Security (Exchange) Function 'setRate'. NEGATIVE.", async () => {
            // Khởi tạo contracts
            var reserveEth = await Reserve.new("0x0000000000000000000000000000000000000000", true, "1",
                                                {from: accounts[0]});
            var exchange = await Exchange.new(true,
                                                {from: accounts[0]});
            // Kết nối contracts
            await exchange.addReserve(reserveEth.address, "ETH", "Ethereum",
                                            {from: accounts[0]});
            await reserveEth.setExchange(exchange.address,
                                        {from: accounts[0]})
            try {
                // Gọi function
                await exchange.setRate("0x0000000000000000000000000000000000000000", "2",
                                        {from: accounts[1]});
                throw("Success");  
            }
            catch (e) {
                var a = e.toString();
                if(e === "Success") {
                    assert(false);
                } else {
                    assert(true);
                }
            }
        });
});