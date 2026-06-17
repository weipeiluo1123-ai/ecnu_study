/*
 * @lc app=leetcode.cn id=2024 lang=cpp
 *
 * [2024] 考试的最大困扰度
 */

// @lc code=start
class Solution {
public:
    int maxConsecutiveAnswers(string answerKey, int k) {
        int l = 0, obs = 0, ans = 0;
        // 找全T的最长
        for (int r=0; r<answerKey.size(); r++) {
            if(answerKey[r]=='F') obs++;

            while (obs > k) {
                if(answerKey[l]=='F') obs--;
                l++;
            }
            ans = max(ans, r-l+1);
        }
        obs = 0;
        l = 0;
        // 找全F的最长
        for (int r=0; r<answerKey.size(); r++) {
            if(answerKey[r]=='T') obs++;

            while (obs > k) {
                if(answerKey[l]=='T') obs--;
                l++;
            }
            ans = max(ans, r-l+1);
        }

        return ans;
    }
};
// @lc code=end

