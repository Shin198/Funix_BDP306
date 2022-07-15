// Get account balance of all supported token
var account_balance_detail_table = document.getElementById('account-balance-detail-table');
var current_account_e = document.getElementById('current_address');



function fillBalanceDetailOfAToken(symbol, balance) {
	var token_detail_e = $('.' + symbol + '_token_detail');
	if (!token_detail_e.length) {
		// Create tr tag
		var tr_tag = document.createElement("tr");
		tr_tag.classList.add(symbol + '_token_detail');
		// Create td tag for token's symbol
		var token_symbol_td_tag = document.createElement("td");
		token_symbol_td_tag.innerText = symbol;
		token_symbol_td_tag.classList.add("token_symbol");
		// Create td tag for balance
		var balance_td_tag = document.createElement("td");
		balance_td_tag.innerText = String(balance);
		balance_td_tag.classList.add("token_balance");
		// Add tag to document
		account_balance_detail_table.appendChild(tr_tag);
		tr_tag.appendChild(token_symbol_td_tag);
		tr_tag.appendChild(balance_td_tag);
	} else {
		var token_symbol_e = token_detail_e.find('.token_symbol');
		var token_balance_e = token_detail_e.find('.token_balance');
		token_symbol_e.text(symbol);
		token_balance_e.text(String(balance));
	}
}

const getAccountBalance = async () => {
	// Clear table
	var accounts = await web3.eth.getAccounts();
	// Set current account
	current_account_e.innerText = accounts[0];
	if (accounts != undefined && accounts.length != 0) {
		var currentAccount = accounts[0];
		var tokenAddresses = await exchangeContract.methods.getListOfSupportedTokens().call();
		for (var i = 0; i < tokenAddresses.length; i++) {
			// Nếu tokenAddress[i] khác default value của address (dành riêng cho ETH)
			// thì query để lấy về Token's symbol
			if (tokenAddresses[i] != '0x0000000000000000000000000000000000000000') {
				var tokenContract = new web3.eth.Contract(TokenABI, tokenAddresses[i]);
				// Get symbol
				var symbol = await tokenContract.methods.symbol().call();
				var balance = await tokenContract.methods.balanceOf(currentAccount).call();
				fillBalanceDetailOfAToken(symbol, (balance / Math.pow(10, 18)).toFixed(4));
			} else {
				var balance = await web3.eth.getBalance(currentAccount);
				fillBalanceDetailOfAToken("ETH", (balance / Math.pow(10, 18)).toFixed(4));
			}
		}
	}
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

getAccountBalance();
setInterval(getAccountBalance, 10000);
setInterval(update_counter, 1000);