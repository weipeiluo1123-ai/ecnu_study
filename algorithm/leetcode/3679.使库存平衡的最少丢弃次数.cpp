/*
 * @lc app=leetcode.cn id=3679 lang=cpp
 *
 * [3679] 使库存平衡的最少丢弃次数
 */

// @lc code=start
class Solution {
public:
    int minArrivalsToDiscard(vector<int>& arrivals, int w, int m) {
        int cnt[100005] = {0};
        int ans = 0;
        for(int i=0; i<arrivals.size(); i++){
            if(i>=w){
                if(arrivals[i-w]!=0){
                    cnt[arrivals[i-w]]--;
                }
            }
            if(cnt[arrivals[i]] < m){
                cnt[arrivals[i]]++;
            }
            else{
                ans++;
                arrivals[i] = 0;
            }
        }

        return ans;
    }
};
// @lc code=end

