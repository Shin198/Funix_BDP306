pragma solidity ^0.4.17;

import './ERC20_Token.sol';

import '../libraries/StringUtils.sol';

contract Reserve {
    using StringUtils for string;
    
    // Structure to hold details of Order
    struct Order {
        address trader;
        uint256 amount;
        address sourceTokenAddress;
    }   
    
    // Attributes
        
        // Attributes thông tin chung về Token
        address public tokenAddress;
        uint256 private rate;
        
        // Attributes sử dụng trong xử lý Sell Orders, Buy Orders
        Order[] buyOrderBook;
        Order[] sellOrderBook;
        uint256 public totalSellAmount;
        uint256 public totalBuyAmount;
        
        // Attributes sử dụng cho phân quyền
        address public owner;
        address public exchange;
        
        //
        bool public tradeEnable;
    
    // Modifiers
    
        modifier onlyOwner {
            require(msg.sender == owner);
            _;
        }
        
        modifier onlyExchange {
            require(msg.sender == exchange);
            _;
        }
    
    // Constructor và Methods 
    
        // constructor
        function Reserve (address newToken, bool isTradeEnable, string rateString) public {
            rate = StringUtils.convertStringOfFloatToInt(rateString);
            require(rate != 0);
            
            owner = msg.sender;
            tokenAddress = newToken;
            tradeEnable = isTradeEnable;
        }
    
        //Empty payable fallback method just to receive some
        function() payable{}
        
        // Set new exchange
        function setExchange(address newExchange) public onlyOwner {
            exchange = newExchange;
        }
    
        // Update amount in buyOrderBook due to changes of rate
        function updateBuyOrderBookAmount(uint256 newRate, uint256 oldRate, address sourceTokenAddress) public onlyExchange {
            if (buyOrderBook.length != 0) {
                // Cập nhật amount trong buyOrderBook
                for (uint256 index = 0; index <= buyOrderBook.length-1; index++){
                    // Nếu như giá trị 'sourceTokenAddress' trong Order bằng giá trị address của token mới được
                    // cập nhật Rate, thì có nghĩa là BuyOrder này thuộc DestinationToken mà có SourceToken
                    // là Token vừa cập nhật Rate. Vì thế mà nó cũng phải cập nhật lượng token theo
                    //
                    // Công thức thay đổi giá trị là:
                    //
                    //          current_amount * oldRate / newRate
                    //
                    if (buyOrderBook[index].sourceTokenAddress == sourceTokenAddress){
                        uint256 oldAmount = buyOrderBook[index].amount;
                        uint256 newAmount = buyOrderBook[index].amount * oldRate / newRate;
                        buyOrderBook[index].amount = newAmount;
                        totalBuyAmount += newAmount - oldAmount;
                    }
                    // Nếu giá trị 'sourceTokenAddress' bằng address của Token của Reserve hiện tại
                    // thì nó cũng cần cập nhật lượng token theo
                    //
                    // Công thức cập nhật là:
                    //
                    //          current_amount * newRate / oldRate
                    // 
                    if (sourceTokenAddress == tokenAddress){
                        oldAmount = buyOrderBook[index].amount;
                        newAmount = buyOrderBook[index].amount * newRate / oldRate;
                        buyOrderBook[index].amount = newAmount;
                        totalBuyAmount += newAmount - oldAmount;
                    }
                }
            }
        }
        
        // get rate
        function getRate() public view returns (uint256){
            return rate;
        }
        
        function setRate(uint256 newRate) public onlyExchange {
            rate = newRate;
        }
        
        function setTradeEnable(bool isTradeEnable) public onlyExchange {
            tradeEnable = isTradeEnable;
        }
        
        function getReserveEthBalance() public view returns(uint256) {
            return address(this).balance;
        }
        
        // Process new sell order
        function processNewSellOrder(address trader, uint256 amount) public onlyExchange {
            // Kiểm tra xem có token đang cần mua không
            if (totalBuyAmount > 0) {
                //
                address tokenReceiver;
                uint256 currentMappedAmount;
                // Duyệt qua buyOrderBook
                Token token = Token(tokenAddress);
                
                for (uint16 index = 0; index <= buyOrderBook.length-1; index++){
                    // Cập nhật địa chỉ người nhận mới
                    tokenReceiver = buyOrderBook[index].trader;
                    // Xác định số tiền Mapped
                    if (amount >= buyOrderBook[index].amount) {
                        currentMappedAmount = buyOrderBook[index].amount;
                        removeFirstOrderOfOrderBook(buyOrderBook);
                        index--;
                    } else {
                        currentMappedAmount = amount;
                        buyOrderBook[index].amount -= amount;
                    }
                    // Giảm đi số tiền đã Mapped
                    amount -= currentMappedAmount;
                    // Gửi số token tương ứng cho người mua
                    if (token != address(0)){
                        token.transfer(tokenReceiver, currentMappedAmount);
                    } else {
                        tokenReceiver.transfer(currentMappedAmount);
                    }
                    // Giảm lượng token đã xử lý{
                    totalBuyAmount -= currentMappedAmount;
                    // Nếu lượng token cần xử lý đã hết hoặc không còn token
                    // để Reserve mua hoặc bán thì thoát khỏi vòng lặp
                    if (amount == 0
                        ||
                        totalBuyAmount == 0) {
                        break;
                    }
                }
            }
            
            //Nếu như lượng token cần xử lý vẫn còn sau khi đã mapping hết với các Buy Orders
            if (amount > 0) {
                // Tăng lượng token sẽ cần bán trong tương lai
                totalSellAmount += amount;
                // Tạo thêm một Order để xử lý trong tương lai
                Order memory newOrder = Order(trader, amount, token);
                sellOrderBook.push(newOrder);
            }
        }
        
        // Process new buy order
        function processNewBuyOrder (address trader, uint256 amount, address sourceTokenAddress) public onlyExchange {
            // Lưu lại giá trị lượng token cần xử lý ban đầu
            uint256 beginingAmount = amount;
            // Kiểm tra xem có token đang cần bán không
            if (totalSellAmount > 0) {
                //
                uint256 currentMappedAmount;
                // Duyệt qua sellOrderBook
                for (uint16 index = 0; index <= sellOrderBook.length-1; index++){
                    // Xác định số tiền Mapped
                    if (amount >= sellOrderBook[index].amount) {
                        currentMappedAmount = sellOrderBook[index].amount;
                        removeFirstOrderOfOrderBook(sellOrderBook);
                        index--;
                    } else {
                        currentMappedAmount = amount;
                        sellOrderBook[index].amount -= amount;
                    }
                    // Giảm đi số tiền đã Mapped
                    amount -= currentMappedAmount;
                    // Giảm lượng token đã xử lý
                    totalSellAmount -= currentMappedAmount;
                    // Nếu lượng token cần xử lý đã hết hoặc không còn token
                    // để Reserve mua hoặc bán thì thoát khỏi vòng lặp
                    if (amount == 0
                        ||
                        totalSellAmount == 0) {
                        break;
                    }
                }
                // Gửi token cho người mua hiện tại
                Token token = Token(tokenAddress);
                if (token != address(0)){
                    token.transfer(trader, beginingAmount - amount);
                } else {
                    trader.transfer(beginingAmount - amount);
                }
            }
            //Nếu như lượng token cần xử lý vẫn còn sau khi đã mapping hết với các Sell Orders / Buy Orders
            if (amount > 0) {
                totalBuyAmount += amount;
                // Tạo thêm một Order để xử lý trong tương lai
                Order memory newOrder = Order(trader, amount, sourceTokenAddress);
                buyOrderBook.push(newOrder);
            }
        }
        
        // Loại bỏ phần tử đầu tiên trong một OrderBook
        function removeFirstOrderOfOrderBook(Order[] storage orderBook) private {
            // Nếu OrderBook không có Order nào thì không thể Remove Order
            if (orderBook.length == 0) return;
            // Đẩy các Order từ phía sau lên phía trước 1 đơn vị
            for (uint i = 0; i < orderBook.length-1; i++){
                orderBook[i] = orderBook[i+1];
            }
            // Xóa bỏ Order cuối cùng
            delete orderBook[orderBook.length-1];
            // Trừ đi length của Order Book đi 1 đơn vị
            orderBook.length--;
        }
}