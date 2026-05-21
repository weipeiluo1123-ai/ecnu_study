/*
 * @lc app=leetcode id=2586 lang=cpp
 *
 * [2586] Count the Number of Vowel Strings in Range
 */

// @lc code=start
class Solution {
public:
    int vowelStrings(vector<string>& words, int left, int right) {
        int ans = 0;
        for(int i=left; i<=right; i++){
            if((words[i].front()=='a' || words[i].front() == 'e' || words[i].front() == 'i' || words[i].front() == 'o' || words[i].front() == 'u') && (words[i].back()=='a' || words[i].back() == 'e' || words[i].back() == 'i' || words[i].back() == 'o' || words[i].back() == 'u'))
                ans++;
        }
        return ans;
    }
};
// @lc code=end

