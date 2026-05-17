/*
 * @lc app=leetcode id=2469 lang=cpp
 *
 * [2469] Convert the Temperature
 */

// @lc code=start
class Solution {
public:
    vector<double> convertTemperature(double celsius) {
        double kelvin = celsius + 273.15;
        double fahrenheit = celsius * 1.80 + 32.00;
        return {kelvin, fahrenheit};
    }
};
// @lc code=end

