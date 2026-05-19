/*
 * @lc app=leetcode id=258 lang=cpp
 *
 * [258] Add Digits
 */

// @lc code=start
class Solution {
public:
    int addDigits(int num) {

        int sum = 0;

        do{
            while(num/10 != 0){
                sum += num % 10;
                num /= 10;
            }
            num = sum + num;
            sum = 0;
        } while(num > 9);

        return num;
    }
};
// @lc code=end

