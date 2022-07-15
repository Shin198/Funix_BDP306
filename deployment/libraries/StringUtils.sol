pragma solidity ^0.4.17;
library StringUtils {
    /// @dev Does a byte-by-byte lexicographical comparison of two strings.
    /// @return a negative number if `_a` is smaller, zero if they are equal
    /// and a positive numbe if `_b` is smaller.
    function compare(string _a, string _b) returns (int) {
        bytes memory a = bytes(_a);
        bytes memory b = bytes(_b);
        uint minLength = a.length;
        if (b.length < minLength) minLength = b.length;
        //@todo unroll the loop into increments of 32 and do full 32 byte comparisons
        for (uint i = 0; i < minLength; i ++)
            if (a[i] < b[i])
                return -1;
            else if (a[i] > b[i])
                return 1;
        if (a.length < b.length)
            return -1;
        else if (a.length > b.length)
            return 1;
        else
            return 0;
    }
    /// @dev Compares two strings and returns true iff they are equal.
    function equal(string _a, string _b) returns (bool) {
        return compare(_a, _b) == 0;
    }
    
    // Convert string to int
    // parseInt
    function parseInt(string _a) public view  returns (uint) {
        return parseIntPrivate(_a, 0);
    }

    // parseInt(parseFloat*10^_b)
    function parseIntPrivate(string _a, uint _b) private returns (uint) {
        bytes memory bresult = bytes(_a);
        uint mint = 0;
        bool decimals = false;
        for (uint i=0; i<bresult.length; i++){
            if ((bresult[i] >= 48)&&(bresult[i] <= 57)){
                if (decimals){
                   if (_b == 0) break;
                    else _b--;
                }
                mint *= 10;
                mint += uint(bresult[i]) - 48;
            } else if (bresult[i] == 46) decimals = true;
        }
        if (_b > 0) mint *= 10**_b;
        return mint;
    }
    
    // Get slice of string
    function getSliceOfString(uint256 begin, uint256 end, string text) public pure returns (string) {
        bytes memory a = new bytes(end-begin+1);
        for(uint i=begin; i<= end; i++){
            a[i - begin] = bytes(text)[i];
        }
        return string(a);    
    }
    
    function getIndexOfDotInStringOfFloat(string stringOfFloat, string dot) public view returns (uint256) {
        bytes memory bytesText = bytes(stringOfFloat);
        bytes memory bytesOfDot = bytes(dot);
        for(uint256 i = 0; i < bytesText.length; i++) {
            if (bytesText[i] < bytesOfDot[0]) {
                continue;
            }
            else if (bytesText[i] > bytesOfDot[0]) {
                continue;
            }
            return i;
        }
        return 100000;
    }
    
    function convertStringOfFloatToInt(string stringOfFloat) public view returns (uint256) {
        // Get index of dot
        uint256 indexOfDot = getIndexOfDotInStringOfFloat(stringOfFloat, ".");
        // Nếu kết quả trả về là '100000' thì có nghĩa là chuỗi 'stringOfFloat' không chứa dấu chấm
        // trả về trực tiếp giá trị parseInt nhân 10^18
        if (indexOfDot == 100000) {
            return parseInt(stringOfFloat) * (10**18);
        }
        // Nếu kết quả trả về khác
        string memory part1 = getSliceOfString(0, indexOfDot - 1, stringOfFloat);
        string memory part2 = getSliceOfString(indexOfDot + 1, bytes(stringOfFloat).length - 1, stringOfFloat);
        uint256 part2pow;
        if (bytes(part2).length >= 18) {
            part2pow = 0;
        } else {
            part2pow = 18 - bytes(part2).length;
        }
        uint256 part1Int = parseInt(part1) * (10**18);
        uint256 part2Int = parseInt(part2) * (10**part2pow);
        return part1Int + part2Int;
    }
}