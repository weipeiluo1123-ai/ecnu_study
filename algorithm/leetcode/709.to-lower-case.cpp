/*
 * @lc app=leetcode id=709 lang=cpp
 *
 * [709] To Lower Case
 */

// @lc code=start
class Solution {
public:
    string toLowerCase(string s) {
        for(char &c:s){
            if(c>='A'&&c<='Z') c += 32;
        }
        return s;
    }
};
// @lc code=end

