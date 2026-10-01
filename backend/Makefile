CC ?= gcc
CXX ?= g++
CFLAGS = -O2
CXXFLAGS = -std=c++17 -Wall -O2 -Ithird_party

ifeq ($(OS),Windows_NT)
    TARGET = server.exe
    LIBS = -lws2_32
    RM = del /f /q
else
    TARGET = server
    LIBS = -pthread -ldl
    RM = rm -f
endif

all: $(TARGET)

sqlite3.o: third_party/sqlite/sqlite3.c
	$(CC) $(CFLAGS) -c third_party/sqlite/sqlite3.c -o sqlite3.o

$(TARGET): main.cpp database.cpp sqlite3.o
	$(CXX) $(CXXFLAGS) main.cpp database.cpp sqlite3.o -o $(TARGET) $(LIBS)

clean:
	$(RM) $(TARGET) *.o

