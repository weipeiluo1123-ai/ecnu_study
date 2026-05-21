/*
 * @lc app=leetcode id=1422 lang=cpp
 *
 * [1422] Maximum Score After Splitting a String
 */

// @lc code=start
class Solution {
public:
    int maxScore(string s) {
        
        int score = 0, max_score=0;

        // 初始情况左子串1位，右子串n-1位的分数
        if(s[0]=='0') score++;
        for(int i=1;i<s.size();i++){
            if(s[i]=='1') score++;
        }

        max_score = score;

        for(int i=1;i<s.size()-1;i++){
            if(s[i] == '0') score++;
            else if(s[i] == '1') score--;
            max_score = max(max_score, score);
        }

        return max_score;
    }
};
// @lc code=end

