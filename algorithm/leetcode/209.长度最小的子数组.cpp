/*
 * @lc app=leetcode.cn id=209 lang=cpp
 *
 * [209] 长度最小的子数组
 */

// @lc code=start
class Solution {
public:
    int minSubArrayLen(int target, vector<int>& nums) {
        int l=0, sum=0, ans=100005;
        for(int r=0;r<nums.size();r++){
            sum+=nums[r];
            while(sum>=target) {
                ans = min(ans, r-l+1);
                sum-=nums[l];
                l++;
            }
        }
        return ans==100005?0:ans;
    }
};
// @lc code=end

