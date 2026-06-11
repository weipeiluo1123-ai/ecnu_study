/*
 * @lc app=leetcode.cn id=2090 lang=cpp
 *
 * [2090] 半径为 k 的子数组平均值
 */

// @lc code=start
class Solution {
public:
    vector<int> getAverages(vector<int>& nums, int k) {
        // 初始化返回数据，值全为-1
        vector<int> ans(nums.size(), -1);

        // 边界处理
        if (2*k+1 > nums.size()) return ans;

        // 先算下标为k的平均值
        long long temp = 0;
        for(int i=0; i<=2*k; i++){
            temp += nums[i];
        }
        ans[k] = temp/(2*k+1);

        // 下标从k到n-1-k
        int i = k+1;
        while(i<=nums.size()-1-k){
            temp -= nums[i-k-1];
            temp += nums[i+k];
            ans[i] = temp/(2*k+1);
            i++;
        }
                

        return ans;
        
    }
};
// @lc code=end

