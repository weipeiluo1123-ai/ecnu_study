/*
 * @lc app=leetcode.cn id=643 lang=cpp
 *
 * [643] 子数组最大平均数 I
 */

// @lc code=start
class Solution {
public:
    double findMaxAverage(vector<int>& nums, int k) {
        // 初始状态下数组的值
        int value = 0;
        for(int i=0; i<k; i++){
            value+=nums[i];
        }

        int ans = value;
        double i = k;
        while(i<=nums.size()-1){
            value-=nums[i-k];
            value+=nums[i];
            ans=max(ans, value);
            i++;
        }
        return (double)ans/k;
    }
};
// @lc code=end

