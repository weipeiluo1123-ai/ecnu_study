/*
 * @lc app=leetcode.cn id=1695 lang=cpp
 *
 * [1695] 删除子数组的最大得分
 */

// @lc code=start
class Solution {
public:
    int maximumUniqueSubarray(vector<int>& nums) {

        //哈希写法 (数组写法更快)
        unordered_map<int, int> cnt;
        int l = 0, sum = 0, ans = 0;

        for (int r = 0; r < nums.size(); r++){
            cnt[nums[r]]++;
            sum += nums[r];

            while (cnt[nums[r]] > 1) {
                sum -= nums[l];
                cnt[nums[l]]--;
                l++;
            }

            ans = max(ans, sum);
        }
        return ans;
    }
};
// @lc code=end

