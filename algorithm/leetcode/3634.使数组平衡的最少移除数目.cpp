/*
 * @lc app=leetcode.cn id=3634 lang=cpp
 *
 * [3634] 使数组平衡的最少移除数目
 */

// @lc code=start
class Solution {
public:
    int minRemoval(vector<int>& nums, int k) {
        sort(nums.begin(), nums.end());

        int l = 0, ans = 0;

        for (int r = 0; r < nums.size(); r++){
            while ((long long)nums[l] * k < nums[r]) {
                l++;
            }
            ans = max(ans, r-l+1);
        }
        return nums.size() - ans;
    }
};
// @lc code=end

