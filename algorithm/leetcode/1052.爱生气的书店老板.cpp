/*
 * @lc app=leetcode.cn id=1052 lang=cpp
 *
 * [1052] 爱生气的书店老板
 */

// @lc code=start
class Solution {
public:
    int maxSatisfied(vector<int>& customers, vector<int>& grumpy, int minutes) {
        // 基础满意度
        int satisfied_customer = 0;
        for(int i=0; i<customers.size(); i++) {
            if(grumpy[i] == 0){
                satisfied_customer += customers[i];
            }
        }

        // 初始额外满意度
        int ex_satisfied_customer = 0, max_ex_satisfied_customer = 0;
        for(int i=0; i<minutes; i++) {
            if (grumpy[i] == 1) {
                ex_satisfied_customer += customers[i];
            }
        }
        max_ex_satisfied_customer = ex_satisfied_customer;

        int i = minutes;
        while(i<customers.size()){
            if(grumpy[i] == 1) {
                ex_satisfied_customer+=customers[i];
            }
            if(grumpy[i-minutes] == 1){
                ex_satisfied_customer-=customers[i-minutes];
            }
            max_ex_satisfied_customer = max(max_ex_satisfied_customer, ex_satisfied_customer);
            i++;
        }

        return satisfied_customer + max_ex_satisfied_customer;
    }
};
// @lc code=end

