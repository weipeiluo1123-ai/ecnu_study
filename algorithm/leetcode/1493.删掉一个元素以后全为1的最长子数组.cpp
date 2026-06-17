/*
 * @lc app=leetcode.cn id=1493 lang=cpp
 *
 * [1493] 删掉一个元素以后全为 1 的最长子数组
 */

// @lc code=start
class Solution {
public:
    int longestSubarray(vector<int>& nums) {
            int zeroCount = 0, ans = 0, l = 0;
            for (int r = 0; r < nums.size(); r++) {
                if (nums[r] == 0){
                    zeroCount++;
                }
                while (zeroCount > 1) {
                    if(nums[l] == 0){
                        zeroCount--;
                    }
                    l++;
                }
                ans = max(ans, r-l);
            }
            return ans;
    }
};
// @lc code=end

