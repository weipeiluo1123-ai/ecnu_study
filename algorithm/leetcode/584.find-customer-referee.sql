--
-- @lc app=leetcode id=584 lang=mysql
--
-- [584] Find Customer Referee
--

-- @lc code=start
# Write your MySQL query statement below
SELECT name 
FROM Customer 
where referee_id IS NULL OR referee_id != 2;
-- @lc code=end

