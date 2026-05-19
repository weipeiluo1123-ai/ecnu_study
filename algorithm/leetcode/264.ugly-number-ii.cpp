/*
 * @lc app=leetcode id=264 lang=cpp
 *
 * [264] Ugly Number II
 */

// @lc code=start
class Solution {
public:
    int nthUglyNumber(int n) {
        if(n<=0) return false;
        while(n%2==0||n%3==0||n%5==0){
            if(n%2==0) n/=2;
            else if(n%3==0) n/=3;
            else n/=5;
        }
        return n==1;
    }
};
// @lc code=end

