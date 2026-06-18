/*
 * @lc app=leetcode.cn id=3795 lang=cpp
 *
 * [3795] 不同元素和至少为 K 的最短子数组长度
 */

// @lc code=start
class Solution {
public:
    int minLength(vector<int>& nums, int k) {
        int l = 0, sum = 0, ans = 100005;
        vector<int> cnt(100005, 0);

        for(int r=0; r<nums.size(); r++){
            cnt[nums[r]]++;
            if(cnt[nums[r]]==1) sum+=nums[r]; 
            while (sum >= k){
                ans = min(ans, r-l+1);
                if(cnt[nums[l]]==1) sum-=nums[l];
                cnt[nums[l]]--;
                l++;
            }
        }

        return ans==100005?-1:ans;
    }
};
// @lc code=end

