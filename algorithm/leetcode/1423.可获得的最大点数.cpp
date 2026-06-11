/*
 * @lc app=leetcode.cn id=1423 lang=cpp
 *
 * [1423] 可获得的最大点数
 */

// @lc code=start
class Solution {
public:
    int maxScore(vector<int>& cardPoints, int k) {
        // 可获得最大点数 ➡️ 定长活动窗口最小值
        int sum = 0, ans = 1e5 + 10;
        int window_size = cardPoints.size() - k;
        for(int i=0; i < window_size; i++) {
            sum += cardPoints[i];
        }
        ans = sum;

        int i = window_size;
        while(i<cardPoints.size()){
            sum+=cardPoints[i];
            sum-=cardPoints[i-window_size];
            ans = min(sum, ans);
            i++;
        }

        int arrSum = 0;
        for(int j=0; j<cardPoints.size(); j++){
            arrSum += cardPoints[j];
        }

        return arrSum - ans;
    }
};
// @lc code=end

