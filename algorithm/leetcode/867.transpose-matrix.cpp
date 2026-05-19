/*
 * @lc app=leetcode id=867 lang=cpp
 *
 * [867] Transpose Matrix
 */

// @lc code=start
class Solution {
public:
    vector<vector<int>> transpose(vector<vector<int>>& matrix) {
        int rows = matrix.size();
        int cols = matrix[0].size();
        vector<vector<int>> reverse_matrix(cols, vector<int>(rows));
        for(int i=0;i<rows;i++){
            for(int j=0;j<cols;j++){
                reverse_matrix[j][i] = matrix[i][j];
            }
        }
        return reverse_matrix;
    }
};
// @lc code=end

