/*
 * @lc app=leetcode.cn id=2841 lang=cpp
 *
 * [2841] 几乎唯一子数组的最大和
 */

// @lc code=start
class Solution {
public:
    long long maxSum(vector<int>& nums, int m, int k) {
        unordered_map<int, int> freq;
        long long sum = 0, max_sum = 0;
        for(int i=0; i<k; i++) {
            freq[nums[i]]++;
            sum += nums[i];
        }
        if(freq.size() >= m) max_sum = sum;

        int i = k;
        while(i<nums.size()) {
            freq[nums[i]]++;
            freq[nums[i-k]]--;
            sum+=nums[i];
            sum-=nums[i-k];
            if(freq[nums[i-k]] == 0){
                freq.erase(nums[i-k]);
            }
            if(freq.size() >= m){
                max_sum = max(max_sum, sum);
            }
            i++;
        }

        return max_sum;
    }
};
// @lc code=end

