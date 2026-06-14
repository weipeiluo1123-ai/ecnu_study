/*
 * @lc app=leetcode.cn id=3090 lang=cpp
 *
 * [3090] 每个字符最多出现两次的最长子字符串
 */

// @lc code=start
class Solution {
public:
    int maximumLengthSubstring(string s) {
        unordered_map<char, int> cnt;
        int l = 0, ans = 0;

        for (int r = 0; r < s.size(); r++){
            cnt[s[r]]++;
            while (cnt[s[r]] > 2) {
                cnt[s[l]]--;
                l++;
            }
            ans = max(ans, r - l + 1);
        }

        return ans;
    }
};
// @lc code=end

