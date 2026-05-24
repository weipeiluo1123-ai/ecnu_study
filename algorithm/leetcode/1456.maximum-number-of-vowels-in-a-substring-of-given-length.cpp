/*
 * @lc app=leetcode id=1456 lang=cpp
 *
 * [1456] Maximum Number of Vowels in a Substring of Given Length
 */

// @lc code=start
class Solution {
public:
    int maxVowels(string s, int k) {
        
        int ans = 0;
        
        for(int i=0;i<k;i++){
            if(s[i] == 'a' || s[i] == 'e' || s[i] == 'i' || s[i] == 'o' || s[i] == 'u'){
                ans++;
            }
        }

        int res = ans;
        int i = k;

        while(i<=(s.size()-1)){
            if(s[i] == 'a' || s[i] == 'e' || s[i] == 'i' || s[i] == 'o' || s[i] == 'u'){
                ans++;
            }
            if(s[i-k] == 'a' || s[i-k] == 'e' || s[i-k] == 'i' || s[i-k] == 'o' || s[i-k] == 'u'){
                ans--;
            }
            i++;
            res = max(res, ans);
        }

        return res;
    }
};
// @lc code=end

