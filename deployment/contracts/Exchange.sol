pragma solidity ^0.4.17;

import './Reserve.sol';
import './ERC20_Token.sol';

import '../libraries/StringUtils.sol';

contract Exchange {
    using StringUtils for string;
    
    mapping(address => address) reserves;
    address[] tokenAddresses;
    string[] tokenSymbols;
    string[] tokenNames;
    address public owner;
    bool public tradeEnable;
    
    modifier onlyOwner {
      require(msg.sender == owner);
      _;
    }
    
    // constructor
    function Exchange (bool isTradeEnable) public {
        owner = msg.sender;
        tradeEnable = isTradeEnable;
    }
    
    // READING DATA FUNCTIONS
    
        // get list of supported tokens
        function getListOfSupportedTokens() public view returns (address[]) {
            return tokenAddresses;
        }
        
        // Get Swapped Amount (Amount of destination token will received)
        function computeReceivedSwapAmountPublic(address sourceTokenAddress, address destinationTokenAddress, string amountString) public view returns (uint256){
            uint256 amount = StringUtils.convertStringOfFloatToInt(amountString);
            uint256 sourceRate = 1000000000000000000;
            if (sourceTokenAddress != address(0)) {
                sourceRate = Reserve(reserves[sourceTokenAddress]).getRate();
            }
            uint256 destinationRate = 1000000000000000000;
            if (destinationTokenAddress != address(0)) {
                destinationRate = Reserve(reserves[destinationTokenAddress]).getRate();
            }
            return amount * destinationRate / sourceRate;
        }
        
        // Get Swapped Amount (Amount of destination token will received)
        function computeReceivedSwapAmount(address sourceTokenAddress, address destinationTokenAddress, uint256 amount) private view returns (uint256){
            uint256 sourceRate = 1000000000000000000;
            if (sourceTokenAddress != address(0)) {
                sourceRate = Reserve(reserves[sourceTokenAddress]).getRate();
            }
            uint256 destinationRate = 1000000000000000000;
            if (destinationTokenAddress != address(0)) {
                destinationRate = Reserve(reserves[destinationTokenAddress]).getRate();
            }
            return amount * destinationRate / sourceRate;
        }
        
        // Get token address by token's symbol
        function getTokenAddressBySymbolOrName(string symbolOrName) public view returns (address) {
            for (uint8 index = 0; index < tokenSymbols.length; index++) {
                if (StringUtils.equal(symbolOrName, tokenSymbols[index])
                    ||
                    StringUtils.equal(symbolOrName, tokenNames[index])
                    ) {
                    return tokenAddresses[index];
                }
            }
        }
        
        // Get reserve by token address
        function getReserveByTokenAddress(address tokenAddress) public view returns (address) {
            return reserves[tokenAddress];
        }
    
    // UPDATING DATA FUNCTIONS
        //
        function setExchangeTradeEnable(bool isTradeEnable) public onlyOwner {
            tradeEnable = isTradeEnable;
        }
        
        function setReserveTradeEnable(address tokenAddress, bool isTradeEnable) public onlyOwner {
            Reserve reserve = Reserve(reserves[tokenAddress]);
            reserve.setTradeEnable(isTradeEnable);
        }
        
        // add new reserve
        function addReserve(Reserve newReserve, string symbol, string name) public onlyOwner{
            // get token
            address tokenAddress = newReserve.tokenAddress();
            Token token = Token(tokenAddress);
            if (tokenAddress != address(0)) {
                require(!StringUtils.equal(symbol, 'ETH'));
                require(!StringUtils.equal(name, 'Ethereum'));
            } else {
                require(StringUtils.equal(symbol, 'ETH'));
                require(StringUtils.equal(name, 'Ethereum'));
            }
            // Validate new token: new token must not exist in tokenAddresses
            for (uint8 index = 0; index < tokenAddresses.length; index++){
                require(tokenAddress != tokenAddresses[index]);
                require(!StringUtils.equal(symbol, tokenSymbols[index]));
                require(!StringUtils.equal(name, tokenNames[index]));
            }
            // mapping token to reserve
            reserves[token] = newReserve;
            // add token to list of tokens (Using in getting list of supported token)
            tokenAddresses.push(tokenAddress);
            // Add token's symbol to tokenSymbols
            tokenSymbols.push(symbol);
            // Add token's name to tokenSymbols
            tokenNames.push(name);
        }
        
        // Remove reserve
        function removeReserve(address tokenAddress) public onlyOwner {
            for (uint8 index = 0; index < tokenAddresses.length; index++) {
                if (tokenAddress == tokenAddresses[index]) {
                    removeReserveData(index);
                    break;
                }
            }
            delete reserves[tokenAddress];
        }
        
        function removeReserveData(uint256 index) private {
            // Đẩy các Order từ phía sau lên phía trước 1 đơn vị
            for (uint i = index; i < tokenAddresses.length-1; i++){
                tokenAddresses[i] = tokenAddresses[i+1];
                tokenSymbols[i] = tokenSymbols[i+1];
                tokenNames[i] = tokenNames[i+1];
            }
            // Xóa bỏ phần tử cuối cùng
            delete tokenAddresses[tokenAddresses.length-1];
            delete tokenSymbols[tokenSymbols.length-1];
            delete tokenNames[tokenNames.length-1];
            // Trừ đi length của đi 1 đơn vị
            tokenAddresses.length--;
            tokenSymbols.length--;
            tokenNames.length--;
        }
        
        
        // Register Swap Order
        function registerSwapOrder(address sourceTokenAddress, address destinationTokenAddress, string amountString) public payable {
            require(tradeEnable);
            
            uint256 amount = StringUtils.convertStringOfFloatToInt(amountString);
            // Kiểm tra xem source reserve token có đang tradeEnable không
            Reserve sourceReserve = Reserve(reserves[sourceTokenAddress]);
            require(sourceReserve.tradeEnable());
            // Kiểm tra xem destination reserve token có đang tradeEnable không
            Reserve destinationReserve = Reserve(reserves[destinationTokenAddress]);
            require(destinationReserve.tradeEnable());
            
            if (sourceTokenAddress != address(0)){
                // Get allowance of msg.sender to Exchange
                Token sourceToken = Token(sourceTokenAddress);
                // Kiểm tra xem lượng Token được Approve có đủ để tạo Swap Order không
                uint256 allowance = sourceToken.allowance(msg.sender, this);
                require(allowance >= amount);
                // Chuyển lượng token vừa đủ cho Source Reserve để tạo Swap Order
                sourceToken.transferFrom(msg.sender, reserves[sourceTokenAddress], amount);
            } else {
                // Kiểm tra xem lượng Ether được nhận có đủ để tạo Swap Order không
                require(msg.value >= amount);
                // Chuyển lượng Ether vừa đủ cho Source Reserve để tạo Swap Order
                reserves[sourceTokenAddress].transfer(amount);
                // Gửi trả lại lượng ether còn thừa
                msg.sender.transfer(msg.value - amount);
            }
            
            // Process Sell Order
                // Process new order
                sourceReserve.processNewSellOrder(msg.sender, amount);
            
            // Process Buy Order
                // Compute received amount of destination token
                uint256 buyAmount = computeReceivedSwapAmount(sourceToken, destinationTokenAddress, amount);
                // Process new order
                destinationReserve.processNewBuyOrder(msg.sender, buyAmount, sourceTokenAddress);
        }

    
        // Transfer Token
        function tranferToken(address tokenAddress, address receiver, string amountString) public payable {
            require(tradeEnable);
            //
            Reserve reserve = Reserve(reserves[tokenAddress]);
            require(reserve.tradeEnable());
            
            uint256 amount = StringUtils.convertStringOfFloatToInt(amountString);
            if (tokenAddress != address(0)){
                // Get allowance of msg.sender to Exchange
                Token token = Token(tokenAddress);
                uint256 allowance = token.allowance(msg.sender, this);
                // Kiểm tra xem lượng Token được Approve có đủ để tạo Swap Order không
                require(allowance >= amount);
                // Transfer token
                token.transferFrom(msg.sender, receiver, amount);
            } else {
                // Get value of ether transfered with function call
                uint256 value = msg.value;
                // Kiểm tra xem lượng Ether được gửi có đủ để transfer không
                require(value >= amount);
                // Chuyển lượng Ether vừa đủ cho người nhận
                receiver.transfer(amount);
                // Trả lại lượng ether còn dư
                msg.sender.transfer(value - amount);
            }
        }
        
        // Set new rate for a token
        function setRate(address tokenAddress, string rateString) public onlyOwner {
            uint256 rate = StringUtils.convertStringOfFloatToInt(rateString);
            // Lấy ra Reserve tương ứng
            Reserve correspondingReserve = Reserve(reserves[tokenAddress]);
            // Lấy ra giá trị 'oldRate'
            uint256 oldRate = correspondingReserve.getRate();
            // Cập nhật Rate mới
            correspondingReserve.setRate(rate);
            // Cập nhật amount trong BuyOrderBook ở tất cả các reserves
            for (uint256 index = 0; index <= tokenAddresses.length - 1; index++) {
                // Lấy ra reserve tương ứng
                Reserve aReserve = Reserve(reserves[tokenAddresses[index]]);
                // // Thực hiện cập nhật amount ở BuyOrderBook
                aReserve.updateBuyOrderBookAmount(rate, oldRate, tokenAddress);
            }
        }
}