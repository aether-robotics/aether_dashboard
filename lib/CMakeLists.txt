cmake_minimum_required(VERSION 3.16)
project(fk_engine CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_executable(fk_engine
    src/fk_engine.cpp
    src/sdf_parser.cpp
    src/urdf_parser.cpp
    third_party/tinyxml2/tinyxml2.cpp
)

target_include_directories(fk_engine PRIVATE
    include
    src
    third_party/tinyxml2
)

if(EMSCRIPTEN)
    set_target_properties(fk_engine PROPERTIES
        SUFFIX ".js"
        OUTPUT_NAME "fk_engine"
    )
    target_link_options(fk_engine PRIVATE
        "SHELL:-sEXPORTED_FUNCTIONS=['_fk_load_model','_fk_destroy','_fk_link_count','_fk_get_link_names','_fk_visual_count','_fk_visual_uri','_fk_visual_local_matrix','_fk_compute','_fk_root_link','_fk_joint_count','_fk_joint_name','_fk_joint_type','_fk_joint_parent_link','_fk_joint_child_link','_fk_joint_axis','_fk_joint_transform','_malloc','_free']"
        "SHELL:-sEXPORTED_RUNTIME_METHODS=['ccall','cwrap','UTF8ToString','stringToUTF8','lengthBytesUTF8','HEAPU8','HEAPF32']"
        "SHELL:-sALLOW_MEMORY_GROWTH=1"
        "SHELL:-sMODULARIZE=1"
        "SHELL:-sEXPORT_ES6=1"
        "SHELL:-sEXPORT_NAME=FkEngineModule"
        "SHELL:-sINITIAL_MEMORY=33554432"
        "SHELL:--no-entry"
        -O2
    )
endif()
