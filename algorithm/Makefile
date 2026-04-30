CFLAGS = -std=c++17 -O2 -Wall -Wextra -Iinclude
SRC    = $(wildcard leetcode/*.cpp)
BIN    = $(SRC:.cpp=)

all: $(BIN)

leetcode/%: leetcode/%.cpp
	g++ $(CFLAGS) -o $@ $<

run: leetcode/1_two_sum
	./leetcode/1_two_sum

clean:
	rm -f leetcode/*.out leetcode/*.dSYM
	rm -rf leetcode/*.dSYM

.PHONY: all run clean
