/*
 * @lc app=leetcode.cn id=904 lang=cpp
 *
 * [904] 水果成篮
 */

// @lc code=start
class Solution {
public:
    int totalFruit(vector<int>& fruits) {
        int l = 0, types = 0, ans = 0;
        vector<int> cnt(100005, 0);

        for (int r = 0; r < fruits.size(); r++) {
            if(cnt[fruits[r]] == 0){
                types++;
            }  
            cnt[fruits[r]]++;

            while (types > 2) {
                if(cnt[fruits[l]] == 1){
                    types--;
                } 
                cnt[fruits[l]]--;
                l++;
            }

            ans = max(ans, r-l+1);
        }

        return ans;
    }
};
// @lc code=end

