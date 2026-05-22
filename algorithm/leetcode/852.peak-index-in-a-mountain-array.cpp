/*
 * @lc app=leetcode id=852 lang=cpp
 *
 * [852] Peak Index in a Mountain Array
 */

// @lc code=start
class Solution {
public:
    int peakIndexInMountainArray(vector<int>& arr) {
        int left = 0, right = arr.size()-1;
        int mid = left + (right-left)/2;
        
        while(left < right){
            if(arr[mid] < arr[mid+1]){
                left = mid + 1;
                mid = left + (right-left)/2;
            }
            else if(arr[mid] > arr[mid+1]){
                right = mid;
                mid = left + (right-left)/2;
            }
        }
        return mid;
    }
};
// @lc code=end

