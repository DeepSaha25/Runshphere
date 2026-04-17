cmake_minimum_required(VERSION 3.13)
set(CMAKE_VERBOSE_MAKEFILE on)

project(appmodules)

include(${REACT_ANDROID_DIR}/cmake-utils/ReactNative-application.cmake)

target_link_libraries(appmodules c++_shared)

foreach(autolinked_library ${AUTOLINKED_LIBRARIES})
  if(TARGET ${autolinked_library})
    target_link_libraries(${autolinked_library} c++_shared)
  endif()
endforeach()
