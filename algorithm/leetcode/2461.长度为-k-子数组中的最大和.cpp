/*
 * @lc app=leetcode.cn id=2461 lang=cpp
 *
 * [2461] 长度为 K 子数组中的最大和
 */

// @lc code=start
class Solution {
public:
    long long maximumSubarraySum(vector<int>& nums, int k) {
        unordered_map<int, int> freq;
        long long ans = 0, sum = 0;
        
        for(int i=0;i<k;i++){
            freq[nums[i]]++;
            ans += nums[i];
        }
        if(freq.size() == k){
            sum = max(sum, ans);
        }

        int i = k;
        while(i<nums.size()){
            ans += nums[i];
            ans -= nums[i-k];
            freq[nums[i]]++;
            freq[nums[i-k]]--;
            if(freq[nums[i-k]] == 0){
                freq.erase(nums[i-k]);
            }
            if(freq.size() == k){
                sum = max(sum, ans);
            }
            i++;
        }
        return sum;

    }
};
// @lc code=end

