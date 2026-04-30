/*
 * @lc app=leetcode id=1 lang=cpp
 *
 * [1] Two Sum
 */

// @lc code=start
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> mp;
        for (int i = 0; i < (int)nums.size(); ++i){
            int need = target - nums[i];
            if (mp.count(need)) return {mp[need], i};
            mp[nums[i]] = i;
        }
        return {};
    }
};
// @lc code=end

