/*
 * @lc app=leetcode.cn id=1343 lang=cpp
 *
 * [1343] 大小为 K 且平均值大于等于阈值的子数组数目
 */

// @lc code=start
class Solution {
public:
    int numOfSubarrays(vector<int>& arr, int k, int threshold) {
        int bigThreshold = threshold * k;

        int value = 0;
        int ans = 0;

        for(int i=0; i<k; i++){
            value+=arr[i];
        }
        if(value >= bigThreshold)
            ans++;

        int i = k;
        while(i<=arr.size()-1){
            value-=arr[i-k];
            value+=arr[i];
            if(value >= bigThreshold) ans++;
            i++;
        }

        return ans;
    }
};
// @lc code=end

