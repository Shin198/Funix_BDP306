var search_token_detail_button_e = document.getElementById('search_token_detail_button');
var search_token_input_e = document.getElementById('search_token_input');
var current_account_e = document.getElementById('current_address');

var token_detail_name_e = document.getElementById('token_detail_name');
var token_detail_symbol_e = document.getElementById('token_detail_symbol');
var token_detail_rate_e = document.getElementById('token_detail_rate');
var token_detail_balance_e = document.getElementById('token_detail_balance');

const searchTokenDetail = async () => {
	var accounts = await web3.eth.getAccounts();
	// Set current account
	current_account_e.innerText = accounts[0];
	if (accounts != undefined && accounts.length != 0) {
        if (search_token_input_e.value == "ETH" 
            ||
            search_token_input_e.value == "Ethereum") {
                token_detail_name_e.innerText = "Ethereum";
                token_detail_symbol_e.innerText = "ETH";
                token_detail_rate_e.innerText = "1";
                var balance = await web3.eth.getBalance(accounts[0]);
                token_detail_balance_e.innerText = String((balance / Math.pow(10, 18)).toFixed(4));
                return;
            }
        else {
            // Get token address
            var tokenAddress = await exchangeContract.methods.getTokenAddressBySymbolOrName(search_token_input_e.value).call();
            if (tokenAddress == '0x0000000000000000000000000000000000000000') {
                alert('Không tìm thấy thông tin về token tương ứng !');
                return;
            }
            var tokenContract = new web3.eth.Contract(TokenABI, tokenAddress);
            var symbol = await tokenContract.methods.symbol().call();
            var name = await tokenContract.methods.name().call();
            var balance = await tokenContract.methods.balanceOf(accounts[0]).call();
            // Get rate
            var reserveAddress = await exchangeContract.methods.getReserveByTokenAddress(tokenAddress).call();
            if (reserveAddress == undefined
                ||
                reserveAddress == '0x0000000000000000000000000000000000000000'){
                    alert('Có lỗi xảy ra !');
                    return;
                }
            var reserveContract = new web3.eth.Contract(ReserveABI, reserveAddress);
            var rate = await reserveContract.methods.getRate().call();
            // Display token information to screen
            token_detail_name_e.innerText = name;
            token_detail_symbol_e.innerText = symbol;
            token_detail_rate_e.innerText = String((rate / Math.pow(10, 18)).toFixed(4));
            token_detail_balance_e.innerText = String((balance / Math.pow(10, 18)).toFixed(4));
        }
	}
}

const getCurrentAccount = async () => {
	var accounts = await web3.eth.getAccounts();
	// Set current account
	current_account_e.innerText = accounts[0];
}

const refreshBalance = async () => {
    if (token_detail_symbol_e.innerText == "") {
        return;
    }

	var balance;
    var accounts = await web3.eth.getAccounts();
    if (token_detail_symbol_e.innerText == "ETH") {
        balance = await web3.eth.getBalance(accounts[0]);
    } else {
        var tokenAddress = await exchangeContract.methods.getTokenAddressBySymbolOrName(search_token_input_e.value).call();
        var tokenContract = new web3.eth.Contract(TokenABI, tokenAddress);
        balance = await tokenContract.methods.balanceOf(accounts[0]).call();
    }
    token_detail_balance_e.innerText = String((balance / Math.pow(10, 18)).toFixed(4));
}

/* Update counter */
var update_counter_e = document.getElementById('update_counter');
const update_counter = function() {
	var current_second = parseInt(update_counter_e.innerText);
	next_second = current_second - 1;
	if (next_second == 0) {
		next_second = 10;
	}
	update_counter_e.innerText = String(next_second);
}

getCurrentAccount();
search_token_detail_button_e.onclick = searchTokenDetail;
setInterval(refreshBalance, 3000);
setInterval(update_counter, 1000);