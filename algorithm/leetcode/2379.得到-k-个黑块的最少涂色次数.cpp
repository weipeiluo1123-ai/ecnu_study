/*
 * @lc app=leetcode.cn id=2379 lang=cpp
 *
 * [2379] 得到 K 个黑块的最少涂色次数
 */

// @lc code=start
class Solution {
public:
    int minimumRecolors(string blocks, int k) {
        // 题意：找到白色块最少的子串，返回白色块的个数
        int ans = 0; //用于统计子串的白色块个数

        // 首个子串白块个数
        for(int i = 0; i < k; i++){
            if(blocks[i] == 'W'){
                ans++;
            }
        }
        
        int min_ans = ans;
        int i = k;

        while(i < blocks.size()){
            if(blocks[i] == 'W') ans++;
            if(blocks[i-k] == 'W') ans--;
            min_ans = min(min_ans, ans);
            i++;
        }

        return min_ans;

    }
};
// @lc code=end

