/*
 * @lc app=leetcode.cn id=1004 lang=cpp
 *
 * [1004] 最大连续1的个数 III
 */

// @lc code=start
class Solution {
public:
    int longestOnes(vector<int>& nums, int k) {
        int l = 0, zeroCount = 0, ans = 0;

        for (int r = 0; r < nums.size(); r++) {
            if (nums[r] == 0) zeroCount++;

            while (zeroCount > k) {
                if (nums[l] == 0) zeroCount--;
                l++;
            }
            ans = max (ans, r - l + 1);
        }
        return ans;
    }
};
// @lc code=end

