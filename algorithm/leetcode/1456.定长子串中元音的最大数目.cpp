/*
 * @lc app=leetcode.cn id=1456 lang=cpp
 *
 * [1456] 定长子串中元音的最大数目
 */

// @lc code=start
class Solution {
public:
    int maxVowels(string s, int k) {
        int ans = 0;
        // 统计第一个长度为k的子字符串的元音字符数
        for(int i=0; i<k; i++){
            if(s[i] == 'a' || s[i] == 'e' || s[i] == 'i' || s[i] == 'o' || s[i] == 'u'){
                ans++;
            }
        }

        int max_ans = ans;
        int i = k;
        while(i<s.size()){
            if(s[i] == 'a' || s[i] == 'e' || s[i] == 'i' || s[i] == 'o' || s[i] == 'u'){
                ans++;
            }
            if(s[i-k] == 'a' || s[i-k] == 'e' || s[i-k] == 'i' || s[i-k] == 'o' || s[i-k] == 'u'){
                ans--;
            }
            max_ans = max(max_ans, ans);
            i++;
        }

        return max_ans;
    }
};
// @lc code=end

